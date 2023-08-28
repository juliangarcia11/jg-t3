import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { filterUserForClient } from "@/server/helpers";
import type { Session, User } from "next-auth";
import type { Post, PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

const addUserDataToPosts = async (
  ctx: {
    session: Session | null;
    prisma: PrismaClient;
  },
  posts: Post[]
) => {
  // get users from DB & prepare them for client side xfer
  const users = (
    await ctx.prisma.user.findMany({
      take: 100,
      where: {
        id: {
          in: posts.map(({ creatorId }) => creatorId),
        },
      },
    })
  ).map(filterUserForClient);
  // map users to posts provided
  return posts.map((post) => mapPostUser(post, users));
};
const mapPostUser = (post: Post, users: User[]) => {
  const creator = users.find((user) => user.id === post.creatorId);

  if (!creator?.name)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Creator for post not found",
    });

  return { ...post, creator: { ...creator, name: creator.name } };
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) =>
    ctx.prisma.post
      .findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
      })
      .then((posts) => addUserDataToPosts(ctx, posts))
  ),

  getPostById: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(({ ctx, input }) =>
      ctx.prisma.post
        .findUniqueOrThrow({
          where: {
            id: input.id,
          },
        })
        .then((post) => addUserDataToPosts(ctx, [post]))
        .then((posts) => posts.pop())
    ),

  getPostsByUserId: publicProcedure
    .input(z.object({ creatorId: z.string().min(1) }))
    .query(({ ctx, input }) =>
      ctx.prisma.post
        .findMany({
          where: {
            creatorId: input.creatorId,
          },
          take: 100,
          orderBy: { createdAt: "desc" },
        })
        .then((posts) => addUserDataToPosts(ctx, posts))
    ),

  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1, "Posts must have content!").max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const creatorId = ctx.session.user.id;

      const { success } = await ratelimit.limit(creatorId);
      if (!success)
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You can only post 3 times per minute",
        });

      return await ctx.prisma.post.create({
        data: { creatorId, content: input.content },
      });
    }),
});

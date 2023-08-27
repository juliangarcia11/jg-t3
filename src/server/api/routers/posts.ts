import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { filterUserForClient } from "@/server/helpers";
import type { User } from "next-auth";
import type { Post } from "@prisma/client";
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
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
    });
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

    return posts.map((post) => mapPostUser(post, users));
  }),

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

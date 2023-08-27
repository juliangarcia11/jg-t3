import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import type { User } from "next-auth";
import type { Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";

const filterUserForClient = ({ id, name, image }: User) => ({
  id,
  name,
  image,
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
    const posts = await ctx.prisma.post.findMany({ take: 100 });
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
});

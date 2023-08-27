import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { filterUserForClient } from "@/server/helpers";

export const usersRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input: { id } }) => {
      const user = await ctx.prisma.user.findFirst({ where: { id } });
      if (!user)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The user you're looking for does not exist",
        });

      return filterUserForClient(user);
    }),

  getByName: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input: { name } }) => {
      const user = await ctx.prisma.user.findFirst({ where: { name } });

      if (!user)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The user you're looking for does not exist",
        });

      return filterUserForClient(user);
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany();
    if (!users)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "There are no users to be found",
      });

    return users.map(filterUserForClient);
  }),
});

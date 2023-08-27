import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const usersRouter = createTRPCRouter({
  getOne: publicProcedure
    .input(z.object({ id: z.string().optional(), name: z.string().optional() }))
    .query(({ ctx, input: { id, name } }) => {
      if (!id && !name)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "user id and name are null but at least one is required",
        });

      let where;
      if (id) where = { id };
      if (name) where = { name };

      return ctx.prisma.user.findFirst({ where });
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),
});

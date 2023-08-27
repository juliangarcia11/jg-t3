import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const usersRouter = createTRPCRouter({
  getOne: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(({ ctx, input: { id } }) => {
      return ctx.prisma.user.findFirst({
        where: {
          id,
        },
      });
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),
});

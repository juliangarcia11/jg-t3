import type { User } from "next-auth";

export const filterUserForClient = ({ id, name, image }: User) => ({
  id,
  name,
  image,
});

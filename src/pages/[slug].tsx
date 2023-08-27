import Head from "next/head";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage } from "@/components";
import { api } from "@/utils/api";
import { appRouter } from "@/server/api/root";
import superjson from "superjson";
import { createServerSideHelpers } from "@trpc/react-query/server";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import { prisma } from "@/server/db";

dayjs.extend(relativeTime);

export async function getStaticProps(
  context: GetStaticPropsContext<{
    slug: string;
  }>
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, session: null },
    transformer: superjson,
  });
  const slug = context.params?.slug;

  if (!slug) throw new Error("Missing slug");
  const name = slug.replace(/^@/, "");
  /*
   * Prefetching the `user.getByName` query.
   * `prefetch` does not return the result and never throws - if you need that behavior, use `fetch` instead.
   */
  await helpers.users.getByName.prefetch({ name });
  // Make sure to return { props: { trpcState: helpers.dehydrate() } }
  return {
    props: {
      trpcState: helpers.dehydrate(),
      name,
    },
  };
}

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    // https://nextjs.org/docs/pages/api-reference/functions/get-static-paths#fallback-blocking
    fallback: "blocking",
  };
};

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;
const ProfilePage: NextPage<PageProps> = ({ name }: PageProps) => {
  const { data, isLoading, isError } = api.users.getByName.useQuery({ name });

  if (isLoading) return <LoadingPage />;
  if (isError) return "Something went wrong";
  if (!data) return "Profile not found";

  return (
    <>
      <Head>
        <title>{`@${data.name}'s Profile`}</title>
        <meta name="description" content="Exploring the t3 stack" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">{`Profile View: @${data.name}`}</main>
    </>
  );
};
export default ProfilePage;

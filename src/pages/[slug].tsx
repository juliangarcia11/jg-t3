import Head from "next/head";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
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
import { PageLayout } from "@/components";
import Image from "next/image";

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
  const { data } = api.users.getByName.useQuery({ name });

  if (!data) return "Profile not found";

  return (
    <>
      <Head>
        <title>{`@${data.name}'s Profile`}</title>
        <meta name="description" content="Exploring the t3 stack" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <div className="relative h-36 bg-stone-200/20 font-semibold italic">
          <Image
            src={data.image!}
            alt={`@${data.name}'s profile image`}
            className="absolute bottom-0 left-0 -mb-16 ml-4 rounded-full border-4 border-black/70 bg-black"
            width={128}
            height={128}
          />
        </div>
        {/* spacer */}
        <div className="h-16">{""}</div>
        {/* user info */}
        <div className="p-4 text-2xl font-bold">{`@${data.name}`}</div>
        <div className="w-full border-b border-stone-400"></div>
      </PageLayout>
    </>
  );
};
export default ProfilePage;

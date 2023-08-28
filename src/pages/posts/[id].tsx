import Head from "next/head";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { api } from "@/utils/api";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import { PageLayout, PostView } from "@/components";
import { generateSSGHelper } from "@/server/helpers";

dayjs.extend(relativeTime);

export async function getStaticProps(
  context: GetStaticPropsContext<{
    id: string;
  }>
) {
  const ssg = generateSSGHelper();
  const id = context.params?.id;

  if (!id) throw new Error("Missing post id");
  /*
   * Prefetching the `posts.getPostById` query.
   * `prefetch` does not return the result and never throws - if you need that behavior, use `fetch` instead.
   */
  await ssg.posts.getPostById.prefetch({ id });
  // Make sure to return { props: { trpcState: helpers.dehydrate() } }
  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
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

type SinglePostPage = InferGetStaticPropsType<typeof getStaticProps>;
const SinglePostPage: NextPage<SinglePostPage> = ({ id }: SinglePostPage) => {
  const { data } = api.posts.getPostById.useQuery({ id });

  if (!data) return "Profile not found";

  return (
    <>
      <Head>
        <title>{`Post by @${data.creator.name}`}</title>
        <meta name="description" content="Exploring the t3 stack" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <PostView {...data} />
      </PageLayout>
    </>
  );
};
export default SinglePostPage;

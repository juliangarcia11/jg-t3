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
import { LoadingSpinner, PageLayout, PostView } from "@/components";
import Image from "next/image";
import { generateSSGHelper } from "@/server/helpers";

dayjs.extend(relativeTime);

export async function getStaticProps(
  context: GetStaticPropsContext<{
    slug: string;
  }>
) {
  const ssg = generateSSGHelper();
  const slug = context.params?.slug;

  if (!slug) throw new Error("Missing slug");
  const name = slug.replace(/^@/, "");
  /*
   * Prefetching the `user.getByName` query.
   * `prefetch` does not return the result and never throws - if you need that behavior, use `fetch` instead.
   */
  await ssg.users.getByName.prefetch({ name });
  // Make sure to return { props: { trpcState: helpers.dehydrate() } }
  return {
    props: {
      trpcState: ssg.dehydrate(),
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
        <div>
          <ProfileFeed creatorId={data.id} />
        </div>
      </PageLayout>
    </>
  );
};
export default ProfilePage;

const ProfileFeed = ({ creatorId }: { creatorId: string }) => {
  const { data, isLoading, isError } = api.posts.getPostsByUserId.useQuery({
    creatorId,
  });

  if (isLoading)
    return (
      <div className="flex h-36 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  if (isError) return "Something went wrong :(";
  if (!data.length) return "This user has no posts!";

  return data.map((post) => <PostView key={post.id} {...post} />);
};

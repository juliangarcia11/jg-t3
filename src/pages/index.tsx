import Head from "next/head";
import { api } from "@/utils/api";
import type { RouterOutputs } from "@/utils/api";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { formatDateToString } from "@/utils/formatDate";

export default function Home() {
  const { data: sessionData } = useSession();
  const { data, isLoading, isError } = api.posts.getAll.useQuery();

  if (isLoading || isError)
    return (
      <main className="flex h-screen w-screen content-center justify-center">
        {isLoading ? "Loading..." : "Something went wrong :("}
      </main>
    );

  return (
    <>
      <Head>
        <title>JG-T3</title>
        <meta name="description" content="Exploring the t3 stack" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="w-full border-x border-x-stone-400 md:max-w-2xl">
          {/* header toolbar */}
          <div className="flex w-full border-b border-b-stone-400 p-4">
            <div className="flex w-full items-center gap-4">
              <CreatePostWizard />
              <AuthButton hasSessionData={!!sessionData} />
            </div>
          </div>

          {/* posts */}
          <div className="flex flex-col">
            {!data.length && <div className="mx-auto p-8">No Posts!</div>}
            {data?.map((post: PostWithUser) => (
              <PostView key={post.id} {...post} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = ({ id, content, creator, createdAt }: PostWithUser) => (
  <div
    key={id}
    className="flex flex-row items-center gap-3 border-b border-b-stone-400 px-6 py-8"
  >
    {creator.image && (
      <Image
        className="h-6 w-6 rounded-full"
        width={100}
        height={100}
        src={creator.image}
        alt={"profile image"}
      />
    )}
    {!creator.image && <span className="h-6 w-6 rounded-full">👽</span>}
    <div className={`flex flex-col gap-y-1`}>
      <div className={`flex items-center gap-1 text-white/60`}>
        <span className={`font-bold`}>{`@${creator.name}`}</span>
        {" • "}
        <span className={`text-xs font-thin`}>
          {formatDateToString(new Date(createdAt))}
        </span>
      </div>
      <span className={`ml-2`}>{content}</span>
    </div>
  </div>
);

/**
 * Button to send the user through the Next Auth sign in & out process
 * @param hasSessionData
 * @constructor
 */
const AuthButton = ({ hasSessionData }: { hasSessionData: boolean }) => (
  <button
    className="rounded bg-white/10 px-3 py-2 font-semibold text-white no-underline transition hover:bg-white/20"
    onClick={hasSessionData ? () => void signOut() : () => void signIn()}
  >
    {hasSessionData ? "Sign out" : "Sign in"}
  </button>
);

const CreatePostWizard = () => {
  const { data: sessionData } = useSession();

  if (!sessionData) return null;

  return (
    <div className="flex grow gap-4">
      {!sessionData.user.image && (
        <h1 className="ml-2 text-2xl font-extrabold italic">jg-t3</h1>
      )}
      {sessionData.user.image && (
        <Image
          className="h-10 w-10 rounded-full"
          width={100}
          height={100}
          src={sessionData.user.image}
          alt={"profile image"}
        />
      )}
      <input
        className="grow rounded rounded-r-none bg-white/10 p-2"
        placeholder="If you have something nice to say..."
      />
    </div>
  );
};

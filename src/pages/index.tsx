import Head from "next/head";
import { api } from "@/utils/api";
import { signIn, signOut, useSession } from "next-auth/react";

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
            <div className="flex w-full justify-between">
              <SiteTitle />
              <AuthButton hasSessionData={!!sessionData} />
            </div>
          </div>

          {/* posts */}
          <div className="flex flex-col">
            {!data.length && <div className="mx-auto p-8">No Posts!</div>}
            {data?.map(({ id, content }) => (
              <div key={id} className="border-b border-b-stone-400 p-8">
                {content}
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

const SiteTitle = () => {
  return <h1 className="ml-2 text-2xl font-extrabold italic">jg-t3</h1>;
};

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

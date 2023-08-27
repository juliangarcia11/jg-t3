import Head from "next/head";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage } from "@/components";

dayjs.extend(relativeTime);

export default function PostPage() {
  const { status } = useSession();

  if (status === "loading") return <LoadingPage />;

  return (
    <>
      <Head>
        <title>JG-T3</title>
        <meta name="description" content="Exploring the t3 stack" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="w-full border-x border-x-stone-400 md:max-w-2xl">
          to be a post
        </div>
      </main>
    </>
  );
}

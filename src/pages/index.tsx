import { api } from "@/utils/api";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  LoadingSpinner,
  PageLayout,
  PostView,
  type PostWithUser,
  SiteLogo,
} from "@/components";
import { useState } from "react";
import toast from "react-hot-toast";

dayjs.extend(relativeTime);

export default function Home() {
  const { status } = useSession();

  // start the fetch for posts ASAP, the <Feed/> will use the cached api response
  api.posts.getAll.useQuery();

  return (
    <PageLayout isLoading={status === "loading"}>
      {/* header toolbar */}
      <div className="flex w-full border-b border-b-stone-400 p-4">
        <div className="flex w-full items-center gap-4">
          <CreatePostWizard />
          <AuthButton hasSessionData={status === "authenticated"} />
        </div>
      </div>
      <Feed />
    </PageLayout>
  );
}

const Feed = () => {
  const { data, isLoading, isError } = api.posts.getAll.useQuery();

  if (isLoading)
    return (
      <div className={`m-8 flex justify-center`}>
        <LoadingSpinner />
      </div>
    );

  if (isError) return <div>{"Something went wrong :("}</div>;

  return (
    <div className="flex flex-col">
      {!data.length && <div className="mx-auto p-8">No Posts!</div>}
      {data?.map((post: PostWithUser) => (
        <PostView key={post.id} {...post} />
      ))}
    </div>
  );
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

const CreatePostWizard = () => {
  const { data: sessionData } = useSession();
  const ctx = api.useContext();
  const [content, setContent] = useState("");
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setContent("");
      void ctx.posts.getAll.invalidate(); // add 'void' to tell ts we don't care what happens with 'invalidate'
    },
    onError: (error) => {
      // show a toast message checking for errors in this order:
      //  - zod errors
      //  - tRPC errors
      //  - catch all
      const errorMessage = error.data?.zodError?.fieldErrors.content;
      toast.error(
        errorMessage
          ? errorMessage.join(", ")
          : error.message
          ? error.message
          : "Failed to post. Please try again later!"
      );
    },
  });

  if (!sessionData) return null;

  const createPost = () => {
    mutate({ content });
  };

  return (
    <div className="flex grow gap-4">
      {!sessionData.user.image && <SiteLogo />}
      {sessionData.user.image && (
        <Image
          className="h-10 w-10 rounded-full"
          width={100}
          height={100}
          src={sessionData.user.image}
          alt={"your profile image"}
        />
      )}
      <div className={`flex grow items-center`}>
        <input
          className="disabled:bg-stone/40 grow rounded-l bg-white/10 p-2 disabled:mr-2 disabled:animate-pulse disabled:rounded"
          placeholder="If you have something nice to say..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isPosting}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (content !== "") {
                mutate({ content });
              }
            }
          }}
        />
        {!isPosting && (
          <button
            onClick={createPost}
            className={`rounded-r bg-white/10 px-3 py-2 font-semibold text-white no-underline transition hover:bg-white/20`}
          >
            Post
          </button>
        )}
        {isPosting && <LoadingSpinner size={20} />}
      </div>
    </div>
  );
};

import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import type { RouterOutputs } from "@/utils/api";

export type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = ({ id, content, creator, createdAt }: PostWithUser) => (
  <div
    key={id}
    className="flex flex-row items-center gap-4 border-b border-b-stone-400 px-4 py-8"
  >
    {creator.image && (
      <Image
        className="h-10 w-10 rounded-full"
        width={100}
        height={100}
        src={creator.image}
        alt={`@${creator.name}'s profile image`}
      />
    )}
    {!creator.image && <span className="h-6 w-6 rounded-full">👽</span>}
    <div className={`flex flex-col gap-y-1`}>
      <div className={`flex items-center gap-1 text-white/60`}>
        <Link href={`/@${creator.name}`}>
          <span className={`font-bold`}>{`@${creator.name}`}</span>
        </Link>
        {" • "}
        <Link href={`/posts/${id}`}>
          <span className={`text-xs font-thin`}>
            {dayjs(createdAt).fromNow()}
          </span>
        </Link>
      </div>
      <span className={`ml-2 text-xl`}>{content}</span>
    </div>
  </div>
);

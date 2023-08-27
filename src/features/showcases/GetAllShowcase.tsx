import { api } from "@/utils/api";
import { formatDateToString } from "@/utils/formatDate";

/**
 * Example of how to use our tRPC API to query the PlanetScale DB for a table of post items
 * @constructor
 */
export function GetAllShowcase() {
  const posts = api.posts.getAll.useQuery();
  return (
    <p className="rounded text-2xl text-white shadow-sm shadow-white">
      <span className={`m-4 font-bold`}>Posts:</span>
      {posts.data
        ? posts.data.map(({ id, createdAt, content }, index) => (
            <span
              key={id}
              className={`flex flex-row justify-center gap-x-8 gap-y-2 border-t`}
            >
              <span>
                <span className={`font-bold`}>{index}:</span>
              </span>
              <span>
                <span className={`font-bold`}>createdAt:</span>{" "}
                {formatDateToString(createdAt)}
              </span>
              <span>
                <span className={`font-bold`}>content:</span> {content}
              </span>
            </span>
          ))
        : "Loading tRPC query..."}
    </p>
  );
}

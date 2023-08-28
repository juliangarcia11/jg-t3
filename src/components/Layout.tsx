import type { PropsWithChildren } from "react";
import { LoadingPage } from "@/components";

interface PageLayoutProps {
  isLoading?: boolean;
}

export const PageLayout = ({
  isLoading = false,
  children,
}: PropsWithChildren<PageLayoutProps>) => {
  if (isLoading) return <LoadingPage />;

  return (
    <main className="flex h-screen justify-center">
      <div className="w-full overflow-y-scroll border-x border-x-stone-400 no-scrollbar md:max-w-2xl">
        {children}
      </div>
    </main>
  );
};

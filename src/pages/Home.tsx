import Cookies from "js-cookie";
import { ChatLayout } from "@/components/chat/chat-layout";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  const layoutCookie = Cookies.get("react-resizable-panels:layout");
  const defaultLayout = layoutCookie ? JSON.parse(layoutCookie) : undefined;

  return (
    <main className="flex h-[calc(100dvh)] flex-col items-center justify-center p-4 md:px-24 py-32 gap-4">
      <div className="flex justify-between max-w-5xl w-full items-center">
        <a href="#" className="text-4xl font-bold text-gradient">
          xmpp-chat
        </a>
        <a
          href="https://github.com/jakobhoeg/shadcn-chat"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-10 w-10"
          )}
        >
          <GitHubLogoIcon className="w-7 h-7 text-muted-foreground" />
        </a>
      </div>

      <div className="z-10 border rounded-lg max-w-5xl w-full h-full text-sm lg:flex">
        <ChatLayout defaultLayout={defaultLayout} navCollapsedSize={8} />
      </div>

      <div className="flex justify-between max-w-5xl w-full items-start text-xs md:text-sm text-muted-foreground ">
        <p className="max-w-[150px] sm:max-w-lg">
          Built by{" "}
          <a className="font-semibold" href="https://github.com/jakobhoeg/">
            Jakob Hoeg
          </a>
          . To be used with{" "}
          <a className="font-semibold" href="https://ui.shadcn.com/">
            shadcn
          </a>
          .
        </p>
        <p className="max-w-[150px] sm:max-w-lg text-right">
          Source code available on{" "}
          <a
            className="font-semibold"
            href="https://github.com/jakobhoeg/shadcn-chat"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </main>
  );
}

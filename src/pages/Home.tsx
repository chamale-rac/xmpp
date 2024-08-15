import Cookies from "js-cookie";
import { ChatLayout } from "@/components/chat/chat-layout";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { CircleCheck, Loader2 } from "lucide-react";
import { useXmpp } from "@/lib/hooks/useXmpp";
import { useEffect } from "react";

interface testCredentials {
  username: string;
  password: string;
}

const testCredentials: testCredentials = {
  username: "cha21881",
  password: "admin",
};

export default function Home() {
  const { isConnected, triggerConnection, setPresence } = useXmpp();

  useEffect(() => {
    if (!isConnected) {
      // Ensure triggerConnection is only called if not already connected
      triggerConnection(testCredentials.username, testCredentials.password);
    }
  }, [isConnected, triggerConnection]); // Add triggerConnection as a dependency

  const layoutCookie = Cookies.get("react-resizable-panels:layout");
  const defaultLayout = layoutCookie ? JSON.parse(layoutCookie) : undefined;

  return (
    <main className="flex h-[calc(100dvh)] flex-col items-center justify-center p-4 md:px-24 py-32 gap-4">
      <div className="flex justify-between max-w-5xl w-full items-center">
        <a
          onClick={() => setPresence("away")}
          href="#"
          className="text-4xl font-bold text-gradient mix-blend-exclusion"
        >
          xmpp ༼ つ ◕_◕ ༽つ
        </a>
        {/* https://tailwindcss.com/docs/mix-blend-mode */}
        <a
          href="https://github.com/jakobhoeg/shadcn-chat"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-10 w-10 mix-blend-exclusion"
          )}
        >
          <GitHubLogoIcon className="w-7 h-7 text-muted-foreground" />
        </a>
      </div>

      <div className="z-10 border rounded-lg max-w-5xl w-full h-full text-sm lg:flex mix-blend-exclusion">
        <ChatLayout defaultLayout={defaultLayout} navCollapsedSize={8} />
      </div>

      <div className="flex justify-between max-w-5xl w-full items-start text-xs md:text-sm text-muted-foreground ">
        <p></p>
        <p className="max-w-[150px] sm:max-w-lg text-right">
          {isConnected ? "Connected" : "Disconnected"} to{" "}
          <a
            className="font-semibold"
            href="http://alumchat.lol"
            target="_blank"
          >
            alumchat.lol
          </a>
          {isConnected ? (
            <CircleCheck className="w-4 h-4 inline-block ml-1 mb-1" />
          ) : (
            <Loader2 className="w-4 h-4 inline-block ml-1 mb-1 animate-spin duration-1000" />
          )}
        </p>
      </div>
    </main>
  );
}

import Cookies from "js-cookie";
import { ChatLayout } from "@/components/chat/chat-layout";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { AlertCircle, CircleCheck, Loader2 } from "lucide-react";
import { useXmpp } from "@/lib/hooks/useXmpp";
import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { useUser } from "@/lib/UserContext";
import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export default function Home() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { isConnected, triggerConnection, closeSession } = useXmpp();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (user && !isConnected) {
      // Ensure triggerConnection is only called if not already connected
      triggerConnection(user.username, user.password);
    }
  }, [isConnected, triggerConnection, user, navigate, closeSession]);

  useEffect(() => {
    if (!user) {
      const redirectTimer = setTimeout(() => {
        navigate("/login");
      }, 5000);

      const interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 100) {
            clearInterval(interval);
            return 100;
          }
          return Math.min(oldProgress + 1, 100);
        });
      }, 50);

      return () => {
        clearTimeout(redirectTimer);
        clearInterval(interval);
      };
    }
  }, [user, navigate]);

  const layoutCookie = Cookies.get("react-resizable-panels:layout");
  const defaultLayout = layoutCookie ? JSON.parse(layoutCookie) : undefined;

  if (!user)
    return (
      <div className="flex h-[calc(100dvh)] flex-col items-center justify-center p-4 md:px-24 py-32 gap-4 bg-background">
        <h1 className="text-6xl m-6 mb-10">༼ つ ◕_◕ ༽つ</h1>
        <Alert variant="destructive" className="w-fit mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>You are not logged in. </AlertTitle>
        </Alert>
        <div className="text-center flex flex-col items-center justify-center">
          <p className="text-md mb-2">
            Redirecting in {5 - Math.floor(progress / 20)}
          </p>
          <Progress value={progress} className="w-[200px] h-2 mb-4" />
          <Button onClick={() => navigate("/login")}>Login Now</Button>
        </div>
      </div>
    );

  return (
    <main className="flex h-[calc(100dvh)] flex-col items-center justify-center p-4 md:px-24 py-32 gap-4">
      <div className="flex justify-between max-w-7xl w-full items-center">
        <a href="#" className="text-4xl font-bold">
          xmpp ༼ つ ◕_◕ ༽つ
        </a>
        <div className="grid gap-2 grid-cols-2">
          <ModeToggle />
          <a
            target="_blank"
            href="https://github.com/chamale-rac/xmpp"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-10 w-10"
            )}
          >
            <GitHubLogoIcon className="w-7 h-7 text-muted-foreground" />
          </a>
          {/* <button
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-10 w-10"
            )}
            onClick={() => {
              logout();
              navigate("/login");
              closeSession();
            }}
          >
            <LogOut className="w-7 h-7 text-muted-foreground" />
          </button> */}
        </div>
      </div>

      <div className="z-10 border rounded-lg max-w-7xl w-full min-h-[640px] md:min-h-[740px] text-sm lg:flex">
        <ChatLayout defaultLayout={defaultLayout} navCollapsedSize={8} />
      </div>

      <div className="flex justify-between max-w-7xl w-full items-start text-xs md:text-sm text-muted-foreground ">
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
        </p>{" "}
        <p></p>
      </div>
    </main>
  );
}

import React, { useEffect, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { Sidebar } from "../sidebar";
import { Chat } from "./chat";
import { Cat, CircleSlash } from "lucide-react";
import { useXmpp } from "@/lib/hooks/useXmpp";
import { Button } from "../ui/button";

interface ChatLayoutProps {
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

export function ChatLayout({
  defaultLayout = [320, 480],
  defaultCollapsed = false,
  navCollapsedSize,
}: ChatLayoutProps) {
  const {
    selectedContact,
    selectedGroup,
    selectedType,
    joinGroup,
    addBookmark,
  } = useXmpp();

  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenWidth = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkScreenWidth();

    // Event listener for screen width changes
    window.addEventListener("resize", checkScreenWidth);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkScreenWidth);
    };
  }, []);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      onLayout={(sizes: number[]) => {
        document.cookie = `react-resizable-panels:layout=${JSON.stringify(
          sizes
        )}`;
      }}
      className="h-full items-stretch rounded-lg gag "
    >
      <ResizablePanel
        defaultSize={defaultLayout[0]}
        collapsedSize={navCollapsedSize}
        collapsible={true}
        minSize={isMobile ? 0 : 24}
        maxSize={isMobile ? 8 : 30}
        onCollapse={() => {
          setIsCollapsed(true);
          document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
            true
          )}`;
        }}
        onExpand={() => {
          setIsCollapsed(false);
          document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
            false
          )}`;
        }}
        className={cn(
          isCollapsed &&
            "min-w-[50px] md:min-w-[70px] transition-all duration-300 ease-in-out"
        )}
      >
        <Sidebar isCollapsed={isCollapsed || isMobile} isMobile={isMobile} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
        {selectedType && (selectedContact || selectedGroup) ? (
          selectedType == "contact" ? (
            <Chat isMobile={isMobile} />
          ) : selectedGroup?.isJoined ? (
            <Chat isMobile={isMobile} />
          ) : (
            <div className="flex flex-col gap-1 items-center text-center text-sm h-full justify-center">
              <CircleSlash className="w-12 h-12 text-zinc-500/40" />
              <div className="text-zinc-800 text-lg">
                You are not a member of{" "}
                <span className="text-black font-semibold">
                  {selectedGroup?.name}
                </span>{" "}
                group <br />
                <span className="text-zinc-600 text-sm">
                  This group is {selectedGroup?.isPublic ? "public" : "private"}
                  , so requires {selectedGroup?.requiresInvite ? "an" : "no"}{" "}
                  invitation to join.
                </span>
              </div>
              {
                // Display button to request an invite
                selectedGroup?.isPublic && !selectedGroup.requiresInvite && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      joinGroup(selectedGroup.jid);
                      addBookmark(selectedGroup.jid, selectedGroup.name, true);
                    }}
                    className="mt-2"
                  >
                    Join Group
                  </Button>
                )
              }
            </div>
          )
        ) : (
          <div className="flex flex-col gap-1 items-center text-center text-sm h-full justify-center">
            <Cat className="w-12 h-12 text-zinc-500/40" />
            <div className="text-zinc-800 text-lg">
              Nothing to see here... yet! <br />
              <span className="text-zinc-600 text-sm">
                Select a user to chat with, or start a new chat.
              </span>
            </div>
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

import { useXmpp } from "@/lib/hooks/useXmpp";
import { ScrollArea } from "./ui/scroll-area";
import { Button, buttonVariants } from "./ui/button";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Tooltip } from "@radix-ui/react-tooltip";
import { Cctv, Check, Trash } from "lucide-react";

const Inbox = () => {
  const {
    subscriptionRequests,
    acceptSubscription,
    denySubscription,
    groupInvitations,
    acceptGroupInvitation,
    declineGroupInvitation,
    addBookmark,
  } = useXmpp();

  if (subscriptionRequests.length === 0 && groupInvitations.length === 0) {
    return (
      <div className="flex flex-col gap-1 items-center text-center text-sm min-h-32 justify-center">
        <Cctv className="w-7 h-7 text-zinc-300" />
        <div className="text-zinc-400">No new requests...</div>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-52 w-full grid gap-1 px-0">
      {subscriptionRequests.map((request) => (
        <>
          <button
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              " dark:text-white dark:hover:bg-muted/60 dark:hover:text-white shrink",
              "gap-4 px-4 w-full my-2"
            )}
            key={request.from + request.message}
          >
            <TooltipProvider key={request.from}>
              <Tooltip key={request.from} delayDuration={800}>
                <TooltipTrigger asChild>
                  <div className="flex flex-col max-w-36 items-start">
                    <span className="truncate max-w-36">{request.from}</span>
                    <span className="text-zinc-400 text-xs truncate max-w-36 ">
                      {request.message}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="flex items-center gap-4">
                  {request.from}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex gap-2 ml-auto">
              {/**TODO: consider adding tooltip to button icons */}
              {/**TODO: consider adding https://ui.shadcn.com/docs/components/alert-dialog */}
              <Button
                variant={"secondary"}
                className="p-1 h-6"
                onClick={() => denySubscription(request.from)}
              >
                <Trash className="w-4 h-4" />
              </Button>
              <Button
                className="p-1 h-6 bg-black/60"
                onClick={() => acceptSubscription(request.from)}
              >
                <Check className="w-4 h-4" />
              </Button>
            </div>
          </button>
          <Separator orientation="horizontal" />
        </>
      ))}
      {groupInvitations.map((invitation) => (
        <>
          <button
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              " dark:text-white dark:hover:bg-muted/60 dark:hover:text-white shrink",
              "gap-4 px-4 w-full my-2"
            )}
            key={invitation.from + invitation.inviter}
          >
            <TooltipProvider key={invitation.room}>
              <Tooltip key={invitation.room} delayDuration={800}>
                <TooltipTrigger asChild>
                  <div className="flex flex-col max-w-36 items-start">
                    <span className="truncate max-w-36">{invitation.room}</span>
                    <span className="text-zinc-400 text-xs truncate max-w-36 ">
                      {invitation.reason}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="flex items-center gap-4">
                  {invitation.room}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex gap-2 ml-auto">
              <Button
                variant={"secondary"}
                className="p-1 h-6"
                onClick={() => declineGroupInvitation(invitation)}
              >
                <Trash className="w-4 h-4" />
              </Button>
              <Button
                className="p-1 h-6 bg-black/60"
                onClick={() => {
                  acceptGroupInvitation(invitation);
                  addBookmark(
                    invitation.room,
                    invitation.room.split("@")[0],
                    true
                  );
                }}
              >
                <Check className="w-4 h-4" />
              </Button>
            </div>
          </button>

          <Separator orientation="horizontal" />
        </>
      ))}
    </ScrollArea>
  );
};

export default Inbox;

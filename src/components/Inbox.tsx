import { useXmpp } from "@/lib/hooks/useXmpp";
import { ScrollArea } from "./ui/scroll-area";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Tooltip } from "@radix-ui/react-tooltip";
import { ArchiveX, Check, Trash, UserRound, UsersRound } from "lucide-react";

const Inbox = () => {
  const {
    subscriptionRequests,
    acceptSubscription,
    denySubscription,
    groupInvitations,
    acceptGroupInvitation,
    declineGroupInvitation,
  } = useXmpp();

  if (subscriptionRequests.length === 0 && groupInvitations.length === 0) {
    return (
      <div className="flex flex-col gap-2 items-center text-center text-sm min-h-32 justify-center bg-muted/40 rounded-md">
        <ArchiveX size={40} className="self-center text-zinc-500" />
        <div className="text-zinc-400 text-center">No new requests...</div>
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
              "gap-4 px-4 w-full my-2 h-14"
            )}
            key={request.from + request.message}
          >
            <TooltipProvider key={request.from}>
              <Tooltip key={request.from} delayDuration={800}>
                <TooltipTrigger className="flex flex-row items-center gap-2">
                  <div className="bg-muted p-2 rounded-md mr-2">
                    <UserRound className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-start w-full">
                    <span className="truncate">{request.from}</span>
                    <span className="text-zinc-400 text-xs truncate">
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
              <Button
                variant={"secondary"}
                className="p-1 h-6"
                onClick={() => denySubscription(request.from)}
              >
                <Trash className="w-4 h-4" />
              </Button>
              <Button
                className="p-1 h-6"
                onClick={() => {
                  acceptSubscription(request.from);
                }}
              >
                <Check className="w-4 h-4" />
              </Button>
            </div>
          </button>
        </>
      ))}
      {groupInvitations.map((invitation) => (
        <>
          <button
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              " dark:text-white dark:hover:bg-muted/60 dark:hover:text-white shrink",
              "gap-4 px-4 w-full my-2 h-14"
            )}
            key={invitation.from + invitation.inviter}
          >
            <TooltipProvider key={invitation.room}>
              <Tooltip key={invitation.room} delayDuration={800}>
                <TooltipTrigger className="flex flex-row items-center gap-2">
                  <div className="bg-muted p-2 rounded-md mr-2">
                    <UsersRound className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-start w-full">
                    <span className="truncate">{invitation.room}</span>
                    <span className="text-zinc-400 text-xs truncate">
                      by: {invitation.inviter}
                    </span>
                    <span className="text-zinc-400 text-xs truncate">
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
                className="p-1 h-6"
                onClick={() => {
                  acceptGroupInvitation(invitation);
                }}
              >
                <Check className="w-4 h-4" />
              </Button>
            </div>
          </button>
        </>
      ))}
    </ScrollArea>
  );
};

export default Inbox;

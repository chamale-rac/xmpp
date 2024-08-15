import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useXmpp } from "@/lib/hooks/useXmpp";
import { Send, Undo } from "lucide-react";
import { useState } from "react";

const Profile = ({
  isCollapsed,
  className,
}: {
  isCollapsed: boolean;
  className?: string;
}) => {
  const { setPresence, setStatusMessage, status, statusMessageState } =
    useXmpp();

  const [statusMessageStateHistory, setStatusMessageStateHistory] =
    useState(statusMessageState);

  const handleStatusChange = (value: "away" | "chat" | "dnd" | "xa") => {
    setPresence(value);
  };

  const handleStatusMessageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const message = event.target.value;
    setStatusMessageStateHistory(message);
  };

  const handleUndo = () => {
    setStatusMessageStateHistory(statusMessageState);
  };

  const handleSend = () => {
    setStatusMessage(statusMessageStateHistory);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      event.key === "Enter" &&
      statusMessageState != statusMessageStateHistory
    ) {
      handleSend();
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className={className}>
          {isCollapsed ? (
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <a
                    href="#"
                    className={cn(
                      buttonVariants({ variant: "grey", size: "icon" }),
                      "h-11 w-11 md:h-16 md:w-16",
                      "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                    )}
                  >
                    <Avatar className="flex justify-center items-center  rounded-3xl border">
                      <AvatarFallback>
                        {
                          // Get the first letter of the first word in the name
                          "cha21881@uvg.edu.gt"
                            .split(" ")[0][0]
                            .toLocaleUpperCase()
                        }
                      </AvatarFallback>
                    </Avatar>{" "}
                    <span className="sr-only">{"Samuel Chamalé"}</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="flex items-center gap-4"
                >
                  You
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <a
              className={cn(
                buttonVariants({ variant: "grey", size: "xl" }),
                "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white shrink",
                "justify-start gap-4 w-full"
              )}
            >
              <Avatar className="flex justify-center items-center rounded-3xl border">
                <AvatarFallback>
                  {
                    // Get initials from name
                    "cha21881@uvg.edu.gt".split(" ")[0][0].toLocaleUpperCase()
                  }
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col max-w-28">
                <span>{"Samuel Chamalé"}</span>
                <span className="text-zinc-400 text-xs truncate ">Status</span>
              </div>
            </a>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className={cn(!isCollapsed && "w-[var(--radix-popover-trigger-width)]")}
        align="start"
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="chat">chat</SelectItem>
                  <SelectItem value="dnd">dnd</SelectItem>
                  {/* <SelectItem value="away">away</SelectItem>
                  <SelectItem value="xa">eXtended Away</SelectItem> */}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Label htmlFor="statusMessage">Status Message</Label>
            <div className="flex items-center">
              <Input
                id="statusMessage"
                value={statusMessageStateHistory}
                onChange={handleStatusMessageChange}
                onKeyDown={handleKeyDown}
                placeholder="Something cool..."
              />
              {statusMessageState != statusMessageStateHistory && (
                <div className="absolute right-6 flex gap-1">
                  <Button
                    variant={"secondary"}
                    className="p-1 h-6"
                    onClick={handleUndo}
                  >
                    <Undo className="w-4 h-4" />
                  </Button>
                  <Button className="p-1 h-6" onClick={handleSend}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Profile;

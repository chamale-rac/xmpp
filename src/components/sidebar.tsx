import { Bell, CirclePlus, SquarePen, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Message } from "@/lib/data";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import Profile from "@/components/Profile";
import AddContact from "./AddContact";
import Inbox from "./Inbox";
import { useXmpp } from "@/lib/hooks/useXmpp";
import { Skeleton } from "@/components/ui/skeleton";

interface SidebarProps {
  isCollapsed: boolean;
  links: {
    name: string;
    messages: Message[];
    avatar: string;
    variant: "grey" | "ghost";
  }[];
  onClick?: () => void;
  isMobile: boolean;
}

export function Sidebar({ links, isCollapsed }: SidebarProps) {
  const { contacts, gettingContacts } = useXmpp();

  return (
    <div
      data-collapsed={isCollapsed}
      className="relative group flex flex-col h-full gap-4 p-2 data-[collapsed=true]:p-2"
    >
      {!isCollapsed && (
        <div className="flex justify-between p-2 items-center">
          <div className="flex gap-2 items-center text-2xl">
            <p className="font-medium">Chats</p>
            <span className="text-zinc-300">({links.length})</span>
          </div>

          <div>
            <Popover>
              <PopoverTrigger asChild>
                <a
                  href="#"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "h-9 w-9"
                  )}
                >
                  <Bell size={20} />
                </a>
              </PopoverTrigger>

              <PopoverContent
                align="end"
                alignOffset={-36}
                className="max-w-[275px] max-h-60 overflow-hidden"
              >
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Inbox />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <a
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "h-9 w-9"
                  )}
                >
                  <CirclePlus size={20} />
                </a>
              </PopoverTrigger>
              <PopoverContent align="end" className="max-w-[214px]">
                <div className="grid gap-4">
                  <div className="grid gap-2 ">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 items-center justify-start"
                      onClick={() => {}}
                    >
                      <SquarePen size={20} />
                      <span>Start Chat</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 items-center justify-start"
                      onClick={() => {}}
                    >
                      <UsersRound size={20} />
                      <span>Create Group Chat</span>
                    </Button>
                    <AddContact />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2 overflow-y-auto overflow-x-hidden">
        {gettingContacts ? (
          isCollapsed ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-11 w-11 md:h-16 md:w-16">
                <div className="w-full h-full p-3 flex items-center justify-center">
                  <Skeleton className="rounded-3xl h-9 w-9" />
                </div>
              </div>
            ))
          ) : (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 rounded-md px-5 mt-1">
                <div className="flex gap-4 items-center">
                  <Skeleton className="h-11 w-11 rounded-3xl" />
                  <div className="flex flex-col max-w-28 gap-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
            ))
          )
        ) : contacts.length === 0 ? (
          <p>No contacts to show</p>
        ) : (
          contacts.map((contact, index) =>
            isCollapsed ? (
              <TooltipProvider key={index}>
                <Tooltip key={index} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <a
                      href="#"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "h-11 w-11 md:h-16 md:w-16",
                        "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                      )}
                    >
                      <Avatar className="flex justify-center items-center  rounded-3xl border">
                        <AvatarFallback>
                          {contact.name.split(" ")[0][0].toLocaleUpperCase()}
                        </AvatarFallback>
                      </Avatar>{" "}
                      <span className="sr-only">{contact.name}</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="flex items-center gap-4"
                  >
                    {contact.name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <a
                key={index}
                href="#"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "xl" }),
                  "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white shrink",
                  "justify-start gap-4"
                )}
              >
                <Avatar className="flex justify-center items-center rounded-3xl border">
                  <AvatarFallback>
                    {contact.name.split(" ")[0][0].toLocaleUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col max-w-28">
                  <span>{contact.name}</span>
                  <div className="text-zinc-500 text-xs truncate max-w-fit flex gap-1 mt-0.5">
                    {contact.show}
                  </div>
                </div>
              </a>
            )
          )
        )}
      </nav>
      <Profile className="mt-auto" isCollapsed={isCollapsed} />
    </div>
  );
}

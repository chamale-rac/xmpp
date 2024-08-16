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
import { ScrollArea } from "./ui/scroll-area";

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
  const { contacts } = useXmpp();

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

              {/*max-w-[214px]*/}
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
        {contacts.length > 0 &&
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
                        // link.variant === "grey" &&
                        "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                      )}
                    >
                      <Avatar className="flex justify-center items-center  rounded-3xl border">
                        <AvatarFallback>
                          {
                            // Get the first letter of the first word in the name
                            contact.name.split(" ")[0][0].toLocaleUpperCase()
                          }
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
                  // link.variant === "grey" &&
                  "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white shrink",
                  "justify-start gap-4"
                )}
              >
                <Avatar className="flex justify-center items-center rounded-3xl border">
                  <AvatarFallback>
                    {
                      // Get initials from name
                      contact.name.split(" ")[0][0].toLocaleUpperCase()
                    }
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col max-w-28">
                  <span>{contact.name}</span>
                  {/* {link.messages.length > 0 && (
                  <span className="text-zinc-400 text-xs truncate ">
                    {link.messages[link.messages.length - 1].name.split(" ")[0]}
                    : {link.messages[link.messages.length - 1].message}
                  </span>
                )} */}
                </div>
              </a>
            )
          )}
      </nav>
      <Profile className="mt-auto" isCollapsed={isCollapsed} />
    </div>
  );
}

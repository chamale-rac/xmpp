import { MoreHorizontal, SquarePen } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Message } from "@/lib/data";

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
            <a
              href="#"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-9 w-9"
              )}
            >
              <MoreHorizontal size={20} />
            </a>

            <a
              href="#"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-9 w-9"
              )}
            >
              <SquarePen size={20} />
            </a>
          </div>
        </div>
      )}
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) =>
          isCollapsed ? (
            <TooltipProvider key={index}>
              <Tooltip key={index} delayDuration={0}>
                <TooltipTrigger asChild>
                  <a
                    href="#"
                    className={cn(
                      buttonVariants({ variant: link.variant, size: "icon" }),
                      "h-11 w-11 md:h-16 md:w-16",
                      link.variant === "grey" &&
                        "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                    )}
                  >
                    <Avatar className="flex justify-center items-center  rounded-3xl border">
                      <AvatarFallback>
                        {
                          // Get the first letter of the first word in the name
                          link.name.split(" ")[0][0]
                        }
                      </AvatarFallback>
                    </Avatar>{" "}
                    <span className="sr-only">{link.name}</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="flex items-center gap-4"
                >
                  {link.name}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <a
              key={index}
              href="#"
              className={cn(
                buttonVariants({ variant: link.variant, size: "xl" }),
                link.variant === "grey" &&
                  "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white shrink",
                "justify-start gap-4"
              )}
            >
              <Avatar className="flex justify-center items-center rounded-3xl border">
                <AvatarFallback>
                  {
                    // Get initials from name
                    link.name.split(" ")[0][0]
                  }
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col max-w-28">
                <span>{link.name}</span>
                {link.messages.length > 0 && (
                  <span className="text-zinc-400 text-xs truncate ">
                    {link.messages[link.messages.length - 1].name.split(" ")[0]}
                    : {link.messages[link.messages.length - 1].message}
                  </span>
                )}
              </div>
            </a>
          )
        )}
      </nav>
      <div
        className={cn(
          buttonVariants({ variant: "grey", size: "xl" }),
          "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white shrink",
          "justify-start gap-4 mt-auto"
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
      </div>
    </div>
  );
}

import {
  Cat,
  CirclePlus,
  EllipsisVertical,
  Globe,
  HeartCrack,
  InboxIcon,
  UserRoundCheck,
  UserRoundX,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
import AddConversation from "./AddConversation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import CreateGroup from "./CreateGroup";
import StatusBadge from "./StatusBadge";
import DeleteAccount from "./DeleteAccount";
import { useUser } from "@/lib/UserContext";
import { useNavigate } from "react-router-dom";
import { Input } from "./ui/input";
import { useState } from "react";

interface SidebarProps {
  isCollapsed: boolean;
  onClick?: () => void;
  isMobile: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const { logout } = useUser();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const {
    contacts,
    gettingContacts,
    setSelectedContact,
    groups,
    gettingGroups,
    setSelectedGroup,
    setSelectedType,
    selectedContact,
    selectedGroup,
    selectedType,
    unreadMessages,
    markConversationAsRead,
    messages,
    closeSession,
    subscriptionRequests,
    groupInvitations,
    username,
  } = useXmpp();

  return (
    <div
      data-collapsed={isCollapsed}
      className="relative group flex flex-col h-full gap-4 p-2 data-[collapsed=true]:p-2"
    >
      {!isCollapsed && (
        <div className="flex justify-between p-2 items-center">
          <div className="flex gap-2 items-center text-2xl">
            <p className="font-medium">Chats</p>
          </div>

          <div>
            <Dialog>
              <DialogTrigger asChild>
                <a
                  href="#"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "h-9 w-9 relative"
                  )}
                >
                  <InboxIcon size={20} />
                  {(subscriptionRequests.length > 0 ||
                    groupInvitations.length > 0) && (
                    <StatusBadge
                      className="absolute top-0 right-0"
                      status="new"
                    />
                  )}
                </a>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md overflow-hidden py-5 pb-6 px-1">
                <div className="flex items-center space-x-2">
                  <div className="grid flex-1 gap-4">
                    <div className="px-4 py-2">
                      <DialogHeader className="mb-4">
                        <DialogTitle>Inbox</DialogTitle>
                        <DialogDescription>
                          Friend requests and group invitations.
                        </DialogDescription>
                      </DialogHeader>
                      <Inbox />
                    </div>
                  </div>
                </div>
                <DialogFooter className="sm:justify-between px-3.5">
                  <DialogClose asChild>
                    <Button variant="secondary">Quit</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                    <AddConversation />
                    <CreateGroup />
                    <AddContact />
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
                  <EllipsisVertical size={20} />
                </a>
              </PopoverTrigger>
              <PopoverContent align="end" className="max-w-[214px]">
                <div className="grid gap-4">
                  <div className="grid gap-2 ">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        logout();
                        navigate("/login");
                        closeSession();
                      }}
                    >
                      Logout
                    </Button>
                    {/** DELETE ACCOUNT */}
                    <DeleteAccount />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
      {!isCollapsed && (
        <div className="px-1">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or jid"
            className="w-full h-9 px-2 py-1.5 bg-muted dark:bg-muted/30 dark:text-white dark:placeholder-gray-300/50 rounded-lg"
          />
        </div>
      )}
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2 overflow-y-auto overflow-x-hidden">
        <Accordion type="multiple" className="w-full" defaultValue={["item-1"]}>
          <AccordionItem value="item-1">
            {/** SUBSCRIBED */}
            <AccordionTrigger hideChevron={isCollapsed}>
              {!isCollapsed ? (
                <h1 className=" text-lg  opacity-85">
                  Subscribed to you{" "}
                  {!gettingContacts &&
                    contacts.filter(
                      (c) =>
                        c.subscription &&
                        c.subscription !== "none" &&
                        c.subscription !== "to" &&
                        (c.jid.includes(search) || c.name?.includes(search))
                    ).length > 0 &&
                    `(${
                      contacts.filter(
                        (c) =>
                          c.subscription &&
                          c.subscription !== "none" &&
                          c.subscription !== "to" &&
                          (c.jid.includes(search) || c.name?.includes(search))
                      ).length
                    })`}
                </h1>
              ) : (
                <div
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                      size: "icon",
                    }),
                    "h-11 w-11 md:h-16 md:w-16",
                    " dark:text-muted-foreground dark:hover:bg-muted/60 dark:hover:text-white cursor-pointer"
                  )}
                >
                  <UserRoundCheck size={20} />
                </div>
              )}
            </AccordionTrigger>
            <AccordionContent className="gap-2 grid">
              {gettingContacts ? (
                isCollapsed ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-11 w-11 md:h-16 md:w-16">
                      <div className="w-full h-full p-3 flex items-center justify-center">
                        <Skeleton className="rounded-3xl h-9 w-9" />
                      </div>
                    </div>
                  ))
                ) : (
                  Array.from({ length: 3 }).map((_, index) => (
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
              ) : contacts.filter(
                  (c) =>
                    c.subscription &&
                    c.subscription !== "none" &&
                    c.subscription !== "to" &&
                    (c.jid.includes(search) || c.name?.includes(search))
                ).length !== 0 ? (
                contacts
                  .filter(
                    (c) =>
                      c.subscription &&
                      c.subscription !== "none" &&
                      c.subscription !== "to" &&
                      (c.jid.includes(search) || c.name?.includes(search))
                  )
                  .map((contact, index) =>
                    isCollapsed ? (
                      <TooltipProvider key={index}>
                        <Tooltip key={index} delayDuration={0}>
                          <TooltipTrigger asChild>
                            <a
                              className={cn(
                                buttonVariants({
                                  variant: "ghost",
                                  size: "icon",
                                }),
                                "h-11 w-11 md:h-16 md:w-16 relative",
                                " dark:text-muted-foreground dark:hover:bg-muted/60 dark:hover:text-white cursor-pointer ",
                                selectedType === "contact" &&
                                  selectedContact!.jid === contact.jid
                                  ? "bg-muted dark:bg-muted/50"
                                  : ""
                              )}
                              onClick={() => {
                                setSelectedType("contact");
                                setSelectedContact(contact);
                                markConversationAsRead(contact.jid);
                              }}
                            >
                              <Avatar className="flex justify-center items-center  rounded-none ">
                                {contact.pfp ? (
                                  <img
                                    src={contact.pfp}
                                    alt={contact.name}
                                    className="rounded-3xl"
                                  />
                                ) : (
                                  <AvatarFallback className="rounded-3xl">
                                    {contact.name &&
                                      contact.name
                                        .split(" ")[0][0]
                                        .toLocaleUpperCase()}
                                  </AvatarFallback>
                                )}
                                <StatusBadge
                                  className="absolute bottom-0 right-0"
                                  status={contact.show}
                                />
                              </Avatar>
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
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "xl" }),
                          " dark:text-white dark:hover:bg-muted/60 dark:hover:text-white shrink",
                          "justify-start gap-4 cursor-pointer w-full",
                          selectedType === "contact" &&
                            selectedContact!.jid === contact.jid
                            ? "bg-muted dark:bg-muted/50"
                            : ""
                        )}
                        onClick={() => {
                          setSelectedType("contact");
                          setSelectedContact(contact);
                          markConversationAsRead(contact.jid);
                        }}
                      >
                        <Avatar className="flex justify-center items-center relative rounded-none">
                          <AvatarFallback>
                            {contact.pfp ? (
                              <img
                                src={contact.pfp}
                                alt={contact.name}
                                className="rounded-3xl"
                              />
                            ) : (
                              <AvatarFallback>
                                {contact.name &&
                                  contact.name
                                    .split(" ")[0][0]
                                    .toLocaleUpperCase()}
                              </AvatarFallback>
                            )}
                          </AvatarFallback>
                          <StatusBadge
                            className="absolute bottom-0 right-0"
                            status={contact.show}
                          />
                        </Avatar>
                        <div className="flex flex-col max-w-28">
                          <span>{contact.name}</span>
                          <div className="text-zinc-500 text-xs truncate max-w-fit flex gap-1 mt-0.5">
                            {unreadMessages[contact.jid] &&
                            unreadMessages[contact.jid] > 0 ? (
                              <span className="text-red-400">
                                {unreadMessages[contact.jid]} new messages!
                              </span>
                            ) : (
                              <span className="text-zinc-400 truncate">
                                {
                                  // get the last message from
                                  messages[contact.jid]?.[
                                    messages[contact.jid]?.length - 1
                                  ]?.body
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      </a>
                    )
                  )
              ) : isCollapsed ? (
                <div className="flex flex-col gap-2  p-1 text-zinc-500">
                  <Cat size={30} className="self-center" />
                  <p className="text-zinc-500 text-center text-xs">Empty</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2  p-4 text-zinc-500">
                  <Cat size={40} className="self-center" />
                  <p className="text-zinc-500 text-center">
                    No subscribed contacts
                  </p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            {/** CONTACTS */}
            <AccordionTrigger hideChevron={isCollapsed}>
              {!isCollapsed ? (
                <h1 className=" text-lg opacity-85">
                  Unsubscribed{" "}
                  {!gettingContacts &&
                    contacts.filter(
                      (c) =>
                        !c.subscription ||
                        ((c.subscription === "none" ||
                          c.subscription === "to") &&
                          (c.jid.includes(search) || c.name?.includes(search)))
                    ).length > 0 &&
                    `(${
                      contacts.filter(
                        (c) =>
                          !c.subscription ||
                          ((c.subscription === "none" ||
                            c.subscription === "to") &&
                            (c.jid.includes(search) ||
                              c.name?.includes(search)))
                      ).length
                    })`}
                </h1>
              ) : (
                <div
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                      size: "icon",
                    }),
                    "h-11 w-11 md:h-16 md:w-16",
                    " dark:text-muted-foreground dark:hover:bg-muted/60 dark:hover:text-white cursor-pointer"
                  )}
                >
                  <UserRoundX size={20} />
                </div>
              )}
            </AccordionTrigger>
            <AccordionContent className="gap-2 grid">
              {gettingContacts ? (
                isCollapsed ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-11 w-11 md:h-16 md:w-16">
                      <div className="w-full h-full p-3 flex items-center justify-center">
                        <Skeleton className="rounded-3xl h-9 w-9" />
                      </div>
                    </div>
                  ))
                ) : (
                  Array.from({ length: 3 }).map((_, index) => (
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
              ) : contacts.filter(
                  (c) =>
                    !c.subscription ||
                    ((c.subscription === "none" || c.subscription === "to") &&
                      (c.jid.includes(search) || c.name?.includes(search)))
                ).length !== 0 ? (
                contacts
                  .filter(
                    (c) =>
                      !c.subscription ||
                      ((c.subscription === "none" || c.subscription === "to") &&
                        (c.jid.includes(search) || c.name?.includes(search)))
                  )
                  .map((contact, index) =>
                    isCollapsed ? (
                      <TooltipProvider key={index}>
                        <Tooltip key={index} delayDuration={0}>
                          <TooltipTrigger asChild>
                            <a
                              className={cn(
                                buttonVariants({
                                  variant: "ghost",
                                  size: "icon",
                                }),
                                "h-11 w-11 md:h-16 md:w-16 relative",
                                " dark:text-muted-foreground dark:hover:bg-muted/60 dark:hover:text-white cursor-pointer",
                                selectedType === "contact" &&
                                  selectedContact!.jid === contact.jid
                                  ? "bg-muted dark:bg-muted/50"
                                  : ""
                              )}
                              onClick={() => {
                                setSelectedType("contact");
                                setSelectedContact(contact);
                                markConversationAsRead(contact.jid);
                              }}
                            >
                              <Avatar className="flex justify-center items-center relative rounded-none">
                                <AvatarFallback>
                                  {contact.pfp ? (
                                    <img
                                      src={contact.pfp}
                                      alt={contact.name}
                                      className="rounded-3xl"
                                    />
                                  ) : (
                                    <AvatarFallback>
                                      {contact.name &&
                                        contact.name
                                          .split(" ")[0][0]
                                          .toLocaleUpperCase()}
                                    </AvatarFallback>
                                  )}
                                </AvatarFallback>
                                <StatusBadge
                                  className="absolute bottom-0 right-0"
                                  status={contact.show}
                                />
                              </Avatar>
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
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "xl" }),
                          " dark:text-white dark:hover:bg-muted/60 dark:hover:text-white shrink",
                          "justify-start gap-4 cursor-pointer w-full",
                          selectedType === "contact" &&
                            selectedContact!.jid === contact.jid
                            ? "bg-muted dark:bg-muted/50"
                            : ""
                        )}
                        onClick={() => {
                          setSelectedType("contact");
                          setSelectedContact(contact);
                          markConversationAsRead(contact.jid);
                        }}
                      >
                        <Avatar className="flex justify-center items-center relative rounded-none">
                          <AvatarFallback>
                            {contact.pfp ? (
                              <img
                                src={contact.pfp}
                                alt={contact.name}
                                className="rounded-3xl"
                              />
                            ) : (
                              <AvatarFallback>
                                {contact.name &&
                                  contact.name
                                    .split(" ")[0][0]
                                    .toLocaleUpperCase()}
                              </AvatarFallback>
                            )}
                          </AvatarFallback>
                          <StatusBadge
                            className="absolute bottom-0 right-0"
                            status={contact.show}
                          />
                        </Avatar>
                        <div className="flex flex-col max-w-28">
                          <span>
                            {contact.name}{" "}
                            {contact && contact.name === username && "(you)"}
                          </span>
                          <div className="text-zinc-500 text-xs truncate max-w-fit flex gap-1 mt-0.5">
                            {unreadMessages[contact.jid] &&
                            unreadMessages[contact.jid] > 0 ? (
                              <span className="text-red-400">
                                {unreadMessages[contact.jid]} new messages!
                              </span>
                            ) : (
                              <span className="text-zinc-400 truncate">
                                {
                                  // get the last message from
                                  messages[contact.jid]?.[
                                    messages[contact.jid]?.length - 1
                                  ]?.body
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      </a>
                    )
                  )
              ) : isCollapsed ? (
                <div className="flex flex-col gap-2  p-1 text-zinc-500">
                  <Cat size={30} className="self-center" />
                  <p className="text-zinc-500 text-center text-xs">Empty</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2  p-4 text-zinc-500">
                  <Cat size={40} className="self-center" />
                  <p className="text-zinc-500 text-center">
                    No unsubscribed contacts
                  </p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            {/** PUBLIC GROUPS */}
            <AccordionTrigger hideChevron={isCollapsed}>
              {!isCollapsed ? (
                <h1 className=" text-lg opacity-85">
                  Joined Groups{" "}
                  {!gettingGroups &&
                    groups.filter(
                      (group) =>
                        group.isJoined &&
                        (group.jid.includes(search) ||
                          group.name.includes(search))
                    ).length > 0 &&
                    `(${
                      groups.filter(
                        (group) =>
                          group.isJoined &&
                          (group.jid.includes(search) ||
                            group.name.includes(search))
                      ).length
                    })`}
                </h1>
              ) : (
                <div
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                      size: "icon",
                    }),
                    "h-11 w-11 md:h-16 md:w-16",
                    " dark:text-muted-foreground dark:hover:bg-muted/60 dark:hover:text-white cursor-pointer"
                  )}
                >
                  <UsersRound size={20} />
                </div>
              )}
            </AccordionTrigger>
            <AccordionContent className="gap-2 grid">
              {gettingGroups ? (
                isCollapsed ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-11 w-11 md:h-16 md:w-16">
                      <div className="w-full h-full p-3 flex items-center justify-center">
                        <Skeleton className="rounded-3xl h-9 w-9" />
                      </div>
                    </div>
                  ))
                ) : (
                  Array.from({ length: 3 }).map((_, index) => (
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
              ) : groups.filter(
                  (group) =>
                    group.isJoined &&
                    (group.jid.includes(search) || group.name.includes(search))
                ).length !== 0 ? (
                groups
                  .filter(
                    (group) =>
                      group.isJoined &&
                      (group.jid.includes(search) ||
                        group.name.includes(search))
                  )
                  .map((contact, index) =>
                    isCollapsed ? (
                      <TooltipProvider key={index}>
                        <Tooltip key={index} delayDuration={0}>
                          <TooltipTrigger asChild>
                            <a
                              className={cn(
                                buttonVariants({
                                  variant: "ghost",
                                  size: "icon",
                                }),
                                "h-11 w-11 md:h-16 md:w-16",
                                " dark:text-muted-foreground dark:hover:bg-muted/60 dark:hover:text-white cursor-pointer",
                                selectedType === "group" &&
                                  selectedGroup!.jid === contact.jid
                                  ? "bg-muted dark:bg-muted/50"
                                  : ""
                              )}
                              onClick={() => {
                                setSelectedType("group");
                                setSelectedGroup(contact);
                                markConversationAsRead(contact.jid);
                              }}
                            >
                              <Avatar className="flex justify-center items-center rounded-none">
                                <AvatarFallback className="rounded-3xl">
                                  {contact.name &&
                                    contact.name
                                      .split(" ")[0][0]
                                      .toLocaleUpperCase()}
                                </AvatarFallback>
                                <StatusBadge
                                  className="absolute bottom-0 right-0 !rounded-none h-4 w-4"
                                  status={
                                    contact.isPublic ? "public" : "private"
                                  }
                                />
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
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "xl" }),
                          " dark:text-white dark:hover:bg-muted/60 dark:hover:text-white shrink",
                          "justify-start gap-4 cursor-pointer  w-full",
                          selectedType === "group" &&
                            selectedGroup!.jid === contact.jid
                            ? "bg-muted dark:bg-muted/50"
                            : ""
                        )}
                        onClick={() => {
                          setSelectedGroup(contact);
                          setSelectedType("group");
                          markConversationAsRead(contact.jid);
                        }}
                      >
                        <Avatar className="flex justify-center items-center rounded-none">
                          <AvatarFallback>
                            <AvatarFallback className="rounded-3xl">
                              {contact.name &&
                                contact.name
                                  .split(" ")[0][0]
                                  .toLocaleUpperCase()}
                            </AvatarFallback>
                          </AvatarFallback>

                          <StatusBadge
                            className="absolute bottom-0 right-0 !rounded-none "
                            status={contact.isPublic ? "public" : "private"}
                          />
                        </Avatar>
                        <div className="flex flex-col max-w-28">
                          <span>{contact.name}</span>
                          <div className="text-zinc-500 text-xs truncate max-w-fit flex gap-1 mt-0.5">
                            {unreadMessages[contact.jid] &&
                            unreadMessages[contact.jid] > 0 ? (
                              <span className="text-red-400">
                                {unreadMessages[contact.jid]} new messages!
                              </span>
                            ) : (
                              <span className="text-zinc-400 truncate">
                                {
                                  // get the last message from
                                  messages[contact.jid]?.[
                                    messages[contact.jid]?.length - 1
                                  ]?.body
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      </a>
                    )
                  )
              ) : isCollapsed ? (
                <div className="flex flex-col gap-2  p-1 text-zinc-500">
                  <HeartCrack size={30} className="self-center" />
                  <p className="text-zinc-500 text-center text-xs">Empty</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2  p-4 text-zinc-500">
                  <HeartCrack size={40} className="self-center" />
                  <p className="text-zinc-500 text-center">No joined groups</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            {/** PUBLIC GROUPS */}
            <AccordionTrigger hideChevron={isCollapsed}>
              {!isCollapsed ? (
                <h1 className=" text-lg opacity-85">
                  Public Groups{" "}
                  {!gettingGroups &&
                    groups.filter(
                      (group) =>
                        group.isPublic &&
                        (group.jid.includes(search) ||
                          group.name.includes(search))
                    ).length > 0 &&
                    `(${
                      groups.filter(
                        (group) =>
                          group.isPublic &&
                          (group.jid.includes(search) ||
                            group.name.includes(search))
                      ).length
                    })`}
                </h1>
              ) : (
                <div
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                      size: "icon",
                    }),
                    "h-11 w-11 md:h-16 md:w-16",
                    " dark:text-muted-foreground dark:hover:bg-muted/60 dark:hover:text-white cursor-pointer"
                  )}
                >
                  <Globe size={20} />
                </div>
              )}
            </AccordionTrigger>
            <AccordionContent className="gap-2 grid">
              {gettingGroups ? (
                isCollapsed ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-11 w-11 md:h-16 md:w-16">
                      <div className="w-full h-full p-3 flex items-center justify-center">
                        <Skeleton className="rounded-3xl h-9 w-9" />
                      </div>
                    </div>
                  ))
                ) : (
                  Array.from({ length: 3 }).map((_, index) => (
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
              ) : groups.filter(
                  (group) =>
                    group.isPublic &&
                    (group.jid.includes(search) || group.name.includes(search))
                ).length !== 0 ? (
                groups
                  .filter(
                    (group) =>
                      group.isPublic &&
                      (group.jid.includes(search) ||
                        group.name.includes(search))
                  )
                  .map((contact, index) =>
                    isCollapsed ? (
                      <TooltipProvider key={index}>
                        <Tooltip key={index} delayDuration={0}>
                          <TooltipTrigger asChild>
                            <a
                              className={cn(
                                buttonVariants({
                                  variant: "ghost",
                                  size: "icon",
                                }),
                                "h-11 w-11 md:h-16 md:w-16",
                                " dark:text-muted-foreground dark:hover:bg-muted/60 dark:hover:text-white cursor-pointer",
                                selectedType === "group" &&
                                  selectedGroup!.jid === contact.jid
                                  ? "bg-muted dark:bg-muted/50"
                                  : ""
                              )}
                              onClick={() => {
                                setSelectedType("group");
                                setSelectedGroup(contact);
                                markConversationAsRead(contact.jid);
                              }}
                            >
                              <Avatar className="flex justify-center items-center  rounded-3xl border">
                                <AvatarFallback>
                                  {contact.name &&
                                    contact.name
                                      .split(" ")[0][0]
                                      .toLocaleUpperCase()}
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
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "xl" }),
                          " dark:text-white dark:hover:bg-muted/60 dark:hover:text-white shrink",
                          "justify-start gap-4 cursor-pointer  w-full",
                          selectedType === "group" &&
                            selectedGroup!.jid === contact.jid
                            ? "bg-muted dark:bg-muted/50"
                            : ""
                        )}
                        onClick={() => {
                          setSelectedGroup(contact);
                          setSelectedType("group");
                          markConversationAsRead(contact.jid);
                        }}
                      >
                        <Avatar className="flex justify-center items-center rounded-3xl border">
                          <AvatarFallback>
                            <AvatarFallback>
                              {contact.name &&
                                contact.name
                                  .split(" ")[0][0]
                                  .toLocaleUpperCase()}
                            </AvatarFallback>
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col max-w-28">
                          <span>{contact.name}</span>
                          <div className="text-zinc-500 text-xs truncate max-w-fit flex gap-1 mt-0.5">
                            {unreadMessages[contact.jid] &&
                            unreadMessages[contact.jid] > 0 ? (
                              <span className="text-red-400">
                                {unreadMessages[contact.jid]} new messages!
                              </span>
                            ) : (
                              <span className="text-zinc-400 truncate">
                                {
                                  // get the last message from
                                  messages[contact.jid]?.[
                                    messages[contact.jid]?.length - 1
                                  ]?.body
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      </a>
                    )
                  )
              ) : isCollapsed ? (
                <div className="flex flex-col gap-2  p-1 text-zinc-500">
                  <HeartCrack size={30} className="self-center" />
                  <p className="text-zinc-500 text-center text-xs">Empty</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2  p-4 text-zinc-500">
                  <HeartCrack size={40} className="self-center" />
                  <p className="text-zinc-500 text-center">No public groups</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </nav>
      <Profile
        className="mt-auto self-center items-center flex justify-center w-full"
        isCollapsed={isCollapsed}
      />
    </div>
  );
}

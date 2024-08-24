import { Avatar, AvatarFallback } from "../ui/avatar";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";
import { useXmpp } from "@/lib/hooks/useXmpp";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "../ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import InviteToGroup from "../InviteToGroup";

export default function ChatTopbar() {
  const { selectedContact, selectedType, selectedGroup } = useXmpp();

  if (selectedType === "contact" && selectedContact) {
    return (
      <div className="w-full h-20 flex p-4 justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <Avatar className="flex justify-center items-center">
            <AvatarFallback>
              {
                // Get the first letter of the first word in the name
                selectedContact.name &&
                  selectedContact.name.split(" ")[0][0].toLocaleUpperCase()
              }
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">
              {selectedContact.name}
              <span className="text-zinc-500">
                {" ⌁ "}
                {selectedType === "contact" ? "user" : "group"}
              </span>
            </span>
            <span className="text-xs">{selectedContact.show}</span>
          </div>
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
                <Info size={20} />
              </a>
            </PopoverTrigger>
            <PopoverContent side="left" align="start" className="p-0">
              <Card className=" border-none shadow-none p-0">
                <CardHeader>
                  <CardTitle>{selectedContact.name}</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="mt-5">
                  <div className="grid gap-6">
                    <div className="grid gap-3 text-zinc-500">
                      <span className="text-xs">
                        <span className="font-bold">jid:</span>{" "}
                        {selectedContact.jid}
                      </span>
                      <span className="text-xs">
                        <span className="font-bold">status:</span>{" "}
                        {selectedContact.status
                          ? selectedContact.status
                          : "unknown"}
                      </span>
                      <span className="text-xs">
                        <span className="font-bold">show:</span>{" "}
                        {selectedContact.show}
                      </span>
                      <span className="text-xs">
                        <span className="font-bold">subscription:</span>{" "}
                        {selectedContact.subscription}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  } else if (selectedType === "group" && selectedGroup) {
    return (
      <div className="w-full h-20 flex p-4 justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <Avatar className="flex justify-center items-center">
            <AvatarFallback>
              {
                // Get the first letter of the first word in the name
                selectedGroup.name &&
                  selectedGroup.name.split(" ")[0][0].toLocaleUpperCase()
              }
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">
              {selectedGroup.name}
              <span className="text-zinc-500">
                {" ⌁ "}
                {selectedType && selectedType}
              </span>
            </span>
            <span className="text-xs">
              {
                // selectedGroup.participants array to text using , and max of 3
                selectedGroup.participants
                  .slice(0, 3)
                  .map((participant) => participant)
                  .join(", ")
              }
            </span>
          </div>
        </div>

        <div>
          {selectedType === "group" && <InviteToGroup />}
          <Popover>
            <PopoverTrigger asChild>
              <a
                href="#"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "h-9 w-9"
                )}
              >
                <Info size={20} />
              </a>
            </PopoverTrigger>
            <PopoverContent side="left" align="start" className="p-0">
              <Card className=" border-none shadow-none p-0">
                <CardHeader>
                  <CardTitle>{selectedGroup.name}</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="mt-5">
                  <div className="grid gap-6">
                    <div className="grid gap-3 text-zinc-500">
                      <span className="text-xs">
                        <span className="font-bold">jid:</span>{" "}
                        {selectedGroup.jid}
                      </span>
                      <span className="text-xs">
                        <span className="font-bold">participants:</span>{" "}
                        {selectedGroup.participants
                          .map((participant) => participant)
                          .join(", ")}
                      </span>
                      <span className="text-xs">
                        public: {selectedGroup.isPublic ? "yes" : "no"}
                      </span>
                      <span className="text-xs">
                        requires invite:{" "}
                        {selectedGroup.requiresInvite ? "yes" : "no"}
                      </span>
                      <span className="text-xs">
                        joined: {selectedGroup.isJoined ? "yes" : "no"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  } else {
    return null;
  }
}

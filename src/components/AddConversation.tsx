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
import { Button } from "./ui/button";
import { SquarePen } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useState } from "react";
import { useXmpp } from "@/lib/hooks/useXmpp";

const AddConversation = () => {
  const { addConversation, globalXmppOptions } = useXmpp();
  const [address, setAddress] = useState("");

  const handleRestart = () => {
    setAddress("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 items-center justify-start"
          onClick={() => {}}
        >
          <SquarePen size={20} />
          <span>Start Chat</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md overflow-hidden py-5 pb-6 px-1">
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <div className="px-4 py-2">
              <DialogHeader className="mb-2">
                <DialogTitle>Start/Join Conversation</DialogTitle>
                <DialogDescription>
                  Type some new username to start a conversation...
                </DialogDescription>
                <Label htmlFor="address" className="sr-only">
                  Username
                </Label>
                <Input
                  id="username"
                  placeholder="Username"
                  onChange={(e) => setAddress(e.target.value)}
                  value={address}
                  required
                  type="email"
                />{" "}
                {address.includes("@") && address.length > 0 && (
                  <div className="text-red-400 text-xs truncate max-w-fit mt-1.5">
                    Username should not include domain. e.g. user
                  </div>
                )}
              </DialogHeader>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-between px-3.5">
          <DialogClose asChild>
            <Button variant="secondary" onClick={handleRestart}>
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              disabled={address.length === 0 || address.includes("@")}
              onClick={() => {
                addConversation(address + "@" + globalXmppOptions.domain);
                handleRestart();
              }}
            >
              Start Chat
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddConversation;

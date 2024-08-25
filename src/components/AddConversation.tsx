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
  const { addConversation } = useXmpp();
  const [address, setAddress] = useState("");
  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

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
                  Search some XMPP address to start a conversation...
                </DialogDescription>
                <Label htmlFor="address" className="sr-only">
                  XMPP Address
                </Label>
                <Input
                  id="address"
                  placeholder="XMPP Address..."
                  onChange={(e) => setAddress(e.target.value)}
                  value={address}
                  required
                  type="email"
                />{" "}
                {!isValidEmail(address) && address.length > 0 && (
                  <div className="text-zinc-400 text-xs truncate max-w-fit mt-1.5">
                    Input needs to be a valid XMPP address. e.g. x@x.x
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
              disabled={!isValidEmail(address)}
              onClick={() => {
                addConversation(address);
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

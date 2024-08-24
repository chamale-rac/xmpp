import { useState } from "react";
import { DialogTrigger } from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { UserPlus } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useXmpp } from "@/lib/hooks/useXmpp";

const InviteToGroup = () => {
  const { inviteToGroup, selectedGroup } = useXmpp();
  const [invitees, setInvitees] = useState("");
  const [reason, setReason] = useState("");

  const handleRestart = () => {
    setInvitees("");
    setReason("");
  };

  const isValidInput = (input: string) => {
    const jids = input.split(",").map((jid) => jid.trim());
    return jids.every((jid) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(jid));
  };

  const handleInvite = () => {
    if (selectedGroup) {
      const jids = invitees.split(",").map((jid) => jid.trim());
      jids.forEach((jid) => {
        inviteToGroup(selectedGroup.jid, jid, reason);
      });
      handleRestart();
    }
  };

  if (!selectedGroup) {
    return null; // Don't render the button if no group is selected
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 items-center justify-start"
        >
          <UserPlus size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md overflow-hidden py-5 pb-6 px-1">
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-4">
            <div className="px-4 py-2">
              <DialogHeader className="mb-4">
                <DialogTitle>Invite to {selectedGroup.name}</DialogTitle>
                <DialogDescription>
                  Invite users to join this group chat.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="invitees">
                    Invitees{" "}
                    <span className="text-zinc-500">(comma-separated)</span>
                  </Label>
                  <Input
                    id="invitees"
                    placeholder="x@alumchat.lol, y@alumchat.lol"
                    onChange={(e) => setInvitees(e.target.value)}
                    value={invitees}
                    required
                  />
                  {!isValidInput(invitees) && invitees.length > 0 && (
                    <p className="text-red-500 text-sm mt-1">
                      Please enter valid XMPP addresses separated by commas.
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reason">
                    Invitation Message{" "}
                    <span className="text-zinc-500">(Optional)</span>
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder="Enter a message to include with the invitation..."
                    onChange={(e) => setReason(e.target.value)}
                    value={reason}
                  />
                </div>
              </div>
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
            <Button disabled={!isValidInput(invitees)} onClick={handleInvite}>
              Send Invitations
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteToGroup;

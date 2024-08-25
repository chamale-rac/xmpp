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
import { UsersRound } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { useXmpp } from "@/lib/hooks/useXmpp";

const CreateGroup = () => {
  const { createGroup, globalXmppOptions } = useXmpp();
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [customAddress, setCustomAddress] = useState("");

  const handleRestart = () => {
    setGroupName("");
    setDescription("");
    setIsPublic(true);
    setCustomAddress("");
  };

  const isValidGroupName = (name: string) => {
    return name.trim().length > 0;
  };

  const handleCreateGroup = () => {
    createGroup(groupName, {
      description,
      isPublic,
      customAddress,
    });
    handleRestart();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 items-center justify-start"
        >
          <UsersRound size={20} />
          <span>Create Group</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md overflow-hidden py-5 pb-6 px-1">
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-4">
            <div className="px-4 py-2">
              <DialogHeader className="mb-4">
                <DialogTitle>Create a New Group</DialogTitle>
                <DialogDescription>
                  Set up your group chat with the following details.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="groupName">Group Name</Label>
                  <Input
                    id="groupName"
                    placeholder="Enter group name..."
                    onChange={(e) => setGroupName(e.target.value)}
                    value={groupName}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your group..."
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                  />
                </div>

                <div>
                  <Label htmlFor="customAddress">
                    Custom Address{" "}
                    <span className="text-zinc-500">(Optional)</span>
                  </Label>
                  <Input
                    id="customAddress"
                    placeholder={
                      groupName
                        ? `${groupName.toLowerCase().replace(/\s/g, "-")}@${
                            globalXmppOptions.mucService
                          }`
                        : ""
                    }
                    onChange={(e) => setCustomAddress(e.target.value)}
                    value={customAddress}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="public">Public Group</Label>
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
            <Button
              disabled={!isValidGroupName(groupName)}
              onClick={handleCreateGroup}
            >
              Create Group
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroup;

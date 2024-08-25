/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useXmpp } from "@/lib/hooks/useXmpp";

import { useEffect, useState } from "react";
import { TransitionPanel } from "@/components/core/transition-panel";
import useMeasure from "react-use-measure";
import { Switch } from "./ui/switch";

function AddContact() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [message, setMessage] = useState("");
  const [ref, bounds] = useMeasure();
  const [address, setAddress] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [shareStatus, setShareStatus] = useState(true);
  const { addContact } = useXmpp();

  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (
      event.key === "ArrowLeft" &&
      activeIndex > 0 &&
      activeIndex < FEATURES.length - 1
    ) {
      handleSetActiveIndex(activeIndex - 1);
    }
    if (
      event.key === "Enter" &&
      FEATURES[activeIndex].continueCondition &&
      activeIndex < FEATURES.length - 1
    ) {
      handleSetActiveIndex(activeIndex + 1);
    }
  };

  const FEATURES = [
    {
      components: (
        <>
          <DialogHeader className="mb-2">
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>Please enter an XMPP address</DialogDescription>
          </DialogHeader>
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
          />
          {!isValidEmail(address) && address.length > 0 && (
            <div className="text-red-400 text-xs truncate max-w-fit mt-1.5">
              Input needs to be a valid XMPP address. e.g. x@x.x
            </div>
          )}
        </>
      ),
      continueCondition: isValidEmail(address),
    },
    {
      components: (
        <>
          <DialogHeader className="mb-2">
            <DialogTitle>Just one more step...</DialogTitle>
            <DialogDescription>
              Send a custom message! Feel free to leave it blank.
            </DialogDescription>
          </DialogHeader>
          <Label htmlFor="message" className="sr-only">
            Message
          </Label>
          <Input
            id="message"
            placeholder="Message..."
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            required
            type="text"
          />
          <div className="inline-flex items-center mt-2 gap-1">
            <Switch
              id="share-status"
              checked={shareStatus}
              onCheckedChange={(checked) => setShareStatus(checked)}
            />
            <Label htmlFor="share-status">Share Status</Label>
          </div>
        </>
      ),
      continueCondition: true,
    },
    {
      components: (
        <>
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
            <DialogDescription>
              The contact request has been sent successfully! <br />
              (〃￣︶￣)人(￣︶￣〃)
            </DialogDescription>
          </DialogHeader>
        </>
      ),
      continueCondition: true,
    },
  ];

  const handleSetActiveIndex = async (newIndex: number) => {
    setDirection(newIndex > activeIndex ? 1 : -1);
    if (newIndex === 2) {
      await addContact(address, message, shareStatus);
      handleRestart();
      setIsSuccess(true);
    }
    setActiveIndex(newIndex);
  };

  const handleRestart = () => {
    setActiveIndex(0);
    setAddress("");
    setMessage("");
    setShareStatus(true);
    setIsSuccess(false);
  };

  useEffect(() => {
    if (activeIndex < 0) setActiveIndex(0);
    if (activeIndex >= FEATURES.length) setActiveIndex(FEATURES.length - 1);
  }, [activeIndex]);

  // Adding and removing global keydown event listener
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, address, message, shareStatus]); // Dependencies to ensure the correct state is used

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add Contact</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md overflow-hidden py-5 pb-6 px-1">
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <TransitionPanel
              activeIndex={activeIndex}
              variants={{
                enter: (direction) => ({
                  x: direction > 0 ? 364 : -364,
                  opacity: 0,
                  height: bounds.height > 0 ? bounds.height : "auto",
                  position: "initial",
                }),
                center: {
                  zIndex: 1,
                  x: 0,
                  opacity: 1,
                  height: bounds.height > 0 ? bounds.height : "auto",
                },
                exit: (direction) => ({
                  zIndex: 0,
                  x: direction < 0 ? 364 : -364,
                  opacity: 0,
                  position: "absolute",
                  top: 0,
                  width: "100%",
                }),
              }}
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              custom={direction}
            >
              {FEATURES.map((feature, index) => (
                <div key={index} className="px-4 py-2" ref={ref}>
                  {feature.components}
                </div>
              ))}
            </TransitionPanel>
          </div>
        </div>
        <DialogFooter className="sm:justify-between px-3.5">
          {activeIndex == 0 && (
            <DialogClose asChild>
              <Button variant="secondary" onClick={handleRestart}>
                Cancel
              </Button>
            </DialogClose>
          )}
          {activeIndex > 0 && activeIndex < FEATURES.length - 1 && (
            <Button
              onClick={() => handleSetActiveIndex(activeIndex - 1)}
              variant="secondary"
            >
              Previous
            </Button>
          )}
          {activeIndex < FEATURES.length - 1 && (
            <Button
              onClick={() => handleSetActiveIndex(activeIndex + 1)}
              disabled={!FEATURES[activeIndex].continueCondition}
            >
              {activeIndex === 1 ? "Add Contact" : "Next"}
            </Button>
          )}
          {isSuccess && (
            <>
              <Button variant="secondary" onClick={handleRestart}>
                Add Another Contact
              </Button>
              <DialogClose asChild>
                <Button variant="secondary" onClick={handleRestart}>
                  Close
                </Button>
              </DialogClose>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddContact;

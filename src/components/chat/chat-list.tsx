import { cn } from "@/lib/utils";
import React, { useRef } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import ChatBottombar from "./chat-bottombar";
import { AnimatePresence, motion } from "framer-motion";
import { useXmpp } from "@/lib/hooks/useXmpp";

interface Message {
  from: string;
  to: string;
  body: string;
  timestamp: Date;
}

interface ChatListProps {
  messages?: Message[];
  sendMessage: (newMessage: Message) => void;
  isMobile: boolean;
}

export function ChatList({ messages, sendMessage, isMobile }: ChatListProps) {
  const { username, globalXmppOptions } = useXmpp();

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
      <div
        ref={messagesContainerRef}
        className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col"
      >
        <AnimatePresence>
          {messages?.map((message, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
              transition={{
                opacity: { duration: 0.1 },
                layout: {
                  type: "spring",
                  bounce: 0.3,
                  duration: messages.indexOf(message) * 0.05 + 0.2,
                },
              }}
              style={{
                originX: 0.5,
                originY: 0.5,
              }}
              className={cn(
                "flex flex-col gap-2 p-4 whitespace-pre-wrap",
                message.from === username + "@" + globalXmppOptions.domain
                  ? "items-end"
                  : "items-start"
              )}
            >
              <div className="flex gap-3 items-center">
                {message.from !== username + "@" + globalXmppOptions.domain && (
                  <Avatar className="flex justify-center items-center">
                    <AvatarFallback>
                      {
                        // Get the first letter of the first word in the name
                        message.from.split(" ")[0][0].toLocaleUpperCase()
                      }
                    </AvatarFallback>
                  </Avatar>
                )}
                <span className=" bg-accent p-3 rounded-md max-w-xs">
                  {message.body}
                </span>
                {message.from === username + "@" + globalXmppOptions.domain && (
                  <Avatar className="flex justify-center items-center">
                    <AvatarFallback>
                      {
                        // Get the first letter of the first word in the name
                        message.from.split(" ")[0][0].toLocaleUpperCase()
                      }
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <ChatBottombar sendMessage={sendMessage} isMobile={isMobile} />
    </div>
  );
}

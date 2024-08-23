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

// Function to parse and convert URLs to anchor tags or image previews
const linkify = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];

  return text.replace(urlRegex, (url) => {
    // Check if the URL is an image
    if (imageExtensions.some((ext) => url.toLowerCase().includes(ext))) {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">${url}</a>
        <img src="${url}" alt="Image preview" class="w-fit rounded-md mt-2" />
      `;
    } else {
      // Fallback for non-image files
      const fileName = url.split("/").pop();
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">${fileName}</a>`;
    }
  });
};

export function ChatList({ messages, sendMessage, isMobile }: ChatListProps) {
  const { username, selectedType } = useXmpp();

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
                message.from.split("@")[0] === username
                  ? "items-end"
                  : "items-start"
              )}
            >
              <div className="flex gap-3 items-start">
                {message.from.split("@")[0] !== username && (
                  <Avatar
                    className={cn(
                      "flex justify-center items-center",
                      selectedType === "group" && "mt-4"
                    )}
                  >
                    <AvatarFallback>
                      {
                        // Get the first letter of the first word in the name
                        message.from.split(" ")[0][0].toLocaleUpperCase()
                      }
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="bg-accent p-3 rounded-md">
                  {selectedType === "group" && (
                    <div
                      className={cn(
                        "text-xs text-zinc-600 mb-2",
                        message.from.split("@")[0] === username
                          ? "text-right"
                          : "text-left"
                      )}
                    >
                      ~ {message.from}
                    </div>
                  )}
                  <div
                    lang="es"
                    className="text-pretty break-all hyphens-auto max-w-48 md:max-w-xs"
                    dangerouslySetInnerHTML={{ __html: linkify(message.body) }}
                  />
                </div>
                {message.from.split("@")[0] === username && (
                  <Avatar
                    className={cn(
                      "flex justify-center items-center",
                      selectedType === "group" && "mt-4"
                    )}
                  >
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

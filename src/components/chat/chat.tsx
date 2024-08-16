import ChatTopbar from "./chat-topbar";
import { ChatList } from "./chat-list";
import React, { useEffect } from "react";
import { useXmpp } from "@/lib/hooks/useXmpp";

interface Message {
  from: string;
  to: string;
  body: string;
  timestamp: Date;
}

export function Chat({ isMobile }: { isMobile: boolean }) {
  const { messages, sendMessage, selectedContact } = useXmpp();

  // State for managing messages to display in the chat
  const [messagesState, setMessages] = React.useState<Message[]>([]);

  // Effect to update messagesState whenever messages or selectedContact changes
  useEffect(() => {
    if (selectedContact && messages[selectedContact.jid]) {
      setMessages(messages[selectedContact.jid] || []);
    }
  }, [messages, selectedContact]);

  const handleSendMessage = (newMessage: Message) => {
    if (selectedContact) {
      // Send the message via the XMPP hook
      sendMessage(selectedContact.jid, newMessage.body);
      // Optionally add it to local state immediately if desired
      // setMessages([...messagesState, newMessage]);
    }
  };

  return (
    <div className="flex flex-col justify-between w-full h-full">
      <ChatTopbar />
      <ChatList
        messages={messagesState}
        sendMessage={handleSendMessage}
        isMobile={isMobile}
      />
    </div>
  );
}

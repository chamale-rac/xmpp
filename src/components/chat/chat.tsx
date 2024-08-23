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
  const {
    messages,
    sendMessage,
    selectedContact,
    selectedGroup,
    selectedType,
    sendGroupMessage,
  } = useXmpp();

  // State for managing messages to display in the chat
  const [messagesState, setMessages] = React.useState<Message[]>([]);

  // Effect to update messagesState whenever messages or selectedContact changes
  useEffect(() => {
    if (selectedType === "group" && selectedGroup) {
      setMessages(messages[selectedGroup.jid] || []);
    } else if (selectedType === "contact" && selectedContact) {
      setMessages(messages[selectedContact.jid] || []);
    }
  }, [messages, selectedContact, selectedGroup, selectedType]);

  const handleSendMessage = (newMessage: Message) => {
    if (selectedType === "group" && selectedGroup) {
      console.log("Sending group message", selectedGroup.jid, newMessage.body);
      sendGroupMessage(selectedGroup.jid, newMessage.body);
    } else if (selectedType === "contact" && selectedContact) {
      sendMessage(selectedContact.jid, newMessage.body);
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

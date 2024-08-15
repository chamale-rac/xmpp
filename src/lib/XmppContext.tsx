/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, ReactNode, useState } from "react";
import { useEphemeralXmpp } from "@/lib/hooks/useEphemeralXmpp";
import { useXmppClient } from "@/lib/hooks/useClientXmpp";

const globalXmppOptions = {
  service: "ws://alumchat.lol:7070/ws",
  domain: "alumchat.lol",
  resource: "",
};

// Define the shape of your context
interface XmppContextProps {
  registerXmppUser: (username: string, password: string) => Promise<boolean>;
  checkXmppUser: (username: string, password: string) => Promise<boolean>;
  isConnected: boolean;
  getContacts: () => any[];
  addContact: (jid: string) => void;
  getContactDetails: (jid: string) => any;
  sendMessage: (to: string, body: string) => void;
  joinGroupChat: (roomJid: string, nickname: string) => void;
  setPresence: (status: string) => void;
  triggerConnection: (username: string, password: string) => void;
  messages: any[];
  validUser: string | undefined;
  validPassword: string | undefined;
  setValidUser: (user: string) => void;
  setValidPassword: (password: string) => void;
}

// Create the context
export const XmppContext = createContext<XmppContextProps | undefined>(
  undefined
);

// XmppProvider component
export const XmppProvider = ({ children }: { children: ReactNode }) => {
  const [validUser, setValidUser] = useState<string>();
  const [validPassword, setValidPassword] = useState<string>();

  const { registerXmppUser, checkXmppUser } =
    useEphemeralXmpp(globalXmppOptions);

  const {
    isConnected,
    getContacts,
    addContact,
    getContactDetails,
    sendMessage,
    joinGroupChat,
    setPresence,
    messages,
    triggerConnection,
  } = useXmppClient(globalXmppOptions);

  return (
    <XmppContext.Provider
      value={{
        registerXmppUser,
        checkXmppUser,
        isConnected,
        getContacts,
        addContact,
        getContactDetails,
        sendMessage,
        joinGroupChat,
        setPresence,
        messages,
        validUser,
        validPassword,
        setValidUser,
        setValidPassword,
        triggerConnection,
      }}
    >
      {children}
    </XmppContext.Provider>
  );
};

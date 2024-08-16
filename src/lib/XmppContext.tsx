/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, ReactNode, useState } from "react";
import { useEphemeralXmpp } from "@/lib/hooks/useEphemeralXmpp";
import { useXmppClient } from "@/lib/hooks/useClientXmpp";

const globalXmppOptions = {
  service: "ws://alumchat.lol:7070/ws",
  domain: "alumchat.lol",
  resource: "",
};

interface Notification {
  from: string;
  message: string;
}

interface Contact {
  jid: string;
  name: string;
  status: string;
  show: string;
}

// Define the shape of your context
interface XmppContextProps {
  registerXmppUser: (username: string, password: string) => Promise<boolean>;
  checkXmppUser: (username: string, password: string) => Promise<boolean>;
  isConnected: boolean;
  contacts: Contact[];
  addContact: (
    jid: string,
    message: string,
    shareOnlineStatus?: boolean
  ) => void;
  getContactDetails: (jid: string) => any;
  sendMessage: (to: string, body: string) => void;
  joinGroupChat: (roomJid: string, nickname: string) => void;
  setPresence: (status: "away" | "chat" | "dnd" | "xa") => void;
  setStatusMessage: (message: string) => void;
  triggerConnection: (username: string, password: string) => void;
  messages: any[];
  validUser: string | undefined;
  validPassword: string | undefined;
  setValidUser: (user: string) => void;
  setValidPassword: (password: string) => void;
  status: "away" | "chat" | "dnd" | "xa";
  statusMessageState: string;
  username: string;
  subscriptionRequests: Notification[];
  acceptSubscription: (jid: string) => void;
  denySubscription: (jid: string) => void;
  gettingContacts: boolean;
  selectedContact: Contact | undefined;
  setSelectedContact: (user: Contact) => void;
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
    addContact,
    getContactDetails,
    sendMessage,
    joinGroupChat,
    setPresence,
    messages,
    triggerConnection,
    setStatusMessage,
    status,
    statusMessageState,
    username,
    acceptSubscription,
    denySubscription,
    subscriptionRequests,
    contacts,
    gettingContacts,
    selectedContact,
    setSelectedContact,
  } = useXmppClient(globalXmppOptions);

  return (
    <XmppContext.Provider
      value={{
        contacts,
        registerXmppUser,
        checkXmppUser,
        isConnected,
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
        setStatusMessage,
        status,
        statusMessageState,
        username,
        acceptSubscription,
        denySubscription,
        subscriptionRequests,
        gettingContacts,
        selectedContact,
        setSelectedContact,
      }}
    >
      {children}
    </XmppContext.Provider>
  );
};

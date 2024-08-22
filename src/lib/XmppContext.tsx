/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, ReactNode, useState } from "react";
import { useEphemeralXmpp } from "@/lib/hooks/useEphemeralXmpp";
import { useXmppClient } from "@/lib/hooks/useClientXmpp";

const globalXmppOptions = {
  service: "ws://alumchat.lol:7070/ws",
  domain: "alumchat.lol",
  resource: "",
  mucService: "conference.alumchat.lol",
  uploadService: "httpfileupload.alumchat.lol",
};

interface Message {
  from: string;
  to: string;
  body: string;
  timestamp: Date;
}

interface Notification {
  from: string;
  message: string;
}

interface Contact {
  jid: string;
  name?: string;
  status?: string;
  show?: string;
  subscription?: string;
  pfp?: string;
}

interface Group {
  jid: string;
  name: string;
  participants: string[];
}

interface GroupInvitation {
  from: string;
  room: string;
  inviter: string;
  reason?: string;
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
  messages: { [jid: string]: Message[] };
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
  globalXmppOptions: {
    service: string;
    domain: string;
    resource: string;
    mucService: string;
    uploadService: string;
  };
  addConversation: (jid: string) => void;
  requestUploadSlot: (file: File, to: string) => void;
  groups: Group[];
  createGroup: (groupName: string) => void;
  joinGroup: (roomJid: string) => void;
  inviteToGroup: (groupJid: string, userJid: string) => void;
  sendGroupMessage: (groupJid: string, body: string) => void;
  groupInvitations: GroupInvitation[];
  acceptGroupInvitation: (invitation: GroupInvitation) => void;
  declineGroupInvitation: (invitation: GroupInvitation) => void;
  gettingGroups: boolean;
  setSelectedGroup: (group: Group) => void;
  selectedGroup: Group | undefined;
  selectedType: "contact" | "group" | undefined;
  setSelectedType: (type: "contact" | "group") => void;
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
    subscriptionRequests,
    acceptSubscription,
    denySubscription,
    contacts,
    gettingContacts,
    selectedContact,
    setSelectedContact,
    addConversation,
    requestUploadSlot,
    groups,
    createGroup,
    joinGroup,
    inviteToGroup,
    sendGroupMessage,
    groupInvitations,
    acceptGroupInvitation,
    declineGroupInvitation,
    gettingGroups,
    setSelectedGroup,
    selectedGroup,
    selectedType,
    setSelectedType,
  } = useXmppClient(globalXmppOptions);

  return (
    <XmppContext.Provider
      value={{
        isConnected,
        contacts,
        registerXmppUser,
        checkXmppUser,
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
        globalXmppOptions,
        addConversation,
        requestUploadSlot,
        groups,
        createGroup,
        joinGroup,
        inviteToGroup,
        sendGroupMessage,
        groupInvitations,
        acceptGroupInvitation,
        declineGroupInvitation,
        gettingGroups,
        setSelectedGroup,
        selectedGroup,
        selectedType,
        setSelectedType,
      }}
    >
      {children}
    </XmppContext.Provider>
  );
};

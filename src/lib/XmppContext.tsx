import { createContext, ReactNode, useState } from "react";
import { useEphemeralXmpp } from "@/lib/hooks/useEphemeralXmpp";
import { useXmppClient } from "@/lib/hooks/useClientXmpp";

const globalXmppOptions = {
  service: import.meta.env.VITE_SERVICE || "wss://alumchat.lol:7443/ws",
  domain: import.meta.env.VITE_DOMAIN || "alumchat.lol",
  resource: import.meta.env.VITE_RESOURCE || "",
  mucService: import.meta.env.VITE_MUC_SERVICE || "conference.alumchat.lol",
  uploadService:
    import.meta.env.VITE_UPLOAD_SERVICE || "httpfileupload.alumchat.lol",
};

// service: "ws://alumchat.lol:7070/ws",
// service: "wss://alumchat.lol:7443/ws",

interface Message {
  id: string;
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
  isPublic?: boolean;
  requiresInvite?: boolean;
  isJoined?: boolean;
}

interface GroupInvitation {
  from: string;
  room: string;
  inviter: string;
  reason?: string;
}

interface Bookmark {
  id: string;
  type: "room" | "subscription" | "invitation";
  jid: string;
  name: string;
  autojoin?: boolean;
  message?: string;
  inviter?: string;
  reason?: string;
}

interface UnreadMessages {
  [jid: string]: number;
}

// Define the shape of your context
interface XmppContextProps {
  registerXmppUser: (username: string, password: string) => Promise<boolean>;
  checkXmppUser: (username: string, password: string) => Promise<boolean>;
  deleteXmppUser: (username: string, password: string) => Promise<boolean>;
  isConnected: boolean;
  contacts: Contact[];
  addContact: (
    jid: string,
    message: string,
    shareOnlineStatus?: boolean
  ) => void;
  getContactDetails: (jid: string) => Contact | undefined;
  sendMessage: (to: string, body: string) => void;
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
  setSelectedContact: (user: Contact | undefined) => void;
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
  createGroup: (
    groupName: string,
    options?: {
      description?: string;
      isPublic?: boolean;
      customAddress?: string;
    }
  ) => string | undefined;
  joinGroup: (roomJid: string) => void;
  inviteToGroup: (groupJid: string, userJid: string, reason?: string) => void;
  groupInvitations: GroupInvitation[];
  acceptGroupInvitation: (invitation: GroupInvitation) => void;
  declineGroupInvitation: (invitation: GroupInvitation) => void;
  gettingGroups: boolean;
  setSelectedGroup: (group: Group | undefined) => void;
  selectedGroup: Group | undefined;
  selectedType: "contact" | "group" | undefined;
  setSelectedType: (type: "contact" | "group" | undefined) => void;
  sendGroupMessage: (to: string, body: string) => void;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (id: string) => void;
  setIsConnected: (connected: boolean) => void;
  closeSession: () => void;
  unreadMessages: UnreadMessages;
  markConversationAsRead: (jid: string) => void;
  leaveGroup: (roomJid: string) => void;
  toggleOnlineStatusSharing: (jid: string) => void;
  removeContact: (jid: string) => void;
  removeFromRoster: (jid: string) => void;
}

// Create the context
export const XmppContext = createContext<XmppContextProps | undefined>(
  undefined
);

// XmppProvider component
export const XmppProvider = ({ children }: { children: ReactNode }) => {
  const [validUser, setValidUser] = useState<string>();
  const [validPassword, setValidPassword] = useState<string>();

  const { registerXmppUser, checkXmppUser, deleteXmppUser } =
    useEphemeralXmpp(globalXmppOptions);

  const {
    isConnected,
    addContact,
    getContactDetails,
    sendMessage,
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
    groupInvitations,
    acceptGroupInvitation,
    declineGroupInvitation,
    gettingGroups,
    setSelectedGroup,
    selectedGroup,
    selectedType,
    setSelectedType,
    sendGroupMessage,
    addBookmark,
    removeBookmark,
    setIsConnected,
    closeSession,
    unreadMessages,
    markConversationAsRead,
    leaveGroup,
    toggleOnlineStatusSharing,
    removeContact,
    removeFromRoster,
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
        groupInvitations,
        acceptGroupInvitation,
        declineGroupInvitation,
        gettingGroups,
        setSelectedGroup,
        selectedGroup,
        selectedType,
        setSelectedType,
        sendGroupMessage,
        addBookmark,
        removeBookmark,
        setIsConnected,
        closeSession,
        unreadMessages,
        markConversationAsRead,
        deleteXmppUser,
        leaveGroup,
        toggleOnlineStatusSharing,
        removeContact,
        removeFromRoster,
      }}
    >
      {children}
    </XmppContext.Provider>
  );
};

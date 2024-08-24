/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from "react";
import { client, xml } from "@xmpp/client";
import debug from "@xmpp/debug";
import { v4 as uuidv4 } from "uuid";

interface XmppConnectionOptions {
  service: string;
  domain: string;
  resource: string;
  mucService: string;
  uploadService: string;
}

interface Contact {
  jid: string;
  name?: string;
  status?: string;
  show?: string;
  subscription?: string;
  pfp?: string;
}

interface Message {
  from: string;
  to: string;
  body: string;
  timestamp: Date;
  id: string;
}

interface Notification {
  from: string;
  message: string;
}

interface XMPPFile {
  id: string;
  file: File;
  to: string;
}

// Modify the Group interface to include more details
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
  jid: string;
  name: string;
  autojoin: boolean;
}

export const useXmppClient = (xmppOptions: XmppConnectionOptions) => {
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();
  const [selectedGroup, setSelectedGroup] = useState<Group | undefined>();
  const [selectedType, setSelectedType] = useState<
    "contact" | "group" | undefined
  >();
  const [isConnected, setIsConnected] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<{ [jid: string]: Message[] }>({});
  const [historyFetched, setHistoryFetched] = useState<{
    [jid: string]: boolean;
  }>({});
  const [gettingContacts, setGettingContacts] = useState(true);
  const [gettingGroups, setGettingGroups] = useState(true);
  const [subscriptionRequests, setSubscriptionRequests] = useState<
    Notification[]
  >([]);
  const [status, setStatus] = useState<"away" | "chat" | "dnd" | "xa">("chat");
  const [statusMessageState, setStatusMessageState] = useState("༼ つ ◕_◕ ༽つ");
  const xmppRef = useRef<any>(null); // Use ref to store the XMPP client
  const [username, setUsername] = useState("");
  const usernameRef = useRef("");
  const [filesToBeUploaded, setFilesToBeUploaded] = useState<XMPPFile[]>([]);
  const filesToBeUploadedRef = useRef<XMPPFile[]>([]);
  const [groupInvitations, setGroupInvitations] = useState<GroupInvitation[]>(
    []
  );
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [autojoinAlreadyHandled, setAutojoinAlreadyHandled] = useState(false);

  // Add these to your existing useXmppClient hook
  const [groups, setGroups] = useState<Group[]>([]);

  const getBookmarks = useCallback(() => {
    if (xmppRef.current) {
      const iqStanza = xml(
        "iq",
        { type: "get", id: "bookmarks1" },
        xml(
          "query",
          { xmlns: "jabber:iq:private" },
          xml("storage", { xmlns: "storage:bookmarks" })
        )
      );
      xmppRef.current.send(iqStanza);
    }
  }, []);

  const handleBookmarks = useCallback((stanza: any) => {
    const storage = stanza.getChild("query").getChild("storage");
    if (storage) {
      console.log("Bookmarks stanza:", storage.toString());
      const conferenceNodes = storage.getChildren("conference");
      const newBookmarks: Bookmark[] = conferenceNodes.map((node: any) => ({
        jid: node.attrs.jid,
        name: node.attrs.name || node.attrs.jid.split("@")[0],
        autojoin: node.attrs.autojoin === "true",
      }));

      setBookmarks(newBookmarks);
    }
  }, []);

  const addBookmark = useCallback(
    (roomJid: string, name: string, autojoin: boolean) => {
      if (xmppRef.current) {
        // avoid duplicated bookmarks based on the roomJid
        const bookmarkExists = bookmarks.some(
          (bookmark) => bookmark.jid === roomJid
        );
        if (bookmarkExists) {
          return;
        }

        const newBookmarks = [...bookmarks, { jid: roomJid, name, autojoin }];

        const iqStanza = xml(
          "iq",
          { type: "set", id: "bookmarks2" },
          xml(
            "query",
            { xmlns: "jabber:iq:private" },
            xml(
              "storage",
              { xmlns: "storage:bookmarks" },
              ...newBookmarks.map((bookmark) =>
                xml("conference", {
                  jid: bookmark.jid,
                  name: bookmark.name,
                  autojoin: bookmark.autojoin.toString(),
                })
              )
            )
          )
        );
        xmppRef.current.send(iqStanza);

        setBookmarks(newBookmarks);
      }
    },
    [bookmarks]
  );

  const removeBookmark = useCallback(
    (roomJid: string) => {
      if (xmppRef.current) {
        const newBookmarks = bookmarks.filter(
          (bookmark) => bookmark.jid !== roomJid
        );

        const iqStanza = xml(
          "iq",
          { type: "set", id: "bookmarks3" },
          xml(
            "query",
            { xmlns: "jabber:iq:private" },
            xml(
              "storage",
              { xmlns: "storage:bookmarks" },
              ...newBookmarks.map((bookmark) =>
                xml("conference", {
                  jid: bookmark.jid,
                  name: bookmark.name,
                  autojoin: bookmark.autojoin.toString(),
                })
              )
            )
          )
        );
        xmppRef.current.send(iqStanza);

        setBookmarks(newBookmarks);
      }
    },
    [bookmarks]
  );

  const handleGroupMessage = useCallback((stanza: any) => {
    console.log("Group message stanza:", stanza.toString());
    const from = stanza.getAttr("from");
    const [groupJid, sender] = from.split("/");
    const body = stanza.getChildText("body");
    const id = stanza.getAttr("id") || uuidv4();

    if (body) {
      setMessages((prevMessages) => {
        const newMessage = {
          id,
          from: sender,
          to: groupJid,
          body,
          timestamp: new Date(),
        };
        const existingMessages = prevMessages[groupJid] || [];

        // Check if the message already exists
        const messageExists = existingMessages.some((m) => m.id === id);

        if (messageExists) {
          return prevMessages;
        }

        return {
          ...prevMessages,
          [groupJid]: [...existingMessages, newMessage],
        };
      });
    }
  }, []);

  const handleGroupPresence = useCallback((stanza: any) => {
    const from = stanza.getAttr("from");
    const type = stanza.getAttr("type");

    const [roomJid, nickname] = from.split("/");

    if (!type) {
      // No type means it's a successful join
      console.log(`Successfully joined room: ${roomJid}`);

      // Update room participants
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.jid === roomJid
            ? {
                ...group,
                participants: [...new Set([...group.participants, nickname])],
              }
            : group
        )
      );

      // updateSelected group if it's the same room
      setSelectedGroup((prevGroup) => {
        if (prevGroup !== undefined && prevGroup.jid === roomJid) {
          return {
            ...prevGroup,
            participants: [...new Set([...prevGroup.participants, nickname])],
          };
        }
        return prevGroup;
      });

      // You might want to fetch room history here if not already handled
    } else if (type === "unavailable") {
      console.log(`User left room: ${roomJid}`);

      // Remove participant from the room
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.jid === roomJid
            ? {
                ...group,
                participants: group.participants.filter((p) => p !== nickname),
              }
            : group
        )
      );

      // updateSelected group if it's the same room
      setSelectedGroup((prevGroup) => {
        if (prevGroup !== undefined && prevGroup.jid === roomJid) {
          return {
            ...prevGroup,
            participants: prevGroup.participants.filter((p) => p !== nickname),
          };
        }
        return prevGroup;
      });
    }
  }, []);

  const handleJoinedGroups = (stanza: any) => {
    console.log("Joined groups stanza:", stanza.toString());
    const items = stanza
      .getChild("query", "http://jabber.org/protocol/disco#items")
      .getChildren("item");
    console.log("Items:", items);

    setGroups((prevGroups) => {
      // eslint-disable-next-line prefer-const
      let updatedGroups = [...prevGroups];

      items.forEach((item: any) => {
        const jid = item.attrs.jid;
        const groupExists = prevGroups.some((group) => group.jid === jid);
        if (!groupExists) {
          updatedGroups.push({
            jid,
            name: item.attrs.name || jid.split("@")[0],
            participants: [],
          });
        }
      });

      return updatedGroups;
    });

    // If not created, create a message array for the group
    setMessages((prevMessages) => {
      const updatedMessages = { ...prevMessages };
      items.forEach((item: any) => {
        const jid = item.attrs.jid;
        if (!updatedMessages[jid]) {
          updatedMessages[jid] = [];
        }
      });
      return updatedMessages;
    });

    items.forEach((item: any) => {
      const jid = item.attrs.jid;
      getRoomInfo(jid);
    });

    setGettingGroups(false);
  };

  const handleRoomInfo = useCallback((stanza: any) => {
    const from = stanza.attrs.from;
    const query = stanza.getChild(
      "query",
      "http://jabber.org/protocol/disco#info"
    );
    const identity = query.getChild("identity");
    const features = query.getChildren("feature");

    const isPublic = features.some(
      (feature: any) => feature.attrs.var === "muc_public"
    );
    const requiresInvite = features.some(
      (feature: any) => feature.attrs.var === "muc_membersonly"
    );

    console.log("Room info:", {
      from,
      identity,
      features,
      isPublic,
      requiresInvite,
    });

    setGroups((prevGroups) => {
      const updatedGroups = prevGroups.map((group) => {
        if (group.jid === from) {
          return {
            ...group,
            isPublic,
            requiresInvite,
            name: identity ? identity.attrs.name : group.name,
          };
        }
        return group;
      });

      if (!prevGroups.some((group) => group.jid === from)) {
        updatedGroups.push({
          jid: from,
          name: identity ? identity.attrs.name : from.split("@")[0],
          participants: [],
          isPublic,
          requiresInvite,
        });
      }

      return updatedGroups;
    });
  }, []);

  useEffect(() => {
    filesToBeUploadedRef.current = filesToBeUploaded;
  }, [filesToBeUploaded]);

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  const handleStanza = useCallback((stanza: any) => {
    if (stanza.is("presence")) {
      const from = stanza.getAttr("from");
      if (from.includes(xmppOptions.mucService)) {
        handleGroupPresence(stanza);
      } else {
        handlePresence(stanza);
      }
    } else if (stanza.is("message")) {
      const type = stanza.getAttr("type");
      if (stanza.getChild("result", "urn:xmpp:mam:2")) {
        handleMAMResult(stanza);
      } else if (stanza.getChild("event")) {
        handlePfp(stanza);
      } else if (type === "groupchat") {
        handleGroupMessage(stanza);
      } else {
        const x = stanza.getChild("x", "http://jabber.org/protocol/muc#user");
        if (x && x.getChild("invite")) {
          handleGroupInvitation(stanza);
        } else {
          handleMessage(stanza);
        }
      }
    } else if (stanza.is("iq")) {
      const id = stanza.getAttr("id");
      if (stanza.getChild("query", "jabber:iq:roster")) {
        handleRoster(stanza);
      } else if (
        stanza.getChild("query", "http://jabber.org/protocol/disco#items")
      ) {
        handleJoinedGroups(stanza);
      } else if (filesToBeUploadedRef.current.some((file) => file.id === id)) {
        handleUploadFile(stanza);
      } else if (
        stanza.getChild("query", "http://jabber.org/protocol/disco#info")
      ) {
        handleRoomInfo(stanza);
      } else if (id === "bookmarks1") {
        handleBookmarks(stanza);
      }
      {
        console.log("Unhandled stanza iq:", stanza.toString());
      }
    } else {
      console.log("Unhandled stanza:", stanza.toString());
    }
  }, []);

  const handlePfp = useCallback((stanza: any) => {
    const from = stanza.getAttr("from").split("/")[0];
    const data = stanza
      .getChild("event")
      .getChild("items")
      .getChild("item")
      .getChild("data");

    if (data) {
      const pfpBase64 = data.text();
      const pfp = `data:image/jpeg;base64,${pfpBase64}`;

      // If the contact already exists, update the pfp, if not create a new contact
      setContacts((prevContacts) => {
        const contactExists = prevContacts.some(
          (contact) => contact.jid === from
        );
        if (contactExists) {
          return prevContacts.map((contact) =>
            contact.jid === from ? { ...contact, pfp } : contact
          );
        } else {
          return [
            ...prevContacts,
            { jid: from, name: from.split("@")[0], pfp },
          ];
        }
      });
    }
  }, []);

  const handleMAMResult = useCallback((stanza: any) => {
    console.log("MAM stanza:", stanza.toString());

    const result = stanza.getChild("result", "urn:xmpp:mam:2");
    const forwarded = result.getChild("forwarded", "urn:xmpp:forward:0");
    const message = forwarded.getChild("message", "jabber:client");
    let id = message.getAttr("id");
    const body = message.getChildText("body");
    const from = message.getAttr("from").split("/")[0];
    const fromDomain = from.split("@")[1];
    const to = message.getAttr("to").split("/")[0];
    const timestamp = new Date(
      forwarded.getChild("delay", "urn:xmpp:delay").getAttr("stamp")
    );

    if (fromDomain === xmppOptions.mucService) {
      // // Handle group messages
      // handleGroupMessage(message);
      return;
    }

    if (body) {
      let contactJid;

      // Ensure the contactJid is the JID of the contact, not the user
      // console.log("username", usernameRef.current + "@" + xmppOptions.domain);
      if (from === usernameRef.current + "@" + xmppOptions.domain) {
        contactJid = to;
      } else {
        contactJid = from;
      }

      // If not has id, generate one
      if (!id) {
        id = uuidv4();
      }

      // console.log("MAM message:", { contactJid, from, to, body, timestamp });
      setMessages((prevMessages) => {
        const newMessage = { id, from, to, body, timestamp };
        const existingMessages = prevMessages[contactJid] || [];

        // Check if the message already exists
        const messageExists = existingMessages.some((m) => m.id === id);

        // If the message exists, return the previous state
        if (messageExists) {
          return prevMessages;
        }

        // Otherwise, add the new message
        return {
          ...prevMessages,
          [contactJid]: [...existingMessages, newMessage],
        };
      });
    }
  }, []); // Include username in the dependencies array

  const triggerConnection = useCallback(
    async (username: string, password: string) => {
      if (xmppRef.current) return; // Prevent reinitializing the client

      const xmppConnectionOptions = {
        service: xmppOptions.service,
        resource: xmppOptions.resource,
        username,
        password,
      };

      setUsername(username);

      const xmppClient = client(xmppConnectionOptions);
      debug(xmppClient, true);

      // Remove existing event listeners to prevent duplicate handling
      xmppClient.removeAllListeners("online");
      xmppClient.removeAllListeners("offline");
      xmppClient.removeAllListeners("stanza");

      xmppClient.on("online", () => {
        setIsConnected(true);

        if (!xmppRef.current) {
          console.error("XMPP client is not available");
        }

        console.log("XMPP client is online");
        setStatusMessage("༼ つ ◕_◕ ༽つ");
        requestRoster(true);
        getJoinedGroups(true);
        getBookmarks();
      });

      xmppClient.on("offline", () => {
        setIsConnected(false);
        console.log("XMPP client is offline");
      });

      xmppClient.on("stanza", handleStanza);

      try {
        xmppClient.start();
        xmppRef.current = xmppClient; // Store the client instance in the ref
      } catch (error) {
        console.error("Failed to start XMPP client:", error);
      }
    },
    [xmppOptions, handleStanza]
  );

  useEffect(() => {
    return () => {
      if (xmppRef.current) {
        xmppRef.current.stop().catch(console.error);
        xmppRef.current = null; // Clear the ref on cleanup
      }
    };
  }, []);

  // Request message history when selectedContact changes
  useEffect(() => {
    if (selectedContact && !historyFetched[selectedContact.jid]) {
      getMessageHistory(selectedContact.jid);
      setHistoryFetched((prev) => ({
        ...prev,
        [selectedContact.jid]: true,
      }));
    }
  }, [selectedContact, historyFetched]);

  const getMessageHistory = useCallback((jid: string) => {
    if (xmppRef.current) {
      // Constructing the MAM query
      const mamQuery = xml(
        "iq",
        { type: "set", id: "mam_1", from: xmppRef.current.jid },
        xml(
          "query",
          { xmlns: "urn:xmpp:mam:2" },
          xml(
            "x",
            { xmlns: "jabber:x:data", type: "submit" },
            xml(
              "field",
              { var: "FORM_TYPE", type: "hidden" },
              xml("value", {}, "urn:xmpp:mam:2")
            ),
            xml("field", { var: "with" }, xml("value", {}, jid))
          )
        )
      );

      // Sending the MAM query
      xmppRef.current.send(mamQuery);
    }
  }, []);

  const handlePresence = useCallback((stanza: any) => {
    const from = stanza.getAttr("from").split("/")[0];
    const type = stanza.getAttr("type");
    let status = stanza.getChildText("status") || "online";
    let show = stanza.getChildText("show") || "chat";

    if (type === "unavailable") {
      status = "";
      show = "offline";
    } else if (type === "error") {
      status = "";
      show = "unknown";
    }

    if (type === "subscribe") {
      setSubscriptionRequests((prev) => [...prev, { from, message: status }]);
    } else {
      setContacts((prevContacts) => {
        const contactExists = prevContacts.some(
          (contact) => contact.jid === from
        );
        if (contactExists) {
          return prevContacts.map((contact) =>
            contact.jid === from
              ? { ...contact, name: from.split("@")[0], status, show }
              : contact
          );
        } else {
          return [
            ...prevContacts,
            { jid: from, name: from.split("@")[0], status, show },
          ];
        }
      });

      setSelectedContact((prev) => {
        if (prev && prev.jid === from) {
          return {
            ...prev,
            status,
            show,
          };
        }
        return prev;
      });

      // Create an empty message array for the contact if it doesn't exist, only if still this not exists, all inside
      setMessages((prevMessages) => {
        if (!prevMessages[from]) {
          return {
            ...prevMessages,
            [from]: [],
          };
        }
        return prevMessages;
      });
    }
  }, []);

  const requestRoster = useCallback(
    (toggleGettingContacts: boolean = false) => {
      if (xmppRef.current) {
        if (toggleGettingContacts) {
          setGettingContacts(true);
        }
        const rosterIQ = xml(
          "iq",
          { type: "get", id: "roster_1" },
          xml("query", { xmlns: "jabber:iq:roster" })
        );
        xmppRef.current.send(rosterIQ);
      }
    },
    []
  );

  const handleRoster = (stanza: any) => {
    const items = stanza
      .getChild("query", "jabber:iq:roster")
      .getChildren("item");

    console.log("Roster items:", items);

    setContacts((prevContacts) => {
      let updatedContacts = [...prevContacts];
      items.forEach((item: any) => {
        const jid = item.attrs.jid.split("/")[0];
        const subscription = item.attrs.subscription;
        const name = item.attrs.name || item.attrs.jid.split("@")[0];
        const contactExists = prevContacts.some(
          (contact) => contact.jid === jid
        );
        if (!contactExists) {
          updatedContacts.push({
            jid,
            name,
            subscription,
          });
        } else {
          // just update the subscription status
          updatedContacts = updatedContacts.map((contact) => {
            if (contact.jid === jid) {
              return { ...contact, subscription };
            }
            return contact;
          });
        }
      });
      return updatedContacts;
    });

    // Create an empty message array for the contact if it doesn't exist, only if still this not exists, all inside
    setMessages((prevMessages) => {
      const updatedMessages = { ...prevMessages };
      items.forEach((item: any) => {
        const jid = item.attrs.jid.split("/")[0];
        if (!updatedMessages[jid]) {
          updatedMessages[jid] = [];
        }
      });
      return updatedMessages;
    });

    setGettingContacts(false);
  };

  const acceptSubscription = useCallback(
    (jid: string) => {
      if (xmppRef.current) {
        xmppRef.current.send(xml("presence", { to: jid, type: "subscribed" }));
        xmppRef.current.send(xml("presence", { to: jid, type: "subscribe" }));
        setSubscriptionRequests((prev) =>
          prev.filter((request) => request.from !== jid)
        );

        // requestRoster();
        requestRoster();
      }
    },
    [requestRoster]
  );

  const denySubscription = useCallback(
    (jid: string) => {
      if (xmppRef.current) {
        xmppRef.current.send(
          xml("presence", { to: jid, type: "unsubscribed" })
        );
        setSubscriptionRequests((prev) =>
          prev.filter((request) => request.from !== jid)
        );

        // requestRoster();
        requestRoster();
      }
    },
    [requestRoster]
  );

  const handleMessage = useCallback((stanza: any) => {
    console.log("Message stanza:", stanza.toString());
    const from = stanza.getAttr("from").split("/")[0];
    const to = stanza.getAttr("to").split("/")[0];
    let id = stanza.getAttr("id");
    const body = stanza.getChildText("body");

    if (body) {
      let contactJid;

      // Ensure the contactJid is the JID of the contact, not the user
      // console.log("username", usernameRef.current + "@" + xmppOptions.domain);
      if (from === usernameRef.current + "@" + xmppOptions.domain) {
        contactJid = to;
      } else {
        contactJid = from;
      }

      if (!id) {
        id = uuidv4();
      }

      // Check if the user already exists in the contacts
      const contactExists = contacts.some((contact) => contact.jid === from);
      if (!contactExists) {
        setContacts((prevContacts) => [
          ...prevContacts,
          { jid: from, name: from.split("@")[0] },
        ]);

        addConversation(from);
      }

      // console.log("Message:", { contactJid, from, to, body });
      setMessages((prevMessages) => {
        const newMessage = { id, from, to, body, timestamp: new Date() };
        const existingMessages = prevMessages[contactJid] || [];

        // Check if the message already exists
        const messageExists = existingMessages.some((m) => m.id === id);

        // If the message exists, return the previous state
        if (messageExists) {
          return prevMessages;
        }

        // Otherwise, add the new message
        return {
          ...prevMessages,
          [contactJid]: [...existingMessages, newMessage],
        };
      });
    }
  }, []);

  const sendMessage = useCallback((to: string, body: string) => {
    if (xmppRef.current) {
      const id = uuidv4();

      const messageStanza = xml(
        "message",
        { to, type: "chat", id },
        xml("body", {}, body)
      );
      xmppRef.current.send(messageStanza);
      // Save the message to the local state immediately
      setMessages((prevMessages) => ({
        ...prevMessages,
        [to]: [
          ...(prevMessages[to] || []),
          {
            from: usernameRef.current + "@" + xmppOptions.domain,
            to,
            body,
            timestamp: new Date(),
            id,
          },
        ],
      }));
    }
  }, []);

  const shareOnlineStatus = useCallback((jid: string, activate: boolean) => {
    if (xmppRef.current) {
      if (activate) {
        xmppRef.current.send(xml("presence", { to: jid, type: "subscribed" }));
      } else {
        xmppRef.current.send(
          xml("presence", { to: jid, type: "unsubscribed" })
        );
      }
    }
  }, []);

  const addContact = useCallback(
    (jid: string, message: string, shareStatus: boolean = true) => {
      if (xmppRef.current) {
        xmppRef.current.send(
          xml(
            "presence",
            { to: jid, type: "subscribe" },
            xml("status", {}, message)
          )
        );

        if (shareStatus) {
          shareOnlineStatus(jid, true);
        }

        // requestRoster();
        requestRoster();
      }
    },
    [shareOnlineStatus, requestRoster]
  );

  const addConversation = useCallback(
    (jid: string) => {
      if (xmppRef.current) {
        // // Send a presence probe to check the contact's status
        // xmppRef.current.send(xml("presence", { to: jid, type: "probe" }));

        // Add the contact to the roster without requesting subscription
        const rosterIQ = xml(
          "iq",
          { type: "set", id: "roster_add_1" },
          xml(
            "query",
            { xmlns: "jabber:iq:roster" },
            xml("item", { jid: jid, subscription: "none" })
          )
        );
        xmppRef.current.send(rosterIQ);

        // Update local state to reflect the new conversation
        setContacts((prevContacts) => {
          const contactExists = prevContacts.some(
            (contact) => contact.jid === jid
          );
          if (!contactExists) {
            return [
              ...prevContacts,
              { jid, name: jid.split("@")[0], subscription: "none" },
            ];
          }
          return prevContacts;
        });

        // Create an empty message array for the contact if it doesn't exist
        setMessages((prevMessages) => {
          if (!prevMessages[jid]) {
            return { ...prevMessages, [jid]: [] };
          }
          return prevMessages;
        });

        // Optionally, you can still request the roster to ensure server-side synchronization
        requestRoster();
      }
    },
    [requestRoster]
  );

  const getContactDetails = useCallback(
    (jid: string) => contacts.find((contact) => contact.jid === jid),
    [contacts]
  );

  const joinGroup = useCallback((roomJid: string) => {
    if (xmppRef.current) {
      console.log(`Joining group: ${roomJid}`);

      // Generate use actual username
      const nickname = usernameRef.current.split("@")[0];

      // Send presence stanza to join the room
      const presenceStanza = xml(
        "presence",
        { to: `${roomJid}/${nickname}` },
        xml(
          "x",
          { xmlns: "http://jabber.org/protocol/muc" },
          xml("history", { maxstanzas: "20" }) // Request last 20 messages
        )
      );

      xmppRef.current.send(presenceStanza);

      // Update local state
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.jid === roomJid
            ? {
                ...group,
                isJoined: true,
                participants: [...group.participants, usernameRef.current],
              }
            : group
        )
      );

      // Update the selected group if it's the same room
      setSelectedGroup((prevGroup) => {
        if (prevGroup && prevGroup.jid === roomJid) {
          return {
            ...prevGroup,
            isJoined: true,
            participants: [...prevGroup.participants, usernameRef.current],
          };
        }
        return prevGroup;
      });
    }
  }, []);

  const setPresence = useCallback(
    (status: "away" | "chat" | "dnd" | "xa") => {
      if (xmppRef.current) {
        const presenceXML = xml(
          "presence",
          { "xml:lang": "en" },
          xml("show", {}, status),
          xml("status", {}, statusMessageState)
        );
        console.log(presenceXML);
        xmppRef.current.send(presenceXML);
        setStatus(status);
      }
    },
    [statusMessageState]
  );

  const setStatusMessage = useCallback(
    (message: string) => {
      console.log("Setting status message:", message);
      if (xmppRef.current) {
        const presenceXML = xml(
          "presence",
          { "xml:lang": "en" },
          xml("show", {}, status),
          xml("status", {}, message)
        );
        xmppRef.current.send(presenceXML);
        setStatusMessageState(message);
      }
    },
    [status]
  );

  {
    /** FILE UPLOAD FUNCTIONS */
  }

  const requestUploadSlot = useCallback((file: File, to: string) => {
    if (xmppRef.current) {
      const id = uuidv4(); // Unique ID for this file
      const size = file.size;
      const filename = file.name;
      const contentType = file.type || "application/octet-stream";

      // Add file to filesToBeUploaded with its unique ID
      setFilesToBeUploaded((prev) => [...prev, { id, file, to }]);

      // Send the request for an upload slot
      const uploadSlotRequest = xml(
        "iq",
        { type: "get", id, to: xmppOptions.uploadService }, // Adjust with the correct upload service JID
        xml("request", {
          xmlns: "urn:xmpp:http:upload:0",
          filename,
          size: size.toString(),
          "content-type": contentType,
        })
      );

      xmppRef.current.send(uploadSlotRequest);
    }
  }, []);

  const handleUploadFile = useCallback(
    (stanza: any) => {
      const id = stanza.getAttr("id");

      const slot = stanza.getChild("slot", "urn:xmpp:http:upload:0");
      if (slot) {
        const putUrl = slot.getChild("put").getAttr("url");
        const getUrl = slot.getChild("get").getAttr("url");

        // Find the file in the filesToBeUploadedRef
        const fileToUpload = filesToBeUploadedRef.current.find(
          (file) => file.id === id
        );
        if (fileToUpload) {
          // Upload the file
          uploadFileToUrl(putUrl, fileToUpload.file).then(() => {
            // Send the message with the file URL
            sendMessage(fileToUpload.to, `File: ${getUrl}`);

            // Remove the file from the filesToBeUploaded state
            setFilesToBeUploaded((prev) =>
              prev.filter((file) => file.id !== id)
            );
          });
        }
      }
    },
    [sendMessage]
  );

  const uploadFileToUrl = async (putUrl: string, file: File) => {
    try {
      const response = await fetch(putUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
          "Content-Length": file.size.toString(),
        },
      });

      if (!response.ok) {
        console.error("Failed to upload file:", response.statusText);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  {
    /** GROUPS */
  }

  const createGroup = useCallback(
    (
      groupName: string,
      options: {
        description?: string;
        isPublic?: boolean;
        customAddress?: string;
      } = {}
    ) => {
      if (xmppRef.current) {
        const {
          description = "",
          isPublic = true,
          customAddress = "",
        } = options;

        // Sanitize and format the room address
        let roomAddress = customAddress
          ? customAddress.toLowerCase().replace(/[^a-z0-9-_]/g, "")
          : groupName.toLowerCase().replace(/\s+/g, "-");

        // Ensure the room address is not empty
        if (!roomAddress) {
          roomAddress = `group-${Date.now()}`;
        }

        const roomJid = `${roomAddress}@${xmppOptions.mucService}`;

        // Create the room
        const presenceStanza = xml(
          "presence",
          { to: `${roomJid}/${usernameRef.current}` },
          xml("x", { xmlns: "http://jabber.org/protocol/muc" })
        );
        xmppRef.current.send(presenceStanza);

        // Configure the room
        const configureIQ = xml(
          "iq",
          { to: roomJid, type: "set", id: "config1" },
          xml(
            "query",
            { xmlns: "http://jabber.org/protocol/muc#owner" },
            xml(
              "x",
              { xmlns: "jabber:x:data", type: "submit" },
              xml(
                "field",
                { var: "FORM_TYPE" },
                xml("value", {}, "http://jabber.org/protocol/muc#roomconfig")
              ),
              xml(
                "field",
                { var: "muc#roomconfig_roomname" },
                xml("value", {}, groupName)
              ),
              xml(
                "field",
                { var: "muc#roomconfig_roomdesc" },
                xml("value", {}, description)
              ),
              xml(
                "field",
                { var: "muc#roomconfig_publicroom" },
                xml("value", {}, isPublic ? "1" : "0")
              ),
              xml(
                "field",
                { var: "muc#roomconfig_persistentroom" },
                xml("value", {}, "1")
              ),
              xml(
                "field",
                { var: "muc#roomconfig_membersonly" },
                xml("value", {}, isPublic ? "0" : "1")
              ),
              xml(
                "field",
                { var: "muc#roomconfig_allowinvites" },
                xml("value", {}, "1")
              )
            )
          )
        );
        xmppRef.current.send(configureIQ);

        // Add the new group to the state
        setGroups((prevGroups) => [
          ...prevGroups,
          {
            jid: roomJid,
            name: groupName,
            participants: [usernameRef.current],
            isPublic,
            description,
            isJoined: true,
            requiresInvite: !isPublic,
          },
        ]);

        // Add the room to bookmarks
        addBookmark(roomJid, groupName, true);

        return roomJid;
      }
    },
    [xmppOptions.mucService, addBookmark]
  );

  const inviteToGroup = useCallback((groupJid: string, userJid: string) => {
    if (xmppRef.current) {
      const inviteStanza = xml(
        "message",
        { to: groupJid },
        xml(
          "x",
          { xmlns: "http://jabber.org/protocol/muc#user" },
          xml("invite", { to: userJid })
        )
      );
      xmppRef.current.send(inviteStanza);
    }
  }, []);

  const sendGroupMessage = useCallback((to: string, body: string) => {
    if (xmppRef.current) {
      const id = uuidv4();
      const messageStanza = xml(
        "message",
        { to, type: "groupchat", id },
        xml("body", {}, body)
      );
      xmppRef.current.send(messageStanza);

      // // Save the message to the local state immediately
      // setMessages((prevMessages) => ({
      //   ...prevMessages,
      //   [to]: [
      //     ...(prevMessages[to] || []),
      //     {
      //       from: usernameRef.current,
      //       to,
      //       body,
      //       timestamp: new Date(),
      //       id,
      //     },
      //   ],
      // }));
    }
  }, []);

  const getJoinedGroups = useCallback(
    (toggleGettingGroups: boolean = false) => {
      if (xmppRef.current) {
        if (toggleGettingGroups) {
          setGettingGroups(true);
        }
        console.log("Getting all rooms");
        const iqStanza = xml(
          "iq",
          { type: "get", to: xmppOptions.mucService },
          xml("query", { xmlns: "http://jabber.org/protocol/disco#items" })
        );
        xmppRef.current.send(iqStanza);
      }
    },
    [xmppOptions.mucService]
  );

  const getRoomInfo = useCallback((roomJid: string) => {
    if (xmppRef.current) {
      const iqStanza = xml(
        "iq",
        { type: "get", to: roomJid },
        xml("query", { xmlns: "http://jabber.org/protocol/disco#info" })
      );
      xmppRef.current.send(iqStanza);
    }
  }, []);

  const handleGroupInvitation = useCallback((stanza: any) => {
    const from = stanza.getAttr("from");
    const x = stanza.getChild("x", "http://jabber.org/protocol/muc#user");
    const invite = x.getChild("invite");
    const inviter = invite.getAttr("from");
    const reason = invite.getChildText("reason");

    const newInvitation: GroupInvitation = {
      from,
      room: from,
      inviter,
      reason,
    };

    setGroupInvitations((prev) => [...prev, newInvitation]);
  }, []);

  const acceptGroupInvitation = useCallback((invitation: GroupInvitation) => {
    if (xmppRef.current) {
      const presenceStanza = xml(
        "presence",
        { to: `${invitation.room}/${usernameRef.current}` },
        xml("x", { xmlns: "http://jabber.org/protocol/muc" })
      );
      xmppRef.current.send(presenceStanza);

      // Remove the invitation from the list
      setGroupInvitations((prev) =>
        prev.filter((inv) => inv.room !== invitation.room)
      );

      // Add the joined group to the groups list
      setGroups((prev) => [
        ...prev,
        {
          jid: invitation.room,
          name: invitation.room.split("@")[0],
          participants: [],
        },
      ]);
    }
  }, []);

  const declineGroupInvitation = useCallback((invitation: GroupInvitation) => {
    if (xmppRef.current) {
      const declineStanza = xml(
        "message",
        { to: invitation.room },
        xml(
          "x",
          { xmlns: "http://jabber.org/protocol/muc#user" },
          xml("decline", { to: invitation.inviter })
        )
      );
      xmppRef.current.send(declineStanza);

      // Remove the invitation from the list
      setGroupInvitations((prev) =>
        prev.filter((inv) => inv.room !== invitation.room)
      );
    }
  }, []);

  const autoJoinBookmarkedRooms = useCallback(() => {
    bookmarks.forEach((bookmark) => {
      if (bookmark.autojoin) {
        joinGroup(bookmark.jid);
      }
    });
  }, [bookmarks, joinGroup]);

  useEffect(() => {
    if (bookmarks.length > 0 && !gettingGroups) {
      if (!autojoinAlreadyHandled) {
        console.log("Autojoining bookmarked rooms");
        setAutojoinAlreadyHandled(true);
        autoJoinBookmarkedRooms();
      }
    }
  }, [
    bookmarks,
    gettingGroups,
    autoJoinBookmarkedRooms,
    autojoinAlreadyHandled,
  ]);

  return {
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
    sendGroupMessage,
    groupInvitations,
    acceptGroupInvitation,
    declineGroupInvitation,
    gettingGroups,
    setSelectedGroup,
    selectedGroup,
    selectedType,
    setSelectedType,
    addBookmark,
    removeBookmark,
  };
};

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from "react";
import { client, xml } from "@xmpp/client";
import debug from "@xmpp/debug";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import notificationSound from "/notification.mp3";

interface UnreadMessages {
  [jid: string]: number;
}

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
  id: string;
  type: "room" | "subscription" | "invitation";
  jid: string;
  name: string;
  autojoin?: boolean;
  message?: string; // For subscription requests
  inviter?: string; // For group invitations
  reason?: string; // For group invitations
}

export const useXmppClient = (xmppOptions: XmppConnectionOptions) => {
  // audio state
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();
  const [selectedGroup, setSelectedGroup] = useState<Group | undefined>();
  const [selectedType, setSelectedType] = useState<
    "contact" | "group" | undefined
  >();
  const [isConnected, setIsConnected] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<{ [jid: string]: Message[] }>({});
  // const [historyFetched, setHistoryFetched] = useState<{
  //   [jid: string]: boolean;
  // }>({});
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
  const audioRef = new Audio(notificationSound);

  const [unreadMessages, setUnreadMessages] = useState<UnreadMessages>({});

  const statusRef = useRef<"away" | "chat" | "dnd" | "xa">("chat");

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

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
      const bookmarkNodes = storage.getChildren("bookmark");
      const newBookmarks: Bookmark[] = bookmarkNodes.map((node: any) => ({
        id: node.attrs.id,
        type: node.attrs.type as "room" | "subscription" | "invitation",
        jid: node.attrs.jid,
        name: node.attrs.name || node.attrs.jid.split("@")[0],
        autojoin: node.attrs.autojoin === "true",
        message: node.attrs.message,
        inviter: node.attrs.inviter,
        reason: node.attrs.reason,
      }));

      newBookmarks.forEach((bookmark) => {
        console.log("Bookmark:", bookmark);
      });

      setBookmarks(newBookmarks);

      console.log("Bookmarks XD:", newBookmarks);

      // Process subscription requests and group invitations
      newBookmarks.forEach((bookmark) => {
        if (bookmark.type === "invitation") {
          setGroupInvitations((prev) => {
            const invitationExists = prev.some(
              (i) => i.room === bookmark.jid && i.from === bookmark.inviter
            );
            if (invitationExists) {
              return prev;
            } else {
              return [
                ...prev,
                {
                  from: bookmark.inviter || "",
                  room: bookmark.jid,
                  inviter: bookmark.inviter || "",
                  reason: bookmark.reason,
                },
              ];
            }
          });
        }
      });
    }
  }, []);

  const addBookmark = useCallback((bookmark: Bookmark) => {
    if (xmppRef.current) {
      setBookmarks((prevBookmarks) => {
        const bookmarkExists = prevBookmarks.some(
          (b) => b.jid === bookmark.jid && b.type === bookmark.type
        );
        if (bookmarkExists) {
          return prevBookmarks;
        }

        const newBookmarks = [...prevBookmarks, bookmark];

        // Send the updated bookmarks to the server
        const iqStanza = xml(
          "iq",
          { type: "set", id: "bookmarks2" },
          xml(
            "query",
            { xmlns: "jabber:iq:private" },
            xml(
              "storage",
              { xmlns: "storage:bookmarks" },
              ...newBookmarks.map((b) =>
                xml("bookmark", {
                  id: b.id,
                  type: b.type,
                  jid: b.jid,
                  name: b.name,
                  autojoin: b.autojoin?.toString(),
                  message: b.message,
                  inviter: b.inviter,
                  reason: b.reason,
                })
              )
            )
          )
        );
        xmppRef.current.send(iqStanza);

        return newBookmarks;
      });
    }
  }, []);

  const removeBookmark = useCallback((id: string) => {
    if (xmppRef.current) {
      setBookmarks((prevBookmarks) => {
        const newBookmarks = prevBookmarks.filter((b) => b.id !== id);

        // Send the updated bookmarks to the server
        const iqStanza = xml(
          "iq",
          { type: "set", id: "bookmarks3" },
          xml(
            "query",
            { xmlns: "jabber:iq:private" },
            xml(
              "storage",
              { xmlns: "storage:bookmarks" },
              ...newBookmarks.map((b) =>
                xml("bookmark", {
                  id: b.id,
                  type: b.type,
                  jid: b.jid,
                  name: b.name,
                  autojoin: b.autojoin?.toString(),
                  message: b.message,
                  inviter: b.inviter,
                  reason: b.reason,
                })
              )
            )
          )
        );
        xmppRef.current.send(iqStanza);

        return newBookmarks;
      });
    }
  }, []);

  const handleGroupMessage = useCallback((stanza: any) => {
    console.log("Group message stanza:", stanza.toString());
    console.log("Group message stanza:", stanza.toString());
    const from = stanza.getAttr("from");
    const [groupJid, sender] = from.split("/");
    const body = stanza.getChildText("body");
    const id = stanza.getAttr("id") || uuidv4();

    if (body) {
      // get timestamp from the delay element
      let timestamp = new Date();
      if (stanza.getChild("delay", "urn:xmpp:delay")) {
        timestamp = new Date(
          stanza.getChild("delay", "urn:xmpp:delay").getAttr("stamp")
        );
      }

      setMessages((prevMessages) => {
        const newMessage = {
          id,
          from: sender,
          to: groupJid,
          body,
          timestamp,
        };
        const existingMessages = prevMessages[groupJid] || [];

        // Check if the message already exists
        const messageExists = existingMessages.some((m) => m.id === id);

        if (messageExists) {
          return prevMessages;
        }

        // show only if the message is received from another user
        if (sender !== usernameRef.current) {
          // Just if the message is less than 1 minutes
          if (new Date().getTime() - timestamp.getTime() < 60000) {
            if (statusRef.current === "chat") {
              toast(`${from}`, {
                description: `${
                  body.length > 50 ? body.substring(0, 50) + "..." : body
                }`,
              });
              audioRef.play();
            }
            // Increment unread messages count for the group
            setUnreadMessages((prevUnread) => ({
              ...prevUnread,
              [groupJid]: (prevUnread[groupJid] || 0) + 1,
            }));
          }
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
      console.log("Groups-LOG 1");
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
      console.log("Groups-LOG 2");
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

    console.log("Groups-LOG 3");
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

    console.log("Groups-LOG 4");
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
        const x = stanza.getChild("x");
        if (
          x &&
          (x.attrs.xmlns === "http://jabber.org/protocol/muc#user" ||
            x.attrs.xmlns === "jabber:x:conference")
        ) {
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
      } else {
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
        getMessageHistory(usernameRef.current + "@" + xmppOptions.domain);
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
  // useEffect(() => {
  //   if (selectedContact && !historyFetched[selectedContact.jid]) {
  //     getMessageHistory(selectedContact.jid);
  //     setHistoryFetched((prev) => ({
  //       ...prev,
  //       [selectedContact.jid]: true,
  //     }));

  //     if (
  //       selectedContact.jid ===
  //       usernameRef.current + "@" + xmppOptions.domain
  //     ) {
  //       // mark all the elements as true
  //       setHistoryFetched((prev) => {
  //         const newHistoryFetched = { ...prev };
  //         contacts.forEach((contact) => {
  //           newHistoryFetched[contact.jid] = true;
  //         });
  //         return newHistoryFetched;
  //       });
  //     }
  //   }
  // }, [selectedContact, historyFetched]);

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

  const handlePresence = useCallback(
    (stanza: any) => {
      const from = stanza.getAttr("from").split("/")[0];
      const type = stanza.getAttr("type");
      let status = stanza.getChildText("status") || "online";
      let show = stanza.getChildText("show") || "chat";

      if (type === "unavailable") {
        status = "unknown";
        show = "offline";
      } else if (type === "error") {
        status = "unknown";
        show = "unknown";
      }

      if (type === "subscribe") {
        console.log("Subscription request from:", from);

        setSubscriptionRequests((prev) => {
          const requestExists = prev.some((request) => request.from === from);
          if (requestExists) {
            return prev;
          }
          return [...prev, { from, message: status }];
        });
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
    },
    [addBookmark]
  );

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
            show: "unknown",
            status: "unknown",
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

  // Update acceptSubscription function
  const acceptSubscription = useCallback(
    (jid: string) => {
      if (xmppRef.current) {
        xmppRef.current.send(xml("presence", { to: jid, type: "subscribed" }));
        xmppRef.current.send(xml("presence", { to: jid, type: "subscribe" }));
        setSubscriptionRequests((prev) =>
          prev.filter((request) => request.from !== jid)
        );

        // Remove the subscription request bookmark
        const bookmarkToRemove = bookmarks.find(
          (b) => b.type === "subscription" && b.jid === jid
        );
        if (bookmarkToRemove) {
          removeBookmark(bookmarkToRemove.id);
        }

        requestRoster();
      }
    },
    [bookmarks, removeBookmark, requestRoster]
  );

  // Update denySubscription function
  const denySubscription = useCallback(
    (jid: string) => {
      if (xmppRef.current) {
        xmppRef.current.send(
          xml("presence", { to: jid, type: "unsubscribed" })
        );
        setSubscriptionRequests((prev) =>
          prev.filter((request) => request.from !== jid)
        );

        // Remove the subscription request bookmark
        const bookmarkToRemove = bookmarks.find(
          (b) => b.type === "subscription" && b.jid === jid
        );
        if (bookmarkToRemove) {
          removeBookmark(bookmarkToRemove.id);
        }

        requestRoster();
      }
    },
    [bookmarks, removeBookmark, requestRoster]
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
      setContacts((prevContacts) => {
        const contactExists = prevContacts.some(
          (contact) => contact.jid === from
        );
        if (!contactExists) {
          addConversation(from);

          return [...prevContacts, { jid: from, name: from.split("@")[0] }];
        } else {
          return prevContacts;
        }
      });

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

        if (statusRef.current === "chat") {
          toast(`${from}`, {
            description: `${
              body.length > 50 ? body.substring(0, 50) + "..." : body
            }`,
          });
          audioRef.play();
        }

        // Increment unread messages count for the contact
        if (from !== usernameRef.current + "@" + xmppOptions.domain) {
          setUnreadMessages((prevUnread) => ({
            ...prevUnread,
            [contactJid]: (prevUnread[contactJid] || 0) + 1,
          }));
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

  const addConversation = (jid: string) => {
    if (xmppRef.current) {
      // // Send a presence probe to check the contact's status
      // xmppRef.current.send(xml("presence", { to: jid, type: "probe" }));
      // Check if the contact already exists in the contacts
      const contactExists = contacts.some((contact) => contact.jid === jid);

      if (contactExists) {
        return;
      }

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
  };

  const getContactDetails = useCallback(
    (jid: string) => contacts.find((contact) => contact.jid === jid),
    [contacts]
  );

  const joinGroup = useCallback(
    (roomJid: string) => {
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
        console.log("Groups-LOG 5");
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

        // addBookmark for the autojoin
        addBookmark({
          id: uuidv4(),
          type: "room",
          jid: roomJid,
          name: roomJid.split("@")[0],
          autojoin: true,
        });
      }
    },
    [addBookmark]
  );

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
            // Check if the message is a group message
            const isGroupMessage = fileToUpload.to.includes(
              xmppOptions.mucService
            );

            if (isGroupMessage) {
              // Send the message with the file URL
              sendGroupMessage(fileToUpload.to, `File: ${getUrl}`);
            } else {
              // Send the message with the file URL
              sendMessage(fileToUpload.to, `File: ${getUrl}`);
            }

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
        console.log("Groups-LOG 6");
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
        addBookmark({
          id: uuidv4(),
          type: "room",
          jid: roomJid,
          name: groupName,
          autojoin: true,
        });

        return roomJid;
      }
    },
    [xmppOptions.mucService, addBookmark]
  );

  const inviteToGroup = useCallback(
    (groupJid: string, userJid: string, reason?: string) => {
      if (xmppRef.current) {
        const inviteElement = xml("invite", { to: userJid });

        if (reason) {
          inviteElement.append(xml("reason", {}, reason));
        }

        const inviteStanza = xml(
          "message",
          { to: groupJid },
          xml(
            "x",
            { xmlns: "http://jabber.org/protocol/muc#user" },
            inviteElement
          )
        );

        console.log("Inviting user to group:", inviteStanza.toString());

        xmppRef.current.send(inviteStanza);
      }
    },
    []
  );

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

  const handleGroupInvitation = useCallback(
    (stanza: any) => {
      console.log("Group invitation stanza:", stanza.toString());
      let from, room, inviter, reason;

      const x = stanza.getChild("x");
      if (x && x.attrs.xmlns === "http://jabber.org/protocol/muc#user") {
        from = stanza.getAttr("from");
        room = from;
        const invite = x.getChild("invite");
        inviter = invite.getAttr("from");
        reason = invite.getChildText("reason");
      } else if (x && x.attrs.xmlns === "jabber:x:conference") {
        from = stanza.getAttr("from");
        room = x.getAttr("jid");
        inviter = from;
        reason = x.getAttr("reason") || "";
      } else {
        console.error("Unrecognized invitation format:", stanza.toString());
        return;
      }

      // Console log the invitation details
      console.log("INVITATION XD");

      setGroupInvitations((prev) => {
        const invitationExists = prev.some((inv) => inv.room === room);
        if (invitationExists) {
          return prev;
        } else {
          // Add group invitation to bookmarks
          const newBookmark: Bookmark = {
            id: uuidv4(),
            type: "invitation",
            jid: room,
            name: room.split("@")[0],
            inviter,
            reason,
          };
          addBookmark(newBookmark);

          return [
            ...prev,
            {
              from,
              room,
              inviter,
              reason,
            },
          ];
        }
      });
    },
    [addBookmark]
  );

  const acceptGroupInvitation = useCallback(
    (invitation: GroupInvitation) => {
      if (xmppRef.current) {
        const presenceStanza = xml(
          "presence",
          { to: `${invitation.room}/${usernameRef.current}` },
          xml("x", { xmlns: "http://jabber.org/protocol/muc" })
        );
        xmppRef.current.send(presenceStanza);

        setGroupInvitations((prev) =>
          prev.filter((inv) => inv.room !== invitation.room)
        );

        // Add bookmark for the autojoin
        const newBookmark: Bookmark = {
          id: uuidv4(),
          type: "room",
          jid: invitation.room,
          name: invitation.room.split("@")[0],
          autojoin: true,
        };
        addBookmark(newBookmark);

        // Remove the group invitation bookmark
        setBookmarks((prevBookmarks) => {
          const invitationBookmark = prevBookmarks.find(
            (b) => b.type === "invitation" && b.jid === invitation.room
          );
          if (invitationBookmark) {
            removeBookmark(invitationBookmark.id);
          }
          return prevBookmarks;
        });

        setGroups((prev) => [
          ...prev,
          {
            jid: invitation.room,
            name: invitation.room.split("@")[0],
            participants: [],
            isJoined: true,
          },
        ]);

        getRoomInfo(invitation.room);
      }
    },
    [addBookmark, removeBookmark]
  );

  const declineGroupInvitation = useCallback(
    (invitation: GroupInvitation) => {
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

        setGroupInvitations((prev) =>
          prev.filter((inv) => inv.room !== invitation.room)
        );

        // Remove the group invitation bookmark
        const bookmarkToRemove = bookmarks.find(
          (b) => b.type === "invitation" && b.jid === invitation.room
        );
        if (bookmarkToRemove) {
          removeBookmark(bookmarkToRemove.id);
        }
      }
    },
    [bookmarks, removeBookmark]
  );

  const autoJoinBookmarkedRooms = useCallback(() => {
    bookmarks.forEach((bookmark) => {
      if (bookmark.autojoin) {
        console.log("Autojoining bookmarked room:", bookmark.jid);
        joinGroup(bookmark.jid);
      }
      console.log("Autojoin bookmarked room (FAKE):", bookmark.jid);
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

  const markConversationAsRead = useCallback((jid: string) => {
    setUnreadMessages((prevUnread) => {
      const newUnread = { ...prevUnread };
      delete newUnread[jid];
      return newUnread;
    });
  }, []);

  const closeSession = useCallback(() => {
    if (xmppRef.current) {
      // Disconnect from the XMPP server
      xmppRef.current.stop().catch(console.error);

      // Clear the XMPP client reference
      xmppRef.current = null;

      // Reset connection state
      setIsConnected(false);

      // Clear user-related states
      setUsername("");
      setStatus("chat");
      setStatusMessageState("༼ つ ◕_◕ ༽つ");

      // Clear contacts and messages
      setContacts([]);
      setMessages({});

      // Clear groups and related states
      setGroups([]);
      setSelectedGroup(undefined);
      setGroupInvitations([]);

      // Reset other states
      setSubscriptionRequests([]);
      // setHistoryFetched({});
      setGettingContacts(true);
      setGettingGroups(true);
      setFilesToBeUploaded([]);
      setBookmarks([]);
      setAutojoinAlreadyHandled(false);

      // Clear selected states
      setSelectedContact(undefined);
      setSelectedType(undefined);

      console.log("XMPP session closed and states reset");
    }
  }, []);

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
    setIsConnected,
    closeSession,
    unreadMessages,
    markConversationAsRead,
  };
};

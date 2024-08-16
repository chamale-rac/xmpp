/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from "react";
import { client, xml } from "@xmpp/client";
import debug from "@xmpp/debug";
import { v4 as uuidv4 } from "uuid";

interface XmppConnectionOptions {
  service: string;
  domain: string;
  resource: string;
}

interface Contact {
  jid: string;
  name: string;
  status: string;
  show: string;
  subscription?: string;
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

export const useXmppClient = (xmppOptions: XmppConnectionOptions) => {
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();
  const [isConnected, setIsConnected] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<{ [jid: string]: Message[] }>({});
  const [historyFetched, setHistoryFetched] = useState<{
    [jid: string]: boolean;
  }>({});
  const [gettingContacts, setGettingContacts] = useState(true);
  const [subscriptionRequests, setSubscriptionRequests] = useState<
    Notification[]
  >([]);
  const [status, setStatus] = useState<"away" | "chat" | "dnd" | "xa">("chat");
  const [statusMessageState, setStatusMessageState] = useState("༼ つ ◕_◕ ༽つ");
  const xmppRef = useRef<any>(null); // Use ref to store the XMPP client
  const [username, setUsername] = useState("");
  const usernameRef = useRef("");

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  const handleStanza = useCallback((stanza: any) => {
    if (stanza.is("presence")) {
      handlePresence(stanza);
    } else if (stanza.is("message")) {
      if (stanza.getChild("result", "urn:xmpp:mam:2")) {
        handleMAMResult(stanza);
      } else {
        handleMessage(stanza);
      }
    } else if (
      stanza.is("iq") &&
      stanza.getChild("query", "jabber:iq:roster")
    ) {
      handleRoster(stanza);
    } else {
      console.log("Unhandled stanza:", stanza.toString());
    }
  }, []);

  const handleMAMResult = useCallback((stanza: any) => {
    // console.log("MAM stanza:", stanza.toString());

    const result = stanza.getChild("result", "urn:xmpp:mam:2");
    const forwarded = result.getChild("forwarded", "urn:xmpp:forward:0");
    const message = forwarded.getChild("message", "jabber:client");
    const id = message.getAttr("id");
    const body = message.getChildText("body");
    const from = message.getAttr("from").split("/")[0];
    const to = message.getAttr("to").split("/")[0];
    const timestamp = new Date(
      forwarded.getChild("delay", "urn:xmpp:delay").getAttr("stamp")
    );

    if (body) {
      let contactJid;

      // Ensure the contactJid is the JID of the contact, not the user
      // console.log("username", usernameRef.current + "@" + xmppOptions.domain);
      if (from === usernameRef.current + "@" + xmppOptions.domain) {
        contactJid = to;
      } else {
        contactJid = from;
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

      xmppClient.on("online", () => {
        setIsConnected(true);
        setStatusMessage("༼ つ ◕_◕ ༽つ");
        console.log("XMPP client is online");
        requestRoster(true);
      });

      xmppClient.on("offline", () => {
        setIsConnected(false);
        console.log("XMPP client is offline");
      });

      xmppClient.on("stanza", handleStanza);

      try {
        await xmppClient.start();
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
    }

    console.log("Presence:", { from, type, status, show });

    if (type === "subscribe") {
      setSubscriptionRequests((prev) => [...prev, { from, message: status }]);
    } else {
      setContacts((prevContacts) => {
        const contactExists = prevContacts.some(
          (contact) => contact.jid === from
        );
        if (contactExists) {
          return prevContacts.map((contact) =>
            contact.jid === from ? { ...contact, status, show } : contact
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

      // Create an empty message array for the contact if it doesn't exist, only if still this not exists, all inside the setMessages
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

    console.log("Roster:", items);

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
            status: "unknown",
            show: "unknown",
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

    // Create an empty message array for the contact if it doesn't exist, only if still this not exists, all inside the setMessages
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
    const from = stanza.getAttr("from").split("/")[0];
    const to = stanza.getAttr("to").split("/")[0];
    const id = stanza.getAttr("id");
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
        // Send a presence probe to check the contact's status
        xmppRef.current.send(xml("presence", { to: jid, type: "probe" }));

        // Update the roster after sending the probe
        requestRoster();
      }
    },
    [requestRoster]
  );

  const getContactDetails = useCallback(
    (jid: string) => contacts.find((contact) => contact.jid === jid),
    [contacts]
  );

  const joinGroupChat = useCallback((roomJid: string, nickname: string) => {
    if (xmppRef.current) {
      xmppRef.current.send(
        xml(
          "presence",
          { to: `${roomJid}/${nickname}` },
          xml("x", { xmlns: "http://jabber.org/protocol/muc" })
        )
      );
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
        xmppRef.current.send(presenceXML);
        setStatus(status);
      }
    },
    [statusMessageState]
  );

  const setStatusMessage = useCallback(
    (message: string) => {
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

  return {
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
  };
};

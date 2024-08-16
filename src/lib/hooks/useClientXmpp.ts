/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from "react";
import { client, xml } from "@xmpp/client";
import debug from "@xmpp/debug";

interface XmppConnectionOptions {
  service: string;
  domain: string;
  resource: string;
}

interface Contact {
  jid: string;
  name: string;
  status: string;
}

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

export const useXmppClient = (xmppOptions: XmppConnectionOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [subscriptionRequests, setSubscriptionRequests] = useState<
    Notification[]
  >([]);
  const [status, setStatus] = useState<"away" | "chat" | "dnd" | "xa">("chat");
  const [statusMessageState, setStatusMessageState] = useState("༼ つ ◕_◕ ༽つ");
  const xmppRef = useRef<any>(null); // Use ref to store the XMPP client
  const [username, setUsername] = useState("");

  const handleStanza = useCallback((stanza: any) => {
    if (stanza.is("presence")) {
      handlePresence(stanza);
    } else if (stanza.is("message")) {
      handleMessage(stanza);
    } else {
      // console.log("Unhandled stanza:", stanza.toString());
    }
  }, []);

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

  const handlePresence = (stanza: any) => {
    const from = stanza.getAttr("from");
    const type = stanza.getAttr("type");
    const status = stanza.getChildText("status") || "";

    if (type === "subscribe") {
      // This is a subscription request
      setSubscriptionRequests((prev) => [...prev, { from, message: status }]);
    } else {
      // Handle other presence updates as before
      setContacts((prevContacts) => {
        const index = prevContacts.findIndex((contact) => contact.jid === from);
        if (index !== -1) {
          const updatedContacts = [...prevContacts];
          updatedContacts[index] = { ...updatedContacts[index], status };
          return updatedContacts;
        }
        return [
          ...prevContacts,
          { jid: from, name: from.split("@")[0], status },
        ];
      });
    }
  };

  const acceptSubscription = useCallback((jid: string) => {
    if (xmppRef.current) {
      xmppRef.current.send(xml("presence", { to: jid, type: "subscribed" }));
      // TODO: Consider removing subscribe back
      xmppRef.current.send(xml("presence", { to: jid, type: "subscribe" }));
      // Remove the request from the pending list
      setSubscriptionRequests((prev) =>
        prev.filter((request) => request.from !== jid)
      );
    }
  }, []);

  const denySubscription = useCallback((jid: string) => {
    if (xmppRef.current) {
      xmppRef.current.send(xml("presence", { to: jid, type: "unsubscribed" }));
      // Remove the request from the pending list
      setSubscriptionRequests((prev) =>
        prev.filter((request) => request.from !== jid)
      );
    }
  }, []);

  const handleMessage = (stanza: any) => {
    const from = stanza.getAttr("from");
    const to = stanza.getAttr("to");
    const body = stanza.getChildText("body");

    if (body) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { from, to, body, timestamp: new Date() },
      ]);
    }
  };

  const getContacts = useCallback(() => contacts, [contacts]);

  const shareOnlineStatus = useCallback((jid: string, activate: boolean) => {
    if (xmppRef.current) {
      if (activate) {
        // Send "subscribed" presence to share online status
        xmppRef.current.send(xml("presence", { to: jid, type: "subscribed" }));
        console.log("Sharing online status with", jid);
      } else {
        // Send "unsubscribed" presence to stop sharing online status
        xmppRef.current.send(
          xml("presence", { to: jid, type: "unsubscribed" })
        );
        console.log("Unsharing online status with", jid);
      }
    }
  }, []);

  const addContact = useCallback(
    (jid: string, message: string, shareStatus: boolean = true) => {
      if (xmppRef.current) {
        // Sending the subscription request
        xmppRef.current.send(
          xml(
            "presence",
            { to: jid, type: "subscribe" },
            xml("status", {}, message)
          )
        );
        console.log(
          "Sending contact request to",
          jid,
          "with message:",
          message
        );

        // If the user wants to share their online status, call shareOnlineStatus
        if (shareStatus) {
          shareOnlineStatus(jid, true);
        }
      }
    },
    [shareOnlineStatus]
  );

  const getContactDetails = useCallback(
    (jid: string) => contacts.find((contact) => contact.jid === jid),
    [contacts]
  );

  const sendMessage = useCallback((to: string, body: string) => {
    if (xmppRef.current) {
      xmppRef.current.send(
        xml("message", { to, type: "chat" }, xml("body", {}, body))
      );
    }
  }, []);

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

  // Show types obtained from https://slixmpp.readthedocs.io/en/slix-1.5.1/api/stanza/presence.html https://xmpp.org/rfcs/rfc3921.html
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
        console.log("Setting presence to", status);
        console.log("Presence XML:", presenceXML.toString());
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
        console.log("Status message set to", message);
        console.log("Status message XML:", presenceXML.toString());
        setStatusMessageState(message);
      }
    },
    [status]
  );

  return {
    isConnected,
    getContacts,
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
  };
};

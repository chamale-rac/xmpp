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

export const useXmppClient = (xmppOptions: XmppConnectionOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<"away" | "chat" | "dnd" | "xa">("chat");
  const [statusMessageState, setStatusMessageState] = useState("༼ つ ◕_◕ ༽つ");
  const xmppRef = useRef<any>(null); // Use ref to store the XMPP client
  const [username, setUsername] = useState("");

  const handleStanza = useCallback((stanza: any) => {
    if (stanza.is("presence")) {
      handlePresence(stanza);
    } else if (stanza.is("message")) {
      handleMessage(stanza);
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
    const status = stanza.getChildText("status") || "";

    setContacts((prevContacts) => {
      const index = prevContacts.findIndex((contact) => contact.jid === from);
      if (index !== -1) {
        const updatedContacts = [...prevContacts];
        updatedContacts[index] = { ...updatedContacts[index], status };
        return updatedContacts;
      }
      return [...prevContacts, { jid: from, name: from.split("@")[0], status }];
    });
  };

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

  const addContact = useCallback((jid: string, message: string) => {
    if (xmppRef.current) {
      xmppRef.current.send(
        xml(
          "presence",
          { to: jid, type: "subscribe" },
          xml("status", {}, message)
        )
      );
      console.log("Sending contact request to", jid, "with message:", message);
    }
  }, []);

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
  };
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { client, xml } from "@xmpp/client";
import debug from "@xmpp/debug";

interface XmppClientOptions {
  service: string;
  domain: string;
  resource: string;
  username: string;
  password: string;
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

export const useXmppClient = (options: XmppClientOptions) => {
  const [xmpp, setXmpp] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleStanza = useCallback((stanza: any) => {
    if (stanza.is("presence")) {
      handlePresence(stanza);
    } else if (stanza.is("message")) {
      handleMessage(stanza);
    }
  }, []);

  useEffect(() => {
    const setupXmpp = async () => {
      const xmppClient = client(options);
      debug(xmppClient, true);

      xmppClient.on("online", () => {
        setIsConnected(true);
        console.log("XMPP client is online");
      });
      xmppClient.on("offline", () => setIsConnected(false));

      xmppClient.on("stanza", handleStanza);

      await xmppClient.start();
      setXmpp(xmppClient);
    };

    setupXmpp();

    return () => {
      if (xmpp) {
        xmpp.stop();
      }
    };
  }, [options, handleStanza]);

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

  const addContact = useCallback(
    (jid: string) => {
      if (xmpp) {
        xmpp.send(xml("presence", { to: jid, type: "subscribe" }));
      }
    },
    [xmpp]
  );

  const getContactDetails = useCallback(
    (jid: string) => contacts.find((contact) => contact.jid === jid),
    [contacts]
  );

  const sendMessage = useCallback(
    (to: string, body: string) => {
      if (xmpp) {
        xmpp.send(xml("message", { to, type: "chat" }, xml("body", {}, body)));
      }
    },
    [xmpp]
  );

  const joinGroupChat = useCallback(
    (roomJid: string, nickname: string) => {
      if (xmpp) {
        xmpp.send(
          xml(
            "presence",
            { to: `${roomJid}/${nickname}` },
            xml("x", { xmlns: "http://jabber.org/protocol/muc" })
          )
        );
      }
    },
    [xmpp]
  );

  const setPresence = useCallback(
    (status: string) => {
      if (xmpp) {
        xmpp.send(xml("presence", {}, xml("status", {}, status)));
      }
    },
    [xmpp]
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
  };
};

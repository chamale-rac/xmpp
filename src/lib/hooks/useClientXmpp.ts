import { useState, useEffect, useRef } from "react";
import { client, xml } from "@xmpp/client";
import debug from "@xmpp/debug";
import XMPPError from "@xmpp/error";

interface XmppConnectionOptions {
  service: string;
  domain: string;
  resource: string;
  username: string;
  password: string;
}

type CustomError = XMPPError & { code: string };

export const useXmppClient = (xmppOptions: XmppConnectionOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const xmppRef = useRef<any>(null);

  useEffect(() => {
    const xmpp = client({
      service: xmppOptions.service,
      resource: xmppOptions.resource,
      username: xmppOptions.username,
      password: xmppOptions.password,
    });

    debug(xmpp, true);

    xmpp.on("error", (error: CustomError) => {
      console.error("XMPP Error:", error);
      setError(error.message);
      setIsConnected(false);
    });

    xmpp.on("online", async (address: string) => {
      console.log("XMPP Client online:", address);
      setIsConnected(true);
      await fetchContacts();
      setPresence("Available");
    });

    xmpp.on("stanza", (stanza: any) => {
      handleStanza(stanza);
    });

    xmpp.start().catch((err) => console.error("xmpp.start", err));
    xmppRef.current = xmpp;

    return () => {
      if (xmppRef.current) {
        xmppRef.current.stop().catch(console.error);
      }
    };
  }, [xmppOptions]);

  const fetchContacts = async () => {
    if (!xmppRef.current) return;
    try {
      const iq = xml(
        "iq",
        { type: "get", id: "roster_1" },
        xml("query", { xmlns: "jabber:iq:roster" })
      );
      xmppRef.current.send(iq);
    } catch (e) {
      console.error("Fetch contacts error:", e);
      setError(e as string);
    }
  };

  const handleStanza = (stanza: any) => {
    if (stanza.is("iq") && stanza.getChild("query")) {
      const query = stanza.getChild("query");
      if (query.attrs.xmlns === "jabber:iq:roster") {
        const contactList = query.getChildren("item").map((item: any) => ({
          jid: item.attrs.jid,
          name: item.attrs.name,
          subscription: item.attrs.subscription,
        }));
        setContacts(contactList);
      }
    } else if (stanza.is("message") && stanza.attrs.type === "chat") {
      const from = stanza.attrs.from;
      const body = stanza.getChild("body").text();
      setMessages((prevMessages) => [
        ...prevMessages,
        { from, body, time: new Date() },
      ]);
    }
  };

  const sendMessage = (to: string, message: string) => {
    if (!xmppRef.current) return;
    const messageStanza = xml(
      "message",
      { to, type: "chat" },
      xml("body", {}, message)
    );
    xmppRef.current.send(messageStanza);
    setMessages((prevMessages) => [
      ...prevMessages,
      { from: "me", body: message, time: new Date() },
    ]);
  };

  const addContact = (jid: string, name: string) => {
    if (!xmppRef.current) return;
    const iq = xml(
      "iq",
      { type: "set", id: "add_contact_1" },
      xml("query", { xmlns: "jabber:iq:roster" }, xml("item", { jid, name }))
    );
    xmppRef.current.send(iq);
  };

  const setPresence = (status: string) => {
    if (!xmppRef.current) return;
    const presence = xml("presence", {}, xml("status", {}, status));
    xmppRef.current.send(presence);
  };

  return {
    isConnected,
    contacts,
    messages,
    error,
    sendMessage,
    addContact,
    setPresence,
  };
};

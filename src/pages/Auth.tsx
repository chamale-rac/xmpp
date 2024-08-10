import { client } from "@xmpp/client";
import debug from "@xmpp/debug";

// Insecure!
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const xmpp = client({
  service: "ws://alumchat.lol:7070/ws",
  domain: "alumchat.lol",
  username: "cha21881",
  password: "admin",
  resource: "",
});

debug(xmpp, true);

xmpp.iqCaller.set;

xmpp.on("error", (err) => {
  console.error("XMPP", "error", err);
});

xmpp.on("online", async (address) => {
  console.log("XMPP", "online", { address });
});

xmpp.on("offline", async () => {
  console.log("XMPP", "offline");
});

xmpp.on("query", async (query) => {
  console.log("XMPP", "query", { query });
});

xmpp.on("stanza", async (stanza) => {
  console.log("XMPP", "stanza", { stanza });
});

xmpp
  .start()
  .then()
  .catch((err) => {
    if (err.message.includes("Connection is not offline")) {
      console.error("XMPP", "connecting");
    } else {
      console.error("XMPP", err);
    }
  });

const Auth = () => {
  return <div>Auth</div>;
};

export default Auth;

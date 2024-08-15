import { useContext } from "react";
import { XmppContext } from "@/lib/XmppContext";

// Create a custom hook to use the context
export const useXmpp = () => {
  const context = useContext(XmppContext);
  if (!context) {
    throw new Error("useXmpp must be used within an XmppProvider");
  }
  return context;
};

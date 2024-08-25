import { useState } from "react";
import { client, xml } from "@xmpp/client";
import debug from "@xmpp/debug";
import XMPPError from "@xmpp/error";

interface XmppConnectionOptions {
  service: string;
  domain: string;
  resource: string;
}

type CustomError = XMPPError & { code: string };

/**
 * Custom hook to manage XMPP user registration and authentication.
 */
export const useEphemeralXmpp = (xmppOptions: XmppConnectionOptions) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerXmppUser = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setIsRegistering(true);
    setError(null);

    try {
      const xmppConnectionOptions = {
        service: xmppOptions.service,
        resource: xmppOptions.resource,
      };

      const xmpp = client(xmppConnectionOptions);
      debug(xmpp, true);

      return new Promise((resolve, reject) => {
        xmpp.on("error", async (error: CustomError) => {
          if (error.code === "ECONNERROR") {
            await xmpp.stop();
            xmpp.removeAllListeners();
            reject(
              "Connection error. Please check your network and try again."
            );
          }
        });

        xmpp.on("open", () => {
          xmpp.send(
            xml(
              "iq",
              { type: "set", to: xmppOptions.domain, id: "register" },
              xml(
                "query",
                { xmlns: "jabber:iq:register" },
                xml("username", {}, username),
                xml("password", {}, password)
              )
            )
          );
        });

        xmpp.on("stanza", async (stanza) => {
          if (stanza.is("iq") && stanza.getAttr("id") === "register") {
            await xmpp.stop();
            xmpp.removeAllListeners();

            if (stanza.getAttr("type") === "result") {
              resolve(true);
            } else if (stanza.getAttr("type") === "error") {
              const error = stanza.getChild("error");
              let errorMessage = "An unknown error occurred. Please try again.";
              if (error?.getChild("conflict")) {
                errorMessage =
                  "Username already exists. Please choose a different username.";
              }
              reject(errorMessage);
            }
          }
        });

        xmpp.start().catch((err) => console.error("xmpp.start", err));
      });
    } catch (e) {
      setError(e as string);
      throw e;
    } finally {
      setIsRegistering(false);
    }
  };

  const checkXmppUser = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setIsChecking(true);
    setError(null);

    try {
      const xmppConnectionOptions = {
        service: xmppOptions.service,
        resource: xmppOptions.resource,
        username,
        password,
      };

      const xmpp = client(xmppConnectionOptions);
      debug(xmpp, true);

      return new Promise((resolve, reject) => {
        xmpp.on("error", async (error: CustomError) => {
          if (error.condition === "not-authorized") {
            await xmpp.stop();
            xmpp.removeAllListeners();
            resolve(false);
          } else if (error.code === "ECONNERROR") {
            await xmpp.stop();
            xmpp.removeAllListeners();
            reject(
              "Connection error. Please check your network and try again."
            );
          }
        });

        xmpp.on("online", async () => {
          await xmpp.stop();
          xmpp.removeAllListeners();
          resolve(true);
        });

        xmpp.start().catch((err) => console.error("xmpp.start", err));
      });
    } catch (e) {
      setError(e as string);
      throw e;
    } finally {
      setIsChecking(false);
    }
  };

  const deleteXmppUser = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    try {
      const xmppConnectionOptions = {
        service: xmppOptions.service,
        resource: xmppOptions.resource,
        username,
        password,
      };

      const xmpp = client(xmppConnectionOptions);
      debug(xmpp, true);

      return new Promise((resolve, reject) => {
        xmpp.on("error", async (error: CustomError) => {
          if (error.code === "ECONNERROR") {
            await xmpp.stop();
            xmpp.removeAllListeners();
            reject(
              "Connection error. Please check your network and try again."
            );
          }
        });

        xmpp.on("online", () => {
          xmpp.send(
            xml(
              "iq",
              { type: "set", id: "delete-account" },
              xml("query", { xmlns: "jabber:iq:register" }, xml("remove"))
            )
          );
        });

        xmpp.on("stanza", async (stanza) => {
          if (stanza.is("iq") && stanza.getAttr("id") === "delete-account") {
            await xmpp.stop();
            xmpp.removeAllListeners();

            if (stanza.getAttr("type") === "result") {
              resolve(true);
            } else if (stanza.getAttr("type") === "error") {
              const error = stanza.getChild("error");
              let errorMessage =
                "An unknown error occurred while deleting the account. Please try again.";
              if (error?.getChild("not-allowed")) {
                errorMessage = "Account deletion is not allowed.";
              }
              reject(errorMessage);
            }
          }
        });

        xmpp.start().catch((err) => console.error("xmpp.start", err));
      });
    } catch (e) {
      setError(e as string);
      throw e;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    registerXmppUser,
    checkXmppUser,
    deleteXmppUser,
    isRegistering,
    isChecking,
    isDeleting,
    error,
  };
};

// References:
// - https://github.com/fedixyz/fedi/blob/be1cf422df9882c8a449feecb0c11b71b8208be0/ui/common/utils/xmpp.ts#L58

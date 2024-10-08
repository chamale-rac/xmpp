import React, { useState } from "react";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useXmpp } from "@/lib/hooks/useXmpp";
import { useUser } from "@/lib/UserContext";

import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";

interface signUpResolve {
  name: string;
}

const SignUp = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  const { registerXmppUser, closeSession, globalXmppOptions } = useXmpp();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const signUpPromise = new Promise<signUpResolve>(
      // eslint-disable-next-line no-async-promise-executor
      async (resolve, reject) => {
        try {
          const isRegistered = await registerXmppUser(username, password);
          if (isRegistered) {
            login(username, password);
            resolve({ name: username });
            // wait 200 ml seconds before redirecting to home
            closeSession();
            setTimeout(() => {
              navigate("/home", { replace: true });
            }, 200);
          } else {
            reject(
              new Error(
                "An error occurred during registration. Probably the username is already taken."
              )
            );
          }
        } catch {
          reject(
            new Error(
              "An error occurred during registration. Please try again later."
            )
          );
        }
      }
    );

    toast.promise(signUpPromise, {
      loading: "Creating your account...",
      success: (data) =>
        `Welcome, ${data.name}! Your account has been created.`,
      error: (err) => `${err.message}`,
    });
  };

  return (
    <div className="h-dvh flex flex-col items-center justify-between  p-4">
      <div className="w-full px-4 py-6 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-bold text-gray-900 dark:text-gray-100"
        >
          XMPP Chat
        </Link>
        <NavigationMenu>
          <NavigationMenuList className="flex gap-4">
            <ModeToggle />
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <MaxWidthWrapper className="flex items-center justify-center">
        <Card className="mx-auto max-w-sm transition-all">
          <CardHeader>
            <CardTitle className="text-2xl">Sign Up</CardTitle>
            <CardDescription>
              Enter your information to create an account. You will be connected
              to{" "}
              <span className="font-bold underline">
                {globalXmppOptions.domain}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  {username.includes("@") && username.length > 0 && (
                    <div className="text-red-400 text-xs truncate max-w-fit mt-1.5">
                      Username should not include domain. e.g. user
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    {/* <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link> */}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create an account
                </Button>
                {/* <Button variant="outline" className="w-full">
                Sign up with Google
              </Button> */}
              </div>
            </form>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <NavLink to="/login" replace={true} className="underline">
                Log in
              </NavLink>
            </div>
          </CardContent>
        </Card>
      </MaxWidthWrapper>
      <div className="w-full h-20 flex items-center justify-center border-t text-gray-600 dark:border-border dark:text-gray-300">
        <p>&copy; 2024 XMPP Chat.</p>
      </div>
    </div>
  );
};

export default SignUp;

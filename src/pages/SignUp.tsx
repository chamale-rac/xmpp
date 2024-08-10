import React, { useState } from "react";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { NavLink } from "react-router-dom";
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

const xmppOptions = {
  service: "ws://alumchat.lol:7070/ws",
  domain: "alumchat.lol",
  resource: "",
};

interface signUpResolve {
  name: string;
}

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { registerXmppUser } = useXmpp(xmppOptions);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const signUpPromise = new Promise<signUpResolve>(
      // eslint-disable-next-line no-async-promise-executor
      async (resolve, reject) => {
        try {
          const isRegistered = await registerXmppUser(username, password);
          if (isRegistered) {
            resolve({ name: username });
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
    <MaxWidthWrapper className="flex h-dvh items-center justify-center">
      <Card className="mx-auto max-w-sm transition-all">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
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
  );
};

export default SignUp;

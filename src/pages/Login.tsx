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
import { useState } from "react";
import { useXmpp } from "@/lib/hooks/useXmpp";
import { useUser } from "@/lib/UserContext";

import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";

interface loginResolve {
  name: string;
}

const Login = () => {
  const { checkXmppUser, closeSession, globalXmppOptions } = useXmpp();
  const { login } = useUser();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // eslint-disable-next-line no-async-promise-executor
    const loginPromise = new Promise<loginResolve>(async (resolve, reject) => {
      try {
        const isAuthenticated = await checkXmppUser(username, password);
        if (isAuthenticated) {
          login(username, password);
          resolve({ name: username });
          // wait 200 ml seconds before redirecting to home
          closeSession();
          setTimeout(() => {
            navigate("/home", { replace: true });
          }, 200);
        } else {
          reject(new Error("Invalid credentials. Please try again."));
        }
      } catch {
        reject(
          new Error(
            "An error occurred while logging in. Please try again later."
          )
        );
      }
    });

    toast.promise(loginPromise, {
      loading: "Logging in...",
      success: (data) => `Welcome, ${data.name}!`,
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
        <Card className="mx-auto max-w-sm ">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your username below to login to your account. You will be
              connected to{" "}
              <span className="font-bold underline">
                {globalXmppOptions.domain}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
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
                  />{" "}
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
                  Login
                </Button>
                {/* <Button variant="outline" className="w-full">
                Login with Google
              </Button> */}
              </div>
            </form>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <NavLink to="/signup" replace={true} className="underline">
                Sign up
              </NavLink>
            </div>
          </CardContent>
        </Card>
      </MaxWidthWrapper>

      <div className="w-full h-20 flex items-center justify-center border-t text-gray-600 dark:border-border dark:text-gray-300">
        <p>&copy; 2024 XMPP Chat. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Login;

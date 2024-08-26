import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { ModeToggle } from "./components/mode-toggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {" "}
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
            <NavigationMenuLink asChild>
              <Link
                to={"/login"}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
              >
                Login
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild>
              <Link
                to={"/signup"}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
              >
                Sign Up
              </Link>
            </NavigationMenuLink>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="flex-1 justify-center flex items-center mb-32">
        <Card className="flex flex-col items-center justify-center space-y-4 text-center border-none shadow-none">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <MessageCircle className="w-32 h-32 text-primary opacity-80" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              XMPP Chat
            </CardTitle>
            <CardDescription className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Connect and chat with XMPP servers using this web client.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col space-y-4">
            <div className="flex space-x-4 w-full">
              <Button asChild className="flex-1">
                <Link to="/login">Get Started</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <a href="https://github.com/chamale-rac/xmpp" target="_blank">
                  <GitHubLogoIcon className="mr-2 h-4 w-4" />
                  Learn More
                </a>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      <div className="w-full h-20 flex items-center justify-center border-t text-gray-600 dark:border-border dark:text-gray-300">
        <p>&copy; 2024 XMPP Chat.</p>
      </div>
    </div>
  );
}

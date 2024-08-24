import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Github, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold">XMPP Chat</CardTitle>
          <CardDescription>Connect and chat with XMPP</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <MessageCircle className="w-24 h-24 text-primary" />
          </div>
          <p className="text-center text-muted-foreground">
            Welcome to this XMPP application. Enjoy secure, real-time messaging
            with friends and colleagues.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex space-x-4 w-full">
            <Button asChild className="flex-1">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
          <Button asChild variant="ghost" className="w-full">
            <a
              href="https://github.com/chamale-rac/xmpp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center"
            >
              <Github className="mr-2 h-4 w-4" />
              View on GitHub
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

import "./index.css";

import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/lib/theme-provider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.tsx";
import Login from "@/pages/Login.tsx";
import SignUp from "@/pages/SignUp.tsx";
import Home from "@/pages/Home.tsx";

import { Toaster } from "@/components/ui/sonner.tsx";

import { XmppProvider } from "@/lib/XmppContext.tsx";
import { UserProvider } from "@/lib/UserContext.tsx";

// Define global variables and functions
declare global {
  interface Window {
    btoa: (input: string) => string;
    WebSocket: typeof WebSocket;
  }
}

// Ensure btoa is available globally
if (typeof window !== "undefined" && !window.btoa) {
  window.btoa = (input) => Buffer.from(input).toString("base64");
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/home",
    element: <Home />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <UserProvider>
        <XmppProvider>
          <RouterProvider router={router} />
          <Toaster offset={12} />
        </XmppProvider>
      </UserProvider>
    </ThemeProvider>
  </>
);

// The AnimatedCursor component remains commented out

{
  /*     <AnimatedCursor
      innerSize={8}
      outerSize={20} // Original 35
      innerScale={1}
      outerScale={2}
      outerAlpha={0}
      innerStyle={{
        backgroundColor: "#f0f0f0",
        mixBlendMode: "difference",
      }}
      outerStyle={{
        backgroundColor: "#f0f0f0",
        mixBlendMode: "exclusion",
      }}
    />*/
}

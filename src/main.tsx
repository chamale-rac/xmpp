import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.tsx";
import Login from "@/pages/Login.tsx";
import SignUp from "@/pages/SignUp.tsx";
import Home from "@/pages/Home.tsx";

import "./index.css";
import { Toaster } from "sonner";

import { XmppProvider } from "@/lib/XmppContext.tsx";

// import AnimatedCursor from "react-animated-cursor";

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
  <StrictMode>
    <XmppProvider>
      <RouterProvider router={router} />
      <Toaster />
    </XmppProvider>
    {/* <AnimatedCursor
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
    /> */}
  </StrictMode>
);

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import MiniKitProvider from "./minikit-provider.tsx";
import { StrictMode } from "react";
import { ErudaProvider } from "./components/Eruda";
import { VerifyBlock } from "./components/Verify/index.tsx";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErudaProvider>
      <MiniKitProvider>
        <VerifyBlock />
      </MiniKitProvider>
    </ErudaProvider>
  </StrictMode>
);

"use client"; // Required for Next.js

import { ReactNode, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    MiniKit.install("app_b842771510c922e20401ddc0ec09a5e3");
    console.log(MiniKit.isInstalled());
  }, []);

  return <>{children}</>;
}

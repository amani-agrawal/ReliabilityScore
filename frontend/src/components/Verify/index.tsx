// components/VerifyBlock.tsx
import {
  MiniKit,
  VerificationLevel,
  ISuccessResult,
  MiniAppVerifyActionErrorPayload,
  IVerifyResponse,
} from "@worldcoin/minikit-js";
import { useCallback, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";

export type VerifyCommandInput = {
  action: string;
  signal?: string;
  verification_level?: VerificationLevel.Device;
};

const verifyPayload: VerifyCommandInput = {
  action: "verify-ppl", // This is your action ID from the Developer Portal
  signal: "",
  verification_level: VerificationLevel.Device, // Device or Orb
};

export const VerifyBlock = () => {
  const [handleVerifyResponse, setHandleVerifyResponse] = useState<
    MiniAppVerifyActionErrorPayload | IVerifyResponse | null
  >(null);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

  const handleVerify = useCallback(async () => {
    if (!MiniKit.isInstalled()) {
      console.warn("Tried to invoke 'verify', but MiniKit is not installed.");
      return null;
    }

    // Trigger the verification command from MiniKit.
    const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

    // If there was an error in the verification command, update state and exit.
    if (finalPayload.status === "error") {
      console.log("Command error", finalPayload);
      setHandleVerifyResponse(finalPayload);
      return finalPayload;
    }

    console.log("handleVerify called 2");

    // Send the verification payload to your backend.
    const verifyResponse = await fetch(
      `/${process.env.NEXTAUTH_URL}/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: finalPayload as ISuccessResult, // Parses only the fields we need to verify
          action: verifyPayload.action,
          signal: verifyPayload.signal, // Optional
        }),
      }
    );

    console.log("hello!")

    console.log(verifyResponse)

    const verifyResponseJson = await verifyResponse.json();

    console.log("Response JSON: ", verifyResponseJson);

    if (verifyResponseJson.status === 200) {
      console.log("Verification success!");
      console.log(finalPayload);
      setIsVerified(true);
      // Navigate to the search page after successful verification.
      navigate("/search");
    } else {
      console.log("Verification failed", verifyResponseJson);
    }

    setHandleVerifyResponse(verifyResponseJson);
    return verifyResponseJson;
  }, [navigate]);

  // If the user is not yet verified, show the verification UI.
  if (!isVerified) {
    return (
      <div className="relative z-10 text-center text-black pt-10">
        <button
          className="bg-black text-white p-4 rounded-full hover:bg-gray-800 transition duration-300"
          onClick={handleVerify}
        >
          Verify yourself
        </button>
        <pre>{JSON.stringify(handleVerifyResponse, null, 2)}</pre>
      </div>
    );
  }

  // Once verified, render any nested routes (if applicable).
  return <Outlet />;
};

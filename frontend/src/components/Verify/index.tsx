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
import video from "../../assets/socialgraph.mp4";

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
  const videoStyles: React.CSSProperties = {
    position: "fixed",         // Fix the video relative to the viewport
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",        // Ensure the video covers the viewport without distortion
    filter: "blur(8px)",       // Apply a blur effect
    pointerEvents: "none",     // Disable mouse/touch interactions with the video
    zIndex: -100               // Push the video far behind all other content
  };

  const containerStyles: React.CSSProperties = {
    position: "relative",      // Establish a new stacking context
    zIndex: 1,                 // Make sure this container is above the video
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",  // Center vertically
    alignItems: "center",      // Center horizontally
    width: "100vw",            // Full viewport width
    height: "100vh",           // Full viewport height
    margin: 0,
    padding: 0,
    textAlign: "center",
    color: "black"             // Example text color
  };

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
      `${process.env.NEXTAUTH_URL}/verify`,
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

    console.log("Verification success!");
    console.log(finalPayload);
    setIsVerified(true);
    navigate("/search");

  }, [navigate]);

  if (!isVerified) {
    return (
      <div className="relative z-10 text-center text-black pt-10" style={containerStyles}>
        <video autoPlay loop muted playsInline style={videoStyles}>
          <source src={video} type="video/mp4" />
        </video>
        <h1 className="title">Onchain Reputation</h1>
        <button
          className="bg-black text-white p-4 rounded-full hover:bg-gray-800 transition duration-300"
          onClick={handleVerify}
        >
          Verify yourself
        </button>
      </div>
    );
  }

  return <Outlet />;
};

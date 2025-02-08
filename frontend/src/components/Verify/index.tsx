import {
  MiniKit,
  VerificationLevel,
  ISuccessResult,
  MiniAppVerifyActionErrorPayload,
  IVerifyResponse,
} from "@worldcoin/minikit-js";
import { useCallback, useState, useEffect } from "react";
import App from "../../App"; // Import your App component
import video from '../../assets/socialgraph.mp4';

export type VerifyCommandInput = {
  action: string;
  signal?: string;
  verification_level?: VerificationLevel; // Default: Orb
};

const verifyPayload: VerifyCommandInput = {
  action: "Verify Humans", // This is your action ID from the Developer Portal
  signal: "",
  verification_level: VerificationLevel.Orb, // Orb | Device
};

export const VerifyBlock = () => {
  const [handleVerifyResponse, setHandleVerifyResponse] = useState<
    MiniAppVerifyActionErrorPayload | IVerifyResponse | null
  >(null);
  const [isVerified, setIsVerified] = useState(false); // State to track if verification succeeded

  const handleVerify = useCallback(async () => {
    if (!MiniKit.isInstalled()) {
      console.warn("Tried to invoke 'verify', but MiniKit is not installed.");
      return null;
    }

    const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

    // no need to verify if command errored
    if (finalPayload.status === "error") {
      console.log("Command error");
      console.log(finalPayload);

      setHandleVerifyResponse(finalPayload);
      return finalPayload;
    }

    // Verify the proof in the backend
    const verifyResponse = await fetch(
      `${process.env.NEXTAUTH_URL}/api/verify`,
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

    const verifyResponseJson = await verifyResponse.json();

    if (verifyResponseJson.status === 200) {
      console.log("Verification success!");
      console.log(finalPayload);
      setIsVerified(true); // Set the state to true when verification is successful
    } else {
      setIsVerified(false); // If verification fails, reset the state
    }

    setHandleVerifyResponse(verifyResponseJson);
    return verifyResponseJson;
  }, []);

  useEffect(() => {
    if (!isVerified) {
      handleVerify(); // Automatically call handleVerify on component mount
    }
  }, [isVerified, handleVerify]);

  if (!isVerified) {
    return (
      <div>
        <video autoPlay loop muted className='bgvideo'>
          <source src={video} type="video/mp4" />
        </video>
        <div className="relative z-10 text-center text-black pt-10">
        <button 
          className="bg-black text-white p-4 rounded-full hover:bg-gray-800 transition duration-300"
          onClick={handleVerify}
        >
          Verify yourself
        </button>
      </div>
      </div>
    );
  }

  // If verification is successful, render the App component
  return <App />;
};

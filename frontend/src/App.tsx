// App.tsx
import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import Details from "./ContactDetails";
import Calculating from "./Loading";
import Fail from "./ConnectionFail";
import { VerifyBlock } from "./components/Verify"; 
import video from './assets/socialgraph.mp4';


const Search = () => {
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

  const navigate = useNavigate();
  const [searched, setSearched] = useState("");

  const originWallet = "0xea07d7b355539b166b4e82c5baa9994aecfb3389";

  async function calcRep(
    originAddress: string,
    targetAddress: string,
    outputPath?: string
  ) {
    console.log("calcRep called with:", { originAddress, targetAddress, outputPath });
    try {
      const payload: any = { originAddress, targetAddress };
      if (outputPath) {
        payload.outputPath = outputPath;
      }
      const response = await fetch("/api/calculate-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Backend API error: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error in calcRep:", error);
      return null;
    }
  }

  const handleEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searched) {
      const result = await calcRep(
        originWallet,
        searched,
        "transactions.parquet"
      );
      if (result) {
        navigate("/details", { state: result });
      } else {
        navigate("/noconnection", { state: {} });
      }
    }
  };

  return (
    <div>
      <div style={containerStyles}>
        <video autoPlay loop muted playsInline style={videoStyles}>
          <source src={video} type="video/mp4" />
        </video>
        <h1 className="title">Find a Reputation...</h1>
        <input
          type="text"
          placeholder="e.g - 0x234569493737883aa642"
          value={searched}
          onChange={(e) => setSearched(e.target.value)}
          onKeyDown={handleEnter}
          className="search-input"
        />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Wrap all routes with the verification block */}
        <Route element={<VerifyBlock />}>
          <Route path="/search" element={<Search />} />
          <Route path="/details" element={<Details />} />
          <Route path="/calculating" element={<Calculating />} />
          <Route path="/noconnection" element={<Fail />} />
          {/* If no route matches, redirect to /search */}
          <Route path="*" element={<Navigate to="/search" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

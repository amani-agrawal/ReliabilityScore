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

const Search = () => {
  const navigate = useNavigate();
  const [searched, setSearched] = useState("");

  const originWallet = "0xea07d7b355539b166b4e82c5baa9994aecfb3389";

  async function calcRep(
    originAddress: string,
    targetAddress: string,
    outputPath?: string
  ) {
    try {
      const payload: any = { originAddress, targetAddress };
      if (outputPath) {
        payload.outputPath = outputPath;
      }
      const response = await fetch("/calculate-score", {
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
      <video autoPlay loop muted className="bgvideo"></video>
      <div className="content">
        <h1 className="title">Find a Reputation</h1>
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

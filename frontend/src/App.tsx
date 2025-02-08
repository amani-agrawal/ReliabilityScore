import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Details from './ContactDetails';
import video from './assets/socialgraph.mp4';
import Calculating from './Loading';
import Fail from './ConnectionFail';

//SAMPLE DATA BELOW --PLS DELETE
const contacts = [
  { score: 82, address: "0x234569493737883aa642", uniquePaths: 12, strength: 58},
  { score: 90, address: "0x830447C87C893b19d97d9f1405E08F8d6480542F", uniquePaths: 2, strength: 98},
  { score: 78, address: "Wallet 3", uniquePaths: 1, strength: 17},
  { score: 88, address: "Wallet 4", uniquePaths: 14, strength: 78},
  { score: 92, address: "Wallet 5", uniquePaths: 56, strength: 74},
  { score: 99, address: "Wallet 6", uniquePaths: 9, strength: 37}
];

const Search = () => {
  const navigate = useNavigate();
  const [searched, setSearched] = useState("");
  
  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact =>
    contact.address.toLowerCase() == searched.toLowerCase()
  );

  
  return (
      <div >
        <video autoPlay loop muted className='bgvideo'>
          <source src={video} type="video/mp4" />
        </video>
        <div className="content">
          <h1 className="title">Find a Reputation</h1>
          <input
            type="text"
            placeholder="e.g - 0x234569493737883aa642"
            value={searched}
            onChange={(e) => setSearched(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searched) {
                navigate(filteredContacts.length > 0 ? "/details" : "/noconnection", { 
                  state: filteredContacts[0] || {} 
                });
              }
            }}            
            className="search-input"
          />
        </div>
      </div>
    );
}


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/details" element={<Details />} />
        <Route path="/calculating" element={<Calculating />} />
        <Route path="/noconnection" element={<Fail />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
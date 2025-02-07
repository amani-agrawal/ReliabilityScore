import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import "./App";

const contacts = [
  { name: "Emma Watson", score: 85, email: "ew123@nyu.edu", phone: "78239487374", address: "Wallet 1" },
  { name: "Liam Johnson", score: 90, email: "lj8793@nyu.edu", phone: "6789034562", address: "Wallet 2"  },
  { name: "Olivia Brown", score: 78, email: "ob6797@nyu.edu", phone: "1234567890", address: "Wallet 3"  },
  { name: "Noah Davis", score: 88, email: "nd383@nyu.edu", phone: "0987654321", address: "Wallet 4"  },
  { name: "Ava Wilson", score: 92, email: "aw23432@nyu.edu", phone: "5678904321", address: "Wallet 5"  },
  { name: "Ave Ling", score: 99, email: "al23432@nyu.edu", phone: "8348847483", address: "Wallet 6"  }

];

export default function Search() {
  const navigate = useNavigate();
  const [searched, setSearched] = useState("");

  const goToDetails = () => {
    navigate('/details');
  };
  
  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searched.toLowerCase()) ||
    contact.address.toLowerCase().includes(searched.toLowerCase())
  );

  
  return (
      <div className="flex flex-col items-center h-screen p-10">
    
        <input
          type="text"
          placeholder="Search for people"
          value={searched}
          onChange={(e) => setSearched(e.target.value)}
          className="search-input"
        />
        
        {searched && filteredContacts.length > 0 && (
          <ul className="dropdown">
            {filteredContacts.map((contact, index) => (
                <button onClick={goToDetails} key={index} className="p-2 hover:bg-gray-200 cursor-pointer">
                {contact.address} </button>
              
            ))}
          </ul>
        )}

        {searched && filteredContacts.length === 0 && (
          <p className="mt-2 text-gray-500">No results found</p>
        )}
        
      </div>
    );
}

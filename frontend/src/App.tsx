import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Search from './ContactSearch'; // Import your Search component
import Details from './ContactDetails';

const HomePage = () => {
  const navigate = useNavigate();

  // Function to navigate to /search
  const goToSearch = () => {
    navigate('/search');
  };

  const goToDetails = () => {
    navigate('/details');
  };
  
  return (
    <div>
      <button onClick={goToSearch}>Go to Search</button>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<Search />} />
        <Route path="/details" element={<Details />} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default App;

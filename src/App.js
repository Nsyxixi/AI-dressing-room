import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import StyleSelection from './components/StyleSelection';
import DressingRoom from './components/DressingRoom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/style-selection" element={<StyleSelection />} />
          <Route path="/dressing-room/:style" element={<DressingRoom />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
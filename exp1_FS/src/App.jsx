import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

import React from 'react';
import PostComposer from './components/PostComposer'; // Adjust path if needed

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <PostComposer />
    </div>
  );
}

export default App

//Filename: App.jsx
//Author: Kyle McColgan
//Date: 23 December 2025
//Description: This file contains the main component for the React Fireplace project.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

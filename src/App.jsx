//Filename: App.jsx
//Author: Kyle McColgan
//Date: 13 February 2026
//Description: This file contains the entry component for the React Fireplace project.

import Fireplace from "./components/Fireplace/Fireplace";
import "./App.css";

function App()
{
  return (
    <main className="app" aria-label="Fireplace experience">
      <Fireplace />
    </main>
  );
}

export default App;

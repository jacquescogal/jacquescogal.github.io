import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "./App.css";
import Homepage from "./pages/Homepage";
import ChatTest from "./pages/BenDay";

function App() {
  useEffect(() => {
    window.history.scrollRestoration = "manual";
  }, []);

  return (
    <div className="App">
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/chat-test" element={<ChatTest />} />
        <Route path="*" element={<p>There's nothing here: 404!</p>} />
      </Routes>
    </div>
  );
}

export default App;

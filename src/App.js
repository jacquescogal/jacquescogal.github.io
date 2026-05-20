import React, { Suspense, lazy, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "./App.css";
import Homepage from "./pages/Homepage";

const ChatTest = lazy(() => import("./pages/BenDay"));

function App() {
  useEffect(() => {
    window.history.scrollRestoration = "manual";
  }, []);

  return (
    <div className="App">
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route
          path="/chat-test"
          element={
            <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading...</div>}>
              <ChatTest />
            </Suspense>
          }
        />
        <Route path="*" element={<p>There's nothing here: 404!</p>} />
      </Routes>
    </div>
  );
}

export default App;

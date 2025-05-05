import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/home/HomePage";
// import { useContext } from "react";
import {  AuthProvider } from "./context/AuthContext";

function App() {
  // Replace this with your actual authentication logic

  return (
    <Router>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AuthProvider>
          <Routes>
            <Route path="/home" element={<HomePage />} />
          </Routes>
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App;

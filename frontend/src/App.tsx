import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import LoginPage from "./components/auth/login/LoginPage";
import RegisterPage from "./components/auth/register/RegisterPage";
import HomePage from "./components/home/HomePage";

import { useContext } from "react";
import { AuthContext, AuthProvider } from "./context/AuthContext";

function App() {
  const isAuthenticated = useContext(AuthContext); // Replace this with your actual authentication logic

  return (
    <Router>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated
                  ? <HomePage />
                  : <Navigate to="/login" replace />
              }
            />
          </Routes>
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App;

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(
        "https://tma-bq16.onrender.com/api/auth/me",
        { withCredentials: true }
      );
      setUser(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(
        "https://tma-bq16.onrender.com/api/auth/login",
        { email, password },
        { withCredentials: true }
      );
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        "https://tma-bq16.onrender.com/api/auth/logout",
        {},
        { withCredentials: true }
      );
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

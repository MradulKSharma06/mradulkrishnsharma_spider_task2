/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

  const login = (data) => {
    const flatUser = {
      ...data.user,      
      token: data.token,  
    };

    localStorage.setItem("user", JSON.stringify(flatUser));
    setUser(flatUser);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const setProfilePicture = (newUrl) => {
    if (!user) return;
    const updatedUser = { ...user, profilePicture: newUrl };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, setProfilePicture }}>
      {children}
    </AuthContext.Provider>
  );
};

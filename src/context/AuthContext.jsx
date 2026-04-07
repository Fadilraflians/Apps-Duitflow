import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('duitflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('duitflow_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('duitflow_user');
  };

  const updateUserLimit = async (newLimit) => {
    if (!user) return;
    try {
      const apiBase = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`);
      const response = await fetch(`${apiBase}/users/${user.id}/limit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthly_limit: newLimit })
      });
      if (response.ok) {
        const updatedUser = { ...user, monthly_limit: parseFloat(newLimit) };
        setUser(updatedUser);
        localStorage.setItem('duitflow_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Failed to update limit", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserLimit }}>
      {children}
    </AuthContext.Provider>
  );
};

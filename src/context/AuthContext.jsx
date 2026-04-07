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
      const getApiUrl = () => `http://${window.location.hostname}:5000/api/users/${user.id}/limit`;
      const response = await fetch(getApiUrl(), {
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

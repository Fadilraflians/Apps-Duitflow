import { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Read the saved session synchronously so the first render already knows
  // whether someone is signed in (avoids a flash of the landing page).
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('duitflow_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

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

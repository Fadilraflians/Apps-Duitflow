import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Onboarding from './screens/Onboarding';
import HomeDashboard from './screens/HomeDashboard';
import Analytics from './screens/Analytics';
import AddTransaction from './screens/AddTransaction';
import Goals from './screens/Goals';
import Profile from './screens/Profile';
import Login from './screens/Login';
import Register from './screens/Register';
import Transactions from './screens/Transactions';
import MoneyDetails from './screens/MoneyDetails';
import CashflowDetails from './screens/CashflowDetails';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/home" element={<HomeDashboard />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/add" element={<AddTransaction />} />
      <Route path="/goals" element={<Goals />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/money-details" element={<MoneyDetails />} />
      <Route path="/cashflow-details/:type" element={<CashflowDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { FinanceProvider } from './context/FinanceContext'
import { AuthProvider } from './context/AuthContext'
import { GoalsProvider } from './context/GoalsContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FinanceProvider>
          <GoalsProvider>
            <App />
          </GoalsProvider>
        </FinanceProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

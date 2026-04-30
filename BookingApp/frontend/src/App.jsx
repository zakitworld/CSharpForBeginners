import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './api/client'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))
  const [token, setToken] = useState(localStorage.getItem('token'))

  const handleAuthSuccess = (data) => {
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={!token ? <Login onAuthSuccess={handleAuthSuccess} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/" 
            element={token ? <Dashboard user={user} token={token} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App

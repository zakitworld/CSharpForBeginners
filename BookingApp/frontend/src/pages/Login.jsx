import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, Calendar, Mail, Lock, UserCircle, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { login, register } from '../api'

export default function Login({ onAuthSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      if (isRegistering) {
        await register(authForm.username, authForm.email, authForm.password)
        setSuccess('Registration successful! Please log in.')
        setIsRegistering(false)
        setAuthForm({ ...authForm, password: '' })
      } else {
        const data = await login(authForm.email, authForm.password)
        onAuthSuccess(data)
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass auth-card"
      >
        <div className="auth-header">
          <div className="logo-container">
            <Calendar size={40} className="logo-icon" />
          </div>
          <h1>Booking<span>App</span></h1>
          <p>{isRegistering ? 'Create your account' : 'Welcome back'}</p>
        </div>

        <form onSubmit={handleAuth}>
          <AnimatePresence mode="wait">
            {isRegistering && (
              <motion.div 
                key="username"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="input-group"
              >
                <label><UserCircle size={16} /> Username</label>
                <input 
                  type="text" 
                  required 
                  placeholder="john_doe"
                  value={authForm.username}
                  onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="input-group">
            <label><Mail size={16} /> Email Address</label>
            <input 
              type="email" 
              required 
              placeholder="you@example.com"
              value={authForm.email}
              onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label><Lock size={16} /> Password</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              value={authForm.password}
              onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
            />
          </div>

          {error && <motion.div initial={{ x: -10 }} animate={{ x: 0 }} className="alert error"><AlertCircle size={18} /> {error}</motion.div>}
          {success && <motion.div initial={{ y: 10 }} animate={{ y: 0 }} className="alert success"><CheckCircle2 size={18} /> {success}</motion.div>}

          <button className="btn btn-primary btn-large" disabled={loading}>
            {loading ? 'Processing...' : (isRegistering ? <><UserPlus size={18} /> Sign Up</> : <><LogIn size={18} /> Sign In</>)}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-btn">
              {isRegistering ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, Calendar, Plus, LogOut, Clock, User as UserIcon, AlertCircle, CheckCircle2, UserPlus, Shield, Mail, Lock, UserCircle } from 'lucide-react'
import { login, register, getBookings, createBooking } from './api'

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [isRegistering, setIsRegistering] = useState(false)
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' })
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // New booking form state
  const [newBooking, setNewBooking] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    start: '09:00:00',
    end: '10:00:00',
    description: ''
  })

  useEffect(() => {
    if (token) {
      fetchBookings()
    }
  }, [token])

  const fetchBookings = async () => {
    try {
      const data = await getBookings(token)
      setBookings(data)
    } catch (err) {
      console.error(err)
      if (err.message.includes('401')) handleLogout()
    }
  }

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
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const handleCreateBooking = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const combinedStart = new Date(`${newBooking.date}T${newBooking.start}`).toISOString();
      const combinedEnd = new Date(`${newBooking.date}T${newBooking.end}`).toISOString();

      await createBooking(token, {
        ...newBooking,
        start: combinedStart,
        end: combinedEnd,
      })

      setSuccess('Booking created successfully!')
      fetchBookings()
      setNewBooking({
        title: '',
        date: new Date().toISOString().split('T')[0],
        start: '09:00:00',
        end: '10:00:00',
        description: ''
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
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

  return (
    <div className="app-container">
      <nav className="navbar glass">
        <div className="nav-content">
          <div className="nav-logo">
            <Calendar size={24} className="primary-color" />
            <span>Booking<span>App</span></span>
          </div>
          <div className="nav-user">
            <div className="user-info">
              <span className="user-name">{user?.username}</span>
              <div className="user-badges">
                {user?.roles?.map(role => (
                  <span key={role} className="badge role-badge">
                    <Shield size={10} /> {role}
                  </span>
                ))}
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1>My <span>Dashboard</span></h1>
            <p>You have {bookings.length} upcoming appointments</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary"><Clock size={18} /> History</button>
          </div>
        </header>

        <div className="dashboard-layout">
          <section className="bookings-section">
            <div className="section-header">
              <Calendar size={20} className="primary-color" />
              <h2>Upcoming Bookings</h2>
            </div>

            <div className="bookings-grid">
              <AnimatePresence>
                {bookings.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="empty-state glass"
                  >
                    <Calendar size={48} />
                    <p>No bookings found. Start by creating one!</p>
                  </motion.div>
                ) : (
                  bookings.map((booking, idx) => (
                    <motion.div 
                      key={booking.id || idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="glass booking-card"
                    >
                      <div className="card-status">
                        <CheckCircle2 size={20} />
                      </div>
                      <div className="card-content">
                        <h3>{booking.title}</h3>
                        {booking.description && <p className="description">{booking.description}</p>}
                        <div className="card-meta">
                          <span><Calendar size={14} /> {new Date(booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span><Clock size={14} /> {new Date(booking.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>

          <aside className="sidebar">
            <div className="glass creation-card">
              <div className="section-header">
                <Plus size={20} className="primary-color" />
                <h2>New Booking</h2>
              </div>

              <form onSubmit={handleCreateBooking}>
                <div className="input-group">
                  <label>Title</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Meeting"
                    value={newBooking.title}
                    onChange={(e) => setNewBooking({...newBooking, title: e.target.value})}
                  />
                </div>

                <div className="input-group">
                  <label>Description</label>
                  <textarea 
                    placeholder="Optional details..."
                    value={newBooking.description}
                    onChange={(e) => setNewBooking({...newBooking, description: e.target.value})}
                  />
                </div>

                <div className="input-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    required 
                    value={newBooking.date}
                    onChange={(e) => setNewBooking({...newBooking, date: e.target.value})}
                  />
                </div>

                <div className="time-grid">
                  <div className="input-group">
                    <label>From</label>
                    <input 
                      type="time" 
                      required 
                      value={newBooking.start}
                      onChange={(e) => setNewBooking({...newBooking, start: e.target.value})}
                    />
                  </div>
                  <div className="input-group">
                    <label>To</label>
                    <input 
                      type="time" 
                      required 
                      value={newBooking.end}
                      onChange={(e) => setNewBooking({...newBooking, end: e.target.value})}
                    />
                  </div>
                </div>

                {error && <div className="alert error small"><AlertCircle size={14} /> {error}</div>}
                {success && <div className="alert success small"><CheckCircle2 size={14} /> {success}</div>}

                <button className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Creating...' : 'Book Appointment'}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </main>

    </div>
  )
}

export default App

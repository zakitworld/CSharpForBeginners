import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, Calendar, Plus, LogOut, Clock, User as UserIcon, AlertCircle, CheckCircle2 } from 'lucide-react'
import { login, getBookings, createBooking } from './api'

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [email, setEmail] = useState('')
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

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await login(email)
      setToken(data.token)
      localStorage.setItem('token', data.token)
      // For simplicity, we just use the email as the user name
      setUser({ email })
    } catch (err) {
      setError('Login failed. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }

  const handleCreateBooking = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const combinedStart = new Date(`${newBooking.date}T${newBooking.start}`).toISOString();
      const combinedEnd = new Date(`${newBooking.date}T${newBooking.end}`).toISOString();

      const response = await createBooking(token, {
        ...newBooking,
        start: combinedStart,
        end: combinedEnd,
        userId: '00000000-0000-0000-0000-000000000000' // Matches Guid in model
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
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass card"
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Calendar size={48} color="#6366f1" style={{ marginBottom: '1rem' }} />
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>BookingApp</h1>
            <p style={{ color: 'var(--text-muted)' }}>Sign in to manage your appointments</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && <p style={{ color: 'var(--error)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Signing in...' : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
            My <span style={{ color: 'var(--primary)' }}>Bookings</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back to your dashboard</p>
        </div>
        <button onClick={handleLogout} className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
          <LogOut size={18} /> Logout
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        {/* Main Content: Booking List */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Calendar size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem' }}>Upcoming Appointments</h2>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <AnimatePresence>
              {bookings.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--glass-border)' }}
                >
                  <p style={{ color: 'var(--text-muted)' }}>No bookings found. Start by creating one!</p>
                </motion.div>
              ) : (
                bookings.map((booking, idx) => (
                  <motion.div 
                    key={booking.id || idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass"
                    style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <h3 style={{ marginBottom: '0.25rem' }}>{booking.title}</h3>
                      <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Calendar size={14} /> {new Date(booking.date).toLocaleDateString()}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Clock size={14} /> {booking.start} - {booking.end}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                      <CheckCircle2 size={24} />
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Sidebar: Create Booking */}
        <aside>
          <div className="glass" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Plus size={20} color="var(--primary)" />
              <h2 style={{ fontSize: '1.25rem' }}>New Booking</h2>
            </div>

            <form onSubmit={handleCreateBooking}>
              <div className="input-group">
                <label>Event Title</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Dental Checkup"
                  value={newBooking.title}
                  onChange={(e) => setNewBooking({...newBooking, title: e.target.value})}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Start Time</label>
                  <input 
                    type="time" 
                    required 
                    step="1"
                    value={newBooking.start}
                    onChange={(e) => setNewBooking({...newBooking, start: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>End Time</label>
                  <input 
                    type="time" 
                    required 
                    step="1"
                    value={newBooking.end}
                    onChange={(e) => setNewBooking({...newBooking, end: e.target.value})}
                  />
                </div>
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {success && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  <CheckCircle2 size={16} /> {success}
                </div>
              )}

              <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                {loading ? 'Creating...' : 'Book Now'}
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default App

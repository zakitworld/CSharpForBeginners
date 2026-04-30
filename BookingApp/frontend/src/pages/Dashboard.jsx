import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Plus, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { getBookings, createBooking } from '../api'
import Navbar from '../components/Navbar'

export default function Dashboard({ user, token, onLogout }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [newBooking, setNewBooking] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    start: '09:00:00',
    end: '10:00:00',
    description: ''
  })

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const data = await getBookings(token)
      setBookings(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateBooking = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const combinedStart = new Date(`${newBooking.date}T${newBooking.start}`).toISOString()
      const combinedEnd = new Date(`${newBooking.date}T${newBooking.end}`).toISOString()

      const created = await createBooking(token, {
        ...newBooking,
        start: combinedStart,
        end: combinedEnd,
      })

      setSuccess('Booking created successfully!')
      setBookings(prev => [created, ...prev])
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

  return (
    <div className="app-container">
      <Navbar user={user} onLogout={onLogout} />

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1>My <span>Dashboard</span></h1>
            <p>You have {bookings.length} upcoming appointments</p>
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
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state glass">
                    <Calendar size={48} />
                    <p>No bookings found.</p>
                  </motion.div>
                ) : (
                  bookings.map((booking, idx) => (
                    <motion.div 
                      key={booking.id || idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass booking-card"
                    >
                      <div className="card-status"><CheckCircle2 size={20} /></div>
                      <div className="card-content">
                        <h3>{booking.title}</h3>
                        <p className="description">{booking.description}</p>
                        <div className="card-meta">
                          <span><Calendar size={14} /> {new Date(booking.date).toLocaleDateString()}</span>
                          <span><Clock size={14} /> {new Date(booking.start).toLocaleTimeString()}</span>
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
                  <input type="text" required value={newBooking.title} onChange={(e) => setNewBooking({...newBooking, title: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Date</label>
                  <input type="date" required value={newBooking.date} onChange={(e) => setNewBooking({...newBooking, date: e.target.value})} />
                </div>
                <div className="time-grid">
                   <input type="time" value={newBooking.start} onChange={(e) => setNewBooking({...newBooking, start: e.target.value})} />
                   <input type="time" value={newBooking.end} onChange={(e) => setNewBooking({...newBooking, end: e.target.value})} />
                </div>
                {error && <div className="alert error small">{error}</div>}
                {success && <div className="alert success small">{success}</div>}
                <button className="btn btn-primary btn-full" disabled={loading}>Book Appointment</button>
              </form>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

import { Calendar, Shield, LogOut } from 'lucide-react'

export default function Navbar({ user, onLogout }) {
  return (
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
          <button onClick={onLogout} className="logout-btn" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  )
}

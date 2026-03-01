import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, Calculator, BrainCircuit, FileBarChart, Settings, Sun, Moon, LogOut, UserCircle } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CalculatorApp from './pages/CalculatorApp';
import MLInsights from './pages/MLInsights';
import Reports from './pages/Reports';
import Auth from './pages/Auth';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === '/';
  const isAuthPage = location.pathname === '/login';
  const { currentUser, logout } = useAuth();

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  // Don't show navbar on auth page
  if (isAuthPage) return null;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <div className="logo-icon">☁️</div>
        <span><span style={{ color: 'white' }}>Green</span> <span className="logo-pulse">Cloud</span> <span style={{ fontSize: '0.8em', color: 'var(--text-tertiary)' }}>Optimization</span></span>
      </Link>

      {!isLanding && currentUser && (
        <ul className="navbar-links">
          <li>
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/calculator" className={location.pathname === '/calculator' ? 'active' : ''}>
              <Calculator size={16} /> Calculator
            </Link>
          </li>
          <li>
            <Link to="/ml-insights" className={location.pathname === '/ml-insights' ? 'active' : ''}>
              <BrainCircuit size={16} /> Predict
            </Link>
          </li>
          <li>
            <Link to="/reports" className={location.pathname === '/reports' ? 'active' : ''}>
              <FileBarChart size={16} /> Reports
            </Link>
          </li>
        </ul>
      )}

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button onClick={toggleTheme} className="btn btn-secondary btn-sm" style={{ padding: '8px', borderRadius: '50%' }}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} color="white" />}
        </button>

        {currentUser ? (
          <>
            <span style={{ fontSize: '0.8rem', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <UserCircle size={16} color="white" />
              {currentUser.displayName || currentUser.email}
            </span>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'white', borderColor: 'var(--green-400)' }}>
              <LogOut size={14} /> Logout
            </button>
          </>
        ) : (
          isLanding && (
            <Link to="/login" className="btn btn-primary btn-sm">
              Launch App
            </Link>
          )
        )}
      </div>
    </nav>
  );
};

function AppContent() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isAuthPage = location.pathname === '/login';

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content" style={{ padding: (isLanding || isAuthPage) ? '0' : 'var(--space-xl)', paddingTop: (isLanding || isAuthPage) ? '0' : '80px' }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/calculator" element={<ProtectedRoute><CalculatorApp /></ProtectedRoute>} />
          <Route path="/ml-insights" element={<ProtectedRoute><MLInsights /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

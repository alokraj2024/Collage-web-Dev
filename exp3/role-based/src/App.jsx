import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Create Auth Context
const AuthContext = createContext(null);

// Mock Backend JWT Generator supporting custom roles
const createMockJWT = (username, role) => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    username,
    role,
    exp: Math.floor(Date.now() / 1000) + (60 * 60)
  }));
  return `${header}.${payload}.mock_signature`;
};

// Auth Provider Component
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (e) {
        localStorage.removeItem('jwtToken');
      }
    }
  }, []);

  const login = (username, password, role) => {
    const token = createMockJWT(username, role);
    localStorage.setItem('jwtToken', token);
    const decoded = jwtDecode(token);
    setUser(decoded);
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);

// --- PROTECTED ROUTE COMPONENT (RBAC Core) ---
function ProtectedRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// --- NAVBAR COMPONENT ---
function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <span style={{ fontSize: '20px' }}>🛡️</span> RBAC Portal
      </div>
      <nav style={styles.navLinks}>
        <Link to="/dashboard" style={styles.navLink}>Dashboard</Link>
        <Link to="/editor" style={styles.navLink}>Editor Panel</Link>
        <Link to="/admin" style={styles.navLink}>Admin Panel</Link>
      </nav>
      {user && (
        <div style={styles.userInfo}>
          <span><strong>{user.username}</strong> <span style={styles.roleBadge}>{user.role}</span></span>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      )}
    </header>
  );
}

// --- LOGIN PAGE ---
function Login() {
  const [username, setUsername] = useState('admin');
  const [role, setRole] = useState('Admin');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, 'password123', role);
    navigate('/dashboard');
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Sign In</h2>
      <p style={styles.cardSubtitle}>Select a role to test RBAC permissions</p>
      <form onSubmit={handleSubmit}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Username</label>
          <input 
            style={styles.input}
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Select Role</label>
          <select 
            style={styles.select}
            value={role} 
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="Viewer">Viewer (Read Only)</option>
            <option value="Editor">Editor (Read & Edit)</option>
            <option value="Admin">Admin (Full Control)</option>
          </select>
        </div>
        <button type="submit" style={styles.primaryBtn}>Authenticate & Enter</button>
      </form>
    </div>
  );
}

// --- DASHBOARD PAGE ---
function Dashboard() {
  const { user } = useAuth();
  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Dashboard</h2>
      <p style={styles.cardSubtitle}>Welcome back, <strong>{user?.username}</strong>!</p>
      
      <div style={styles.sectionHeader}>
        <h3>Dynamic UI Permissions</h3>
        <span style={styles.badge}>Role: {user?.role}</span>
      </div>

      <div style={styles.permissionList}>
        <div style={styles.permissionCard}>
          <div style={{ ...styles.statusDot, backgroundColor: '#10b981' }}></div>
          <div style={{ flex: 1 }}>
            <strong>All Roles:</strong>
            <p style={styles.permissionText}>View public documentation and general reports.</p>
          </div>
        </div>
        
        {['Editor', 'Admin'].includes(user?.role) && (
          <div style={styles.permissionCard}>
            <div style={{ ...styles.statusDot, backgroundColor: '#f59e0b' }}></div>
            <div style={{ flex: 1 }}>
              <strong>Editor & Admin Action:</strong>
              <p style={styles.permissionText}>Modify published materials and dynamic content.</p>
            </div>
            <button style={styles.secondaryBtn}>Edit Content</button>
          </div>
        )}
        
        {user?.role === 'Admin' && (
          <div style={{ ...styles.permissionCard, borderColor: '#fca5a5' }}>
            <div style={{ ...styles.statusDot, backgroundColor: '#ef4444' }}></div>
            <div style={{ flex: 1 }}>
              <strong>Admin Only Action:</strong>
              <p style={styles.permissionText}>Clear audit logs and reconfigure system permissions.</p>
            </div>
            <button style={styles.dangerBtn}>Delete Logs</button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- EDITOR PANEL PAGE ---
function EditorPanel() {
  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Editor Panel</h2>
      <p style={styles.cardSubtitle}>Content Management & Review Hub</p>
      <div style={styles.infoBox}>
        <p>✅ Access granted. You hold <strong>Editor</strong> or <strong>Admin</strong> privileges.</p>
      </div>
    </div>
  );
}

// --- ADMIN PANEL PAGE ---
function AdminPanel() {
  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Admin Panel</h2>
      <p style={styles.cardSubtitle}>System Controls & Security Governance</p>
      <div style={styles.infoBox}>
        <p>⚡ Access granted. You hold full <strong>Administrative</strong> authority.</p>
      </div>
    </div>
  );
}

// --- UNAUTHORIZED PAGE ---
function Unauthorized() {
  return (
    <div style={{ ...styles.card, textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '10px' }}>🚫</div>
      <h2 style={{ ...styles.cardTitle, color: '#ef4444' }}>403 - Access Denied</h2>
      <p style={styles.cardSubtitle}>You do not have the required permissions to view this route.</p>
      <Link to="/dashboard" style={{ ...styles.primaryBtn, display: 'inline-block', textDecoration: 'none', width: 'auto', padding: '10px 24px', marginTop: '10px' }}>
        Return to Dashboard
      </Link>
    </div>
  );
}

// --- MAIN APP ENTRY ---
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={styles.appShell}>
          <Navbar />
          <main style={styles.contentContainer}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['Viewer', 'Editor', 'Admin']}>
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/editor" element={
                <ProtectedRoute allowedRoles={['Editor', 'Admin']}>
                  <EditorPanel />
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminPanel />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

// --- STYLES ---
const styles = {
  appShell: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: '40px'
  },
  header: {
    width: '100%',
    maxWidth: '800px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #1e293b',
    marginBottom: '40px'
  },
  logo: {
    fontWeight: 'bold',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  navLinks: {
    display: 'flex',
    gap: '20px'
  },
  navLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'color 0.2s'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px'
  },
  roleBadge: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #334155',
    color: '#94a3b8',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  contentContainer: {
    width: '100%',
    maxWidth: '540px',
    padding: '0 20px'
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '32px',
    border: '1px solid #334155',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
  },
  cardTitle: {
    margin: '0 0 6px 0',
    fontSize: '22px',
    color: '#f8fafc'
  },
  cardSubtitle: {
    margin: '0 0 24px 0',
    color: '#94a3b8',
    fontSize: '14px'
  },
  inputGroup: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#cbd5e1'
  },
  input: {
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#fff',
    fontSize: '14px',
    outline: 'none'
  },
  select: {
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#fff',
    fontSize: '14px',
    outline: 'none'
  },
  primaryBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  badge: {
    backgroundColor: '#334155',
    color: '#cbd5e1',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px'
  },
  permissionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  permissionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px',
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    border: '1px solid #334155'
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0
  },
  permissionText: {
    margin: '2px 0 0 0',
    fontSize: '12px',
    color: '#94a3b8'
  },
  secondaryBtn: {
    backgroundColor: '#334155',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  dangerBtn: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  infoBox: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '16px',
    fontSize: '14px',
    color: '#cbd5e1'
  }
};
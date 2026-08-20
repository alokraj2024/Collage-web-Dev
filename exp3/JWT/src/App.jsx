import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Mock backend JWT generator for simulation
const createMockJWT = (username) => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    username: username,
    role: "student",
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // Expires in 1 hour
  }));
  const mockSignature = "mock_signature_12345";
  return `${header}.${payload}.${mockSignature}`;
};

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);
  const [decodedUser, setDecodedUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Check for stored token on initial load
  useEffect(() => {
    const savedToken = localStorage.getItem('jwtToken');
    if (savedToken) {
      try {
        const user = jwtDecode(savedToken);
        setToken(savedToken);
        setDecodedUser(user);
      } catch (err) {
        // Clear invalid token if parsing fails
        localStorage.removeItem('jwtToken');
      }
    }
  }, []);

  // Handle Login Request
  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Static credential validation (as required by experiment)
    if (username === 'admin' && password === 'password123') {
      // 1. Generate token
      const jwt = createMockJWT(username);
      
      // 2. Save token to localStorage
      localStorage.setItem('jwtToken', jwt);
      setToken(jwt);

      // 3. Decode token user information
      const user = jwtDecode(jwt);
      setDecodedUser(user);
    } else {
      setErrorMessage('Invalid username or password!');
    }
  };

  // Handle Logout Request
  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    setToken(null);
    setDecodedUser(null);
    setUsername('');
    setPassword('');
  };

  // Simulated API call attaching the JWT token
  const fetchProtectedData = async () => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      alert(`Protected Request Successful!\nFetched Data Title: ${data.title}`);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Experiment 1.3.1: JWT Authentication</h2>

      {!token ? (
        /* Login Form */
        <form onSubmit={handleLogin} style={styles.card}>
          <h3>User Login</h3>
          {errorMessage && <p style={styles.error}>{errorMessage}</p>}
          <div style={styles.inputGroup}>
            <label>Username: </label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="admin"
              required 
            />
          </div>
          <div style={styles.inputGroup}>
            <label>Password: </label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="password123"
              required 
            />
          </div>
          <button type="submit" style={styles.button}>Login</button>
        </form>
      ) : (
        /* Protected View / Dashboard */
        <div style={styles.card}>
          <h3>Authenticated Dashboard</h3>
          <p><strong>Status:</strong> Logged In (Stateless Session)</p>
          
          <div style={styles.tokenBox}>
            <p><strong>Decoded JWT User Payload:</strong></p>
            <pre>{JSON.stringify(decodedUser, null, 2)}</pre>
          </div>

          <div style={styles.tokenBox}>
            <p><strong>Raw JWT Token (Stored in localStorage):</strong></p>
            <p style={{ wordBreak: 'break-all' }}>{token}</p>
          </div>

          <button onClick={fetchProtectedData} style={{ ...styles.button, backgroundColor: '#007bff' }}>
            Simulate Protected Request (Bearer Token)
          </button>
          <br /><br />
          <button onClick={handleLogout} style={{ ...styles.button, backgroundColor: '#dc3545' }}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

// Basic inline styling
const styles = {
  container: { fontFamily: 'Arial, sans-serif', maxWidth: '500px', margin: '40px auto', padding: '0 20px' },
  card: { padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' },
  inputGroup: { marginBottom: '15px' },
  error: { color: 'red', fontSize: '14px' },
  tokenBox: { backgroundColor: '#eef', padding: '10px', borderRadius: '5px', marginBottom: '15px' },
  button: { padding: '10px 15px', color: '#fff', backgroundColor: '#28a745', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};
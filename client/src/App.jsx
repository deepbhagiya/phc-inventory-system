import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Transactions from './components/Transactions';
import Suppliers from './components/Suppliers';
import Reorders from './components/Reorders';
import AuditLogs from './components/AuditLogs';
import PatientIssue from './components/PatientIssue';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/auth/me')
        .then(res => {
          setUser(res.data);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login onLogin={login} /> : <Navigate to="/" />} />
      
      <Route element={<Layout user={user} onLogout={logout} />}>
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/issue-medicine" element={user ? <PatientIssue /> : <Navigate to="/login" />} />
        <Route path="/inventory" element={user ? <Inventory /> : <Navigate to="/login" />} />
        <Route path="/transactions" element={user ? <Transactions /> : <Navigate to="/login" />} />
        <Route path="/suppliers" element={user ? <Suppliers /> : <Navigate to="/login" />} />
        <Route path="/reorders" element={user ? <Reorders /> : <Navigate to="/login" />} />
        <Route path="/audit" element={user ? <AuditLogs /> : <Navigate to="/login" />} />
      </Route>
    </Routes>
  );
}

export default App;

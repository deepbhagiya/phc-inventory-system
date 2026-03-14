import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/login', formData);
      const { token, role } = res.data;
      console.log('Login success:', { role, token: token?.substring(0, 20) + '...' });
      onLogin(token, { username: formData.username, role });
    } catch (err) {
      console.error('Login error full details:', err);
      console.error('Response:', err.response?.status, err.response?.data);
      setError(
        err.response?.data?.message ||
        err.response?.data?.msg ||
        `Error ${err.response?.status || 'network'}: ${err.message}`
      );
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'white' }}>
                <ShieldCheck size={28} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Welcome Back</h1>
            <p style={{ color: 'var(--text-light)' }}>Sign in to PHC Inventory System</p>
        </div>

        {error && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" 
              value={formData.username} 
              onChange={e => setFormData({...formData, username: e.target.value})}
              required 
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Sign In
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-light)' }}>
            <p>Demo Credentials:</p>
            <p>Admin: admin / adminpassword</p>
            <p>Pharmacist: pharmacist / pharmacistpassword</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

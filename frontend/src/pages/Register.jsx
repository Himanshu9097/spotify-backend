import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Music, UserPlus } from 'lucide-react';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(username, email, password, role);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-box glass-panel fade-in">
                <div className="auth-header">
                    <Music size={48} color="#1DB954" style={{ marginBottom: '1rem' }} />
                    <h1>Create Account</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Join the Spotify Backend App</p>
                </div>
                {error && <div className="error-msg">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Username</label>
                        <input
                            type="text"
                            className="text-input"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Email</label>
                        <input
                            type="email"
                            className="text-input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input
                            type="password"
                            className="text-input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Role</label>
                        <select className="text-input" value={role} onChange={e => setRole(e.target.value)}>
                            <option value="user">User</option>
                            <option value="artist">Artist</option>
                        </select>
                    </div>
                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>
                        <UserPlus size={20} /> Sign Up
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Sign in here</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;

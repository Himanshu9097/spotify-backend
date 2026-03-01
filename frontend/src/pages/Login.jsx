import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Music, LogIn } from 'lucide-react';

function Login() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (!username && !email) {
                setError('Please provide either username or email');
                return;
            }
            await login(username, email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-box glass-panel fade-in">
                <div className="auth-header">
                    <Music size={48} color="#1DB954" style={{ marginBottom: '1rem' }} />
                    <h1>Welcome Back</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Login to Spotify Backend App</p>
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
                            placeholder="Leave empty if using email"
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Email</label>
                        <input
                            type="email"
                            className="text-input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Leave empty if using username"
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
                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>
                        <LogIn size={20} /> Sign In
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Register here</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;

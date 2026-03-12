import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home, Search, Bell, Users, User, LogOut, UploadCloud, FolderPlus, Settings } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const inputRef = useRef(null);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    // Auto focus search input when entering search page
    useEffect(() => {
        if (location.pathname === '/search' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [location.pathname]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        if (location.pathname !== '/search') {
            navigate(`/search?q=${encodeURIComponent(val)}`);
        } else {
            if (val) setSearchParams({ q: val }, { replace: true });
            else setSearchParams({}, { replace: true });
        }
    };

    const handleLogout = async () => {
        setShowMenu(false);
        await logout();
        navigate('/login');
    };

    const initials = user?.username?.charAt(0)?.toUpperCase() || '?';

    return (
        <nav className="navbar" style={{ padding: '0.75rem 1.5rem', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 'none', height: '64px' }}>
            {/* Left Nav Controls */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button onClick={() => navigate(-1)} style={{ background: '#121212', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }} title="Go back">
                    <ChevronLeft size={20} />
                </button>
                <button onClick={() => navigate(1)} style={{ background: '#121212', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#a7a7a7' }} title="Go forward">
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Center Search / Home */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, maxWidth: '540px', margin: '0 2rem' }}>
                <Link to="/" style={{ background: '#1a1a1a', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', textDecoration: 'none', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                    <Home size={24} />
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', background: '#242424', borderRadius: '50px', padding: '0.75rem 1.25rem', flex: 1, border: '1px solid transparent', transition: 'background-color 0.3s, border-color 0.3s', cursor: 'text' }} onClick={() => { if (location.pathname !== '/search') navigate('/search'); }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2a2a2a'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#242424'}>
                    <Search size={22} color="#a7a7a7" style={{ marginRight: '0.75rem' }} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="What do you want to play?"
                        value={query}
                        onChange={handleSearchChange}
                        style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '1rem', fontWeight: 500 }}
                    />
                </div>
            </div>

            {/* Right Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {user?.role === 'artist' && (
                    <>
                        <Link to="/upload-music" title="Upload Music" style={{ color: '#a7a7a7', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#a7a7a7'}>
                            <UploadCloud size={20} />
                        </Link>
                        <Link to="/create-album" title="Create Album" style={{ color: '#a7a7a7', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#a7a7a7'}>
                            <FolderPlus size={20} />
                        </Link>
                    </>
                )}
                <button title="Notifications" style={{ background: 'transparent', border: 'none', color: '#a7a7a7', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#a7a7a7'}>
                    <Bell size={20} />
                </button>
                <button title="Friend Activity" style={{ background: 'transparent', border: 'none', color: '#a7a7a7', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#a7a7a7'}>
                    <Users size={20} />
                </button>

                {/* Profile Avatar with Dropdown */}
                <div ref={menuRef} style={{ position: 'relative' }}>
                    <div
                        onClick={() => setShowMenu(prev => !prev)}
                        title={user?.username}
                        style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: user?.profileImage ? 'transparent' : '#535353',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden', cursor: 'pointer',
                            border: showMenu ? '2px solid #fff' : '2px solid transparent',
                            transition: 'border-color 0.2s, transform 0.2s',
                            transform: showMenu ? 'scale(1.05)' : 'scale(1)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                        onMouseLeave={e => e.currentTarget.style.transform = showMenu ? 'scale(1.05)' : 'scale(1)'}
                    >
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{initials}</span>
                        )}
                    </div>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <div style={{
                            position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                            background: '#282828', borderRadius: '8px', width: '200px',
                            boxShadow: '0 16px 24px rgba(0,0,0,0.6)', zIndex: 9999,
                            overflow: 'hidden', animation: 'fadeIn 0.15s ease'
                        }}>
                            {/* User info */}
                            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.username}</p>
                                <p style={{ color: '#a7a7a7', fontSize: '0.8rem', textTransform: 'capitalize' }}>{user?.role}</p>
                            </div>

                            <MenuItem icon={<Settings size={16} />} label="Profile" onClick={() => { setShowMenu(false); navigate('/profile'); }} />
                            <MenuItem icon={<LogOut size={16} />} label="Log out" onClick={handleLogout} danger />
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

function MenuItem({ icon, label, onClick, danger }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', cursor: 'pointer',
                background: hovered ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: danger && hovered ? '#e91429' : '#fff',
                transition: 'background 0.2s, color 0.2s',
                fontSize: '0.9rem', fontWeight: 600
            }}
        >
            {icon} {label}
        </div>
    );
}

export default Navbar;

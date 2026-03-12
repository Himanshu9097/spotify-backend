import { useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home, Search, Bell, Users, User, LogOut, UploadCloud, FolderPlus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const inputRef = useRef(null);

    // Auto focus search input when entering search page
    useEffect(() => {
        if (location.pathname === '/search' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [location.pathname]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        if (location.pathname !== '/search') {
            navigate(`/search?q=${encodeURIComponent(val)}`);
        } else {
            if (val) setSearchParams({ q: val }, { replace: true });
            else setSearchParams({}, { replace: true });
        }
    };

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
                <div style={{ display: 'flex', alignItems: 'center', background: '#242424', borderRadius: '50px', padding: '0.75rem 1.25rem', flex: 1, border: '1px solid transparent', transition: 'background-color 0.3s, border-color 0.3s', cursor: 'text' }} onClick={() => { if(location.pathname !== '/search') navigate('/search'); }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2a2a2a'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#242424'}>
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
                
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer', marginLeft: '0.5rem', border: '4px solid #1a1a1a', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} onClick={logout} title="Logout">
                    <User size={18} color="#fff" />
                </div>
            </div>
        </nav>
    );
}

export default Navbar;

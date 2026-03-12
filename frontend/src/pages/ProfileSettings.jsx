import { useContext, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Camera, User, Check, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const { user, updateProfile, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [username, setUsername] = useState(user?.username || '');
    const [previewImage, setPreviewImage] = useState(user?.profileImage || '');
    const [selectedFile, setSelectedFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ text: '', type: '' });
        try {
            const formData = new FormData();
            // Always send username so backend has it available
            formData.append('username', username.trim());
            if (selectedFile) formData.append('profileImage', selectedFile);

            await updateProfile(formData);
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
            setSelectedFile(null);
        } catch (err) {
            const serverMsg = err.response?.data?.message || err.message || 'Failed to update profile.';
            setMessage({ text: serverMsg, type: 'error' });
            console.error('Profile update error:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const initials = user?.username?.charAt(0)?.toUpperCase() || '?';

    return (
        <div className="content-wrapper fade-in" style={{ maxWidth: '600px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2rem', marginBottom: '3rem' }}>
                {/* Avatar with upload */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div
                        style={{
                            width: '160px', height: '160px', borderRadius: '50%',
                            background: previewImage ? 'transparent' : 'linear-gradient(135deg, #450af5, #c4efd9)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                            cursor: 'pointer', transition: 'transform 0.2s'
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        title="Click to change photo"
                    >
                        {previewImage ? (
                            <img src={previewImage} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ fontSize: '4rem', fontWeight: 800, color: '#fff' }}>{initials}</span>
                        )}
                        {/* overlay on hover */}
                        <div style={{
                            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            opacity: 0, transition: 'opacity 0.2s', borderRadius: '50%'
                        }}
                            onMouseEnter={e => e.currentTarget.style.opacity = 1}
                            onMouseLeave={e => e.currentTarget.style.opacity = 0}
                        >
                            <Camera size={32} color="#fff" />
                            <span style={{ color: '#fff', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 700 }}>Choose photo</span>
                        </div>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
                </div>

                {/* Name area */}
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Profile</p>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, marginBottom: '0.5rem' }}>{user?.username}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.email} • <span style={{ textTransform: 'capitalize' }}>{user?.role}</span></p>
                </div>
            </div>

            {/* Edit Form */}
            <div style={{ background: '#121212', borderRadius: '12px', padding: '2rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 700 }}>Edit Profile</h2>

                <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        style={{
                            width: '100%', background: '#282828', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff',
                            fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s'
                        }}
                        onFocus={e => e.target.style.borderColor = '#fff'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        placeholder="Enter new username"
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Profile Photo</label>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            background: 'transparent', border: '1px solid rgba(255,255,255,0.3)',
                            color: '#fff', borderRadius: '50px', padding: '0.6rem 1.5rem',
                            cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                            transition: 'border-color 0.2s, background 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                    >
                        <Camera size={16} />
                        {selectedFile ? selectedFile.name : 'Choose Photo'}
                    </button>
                </div>

                {message.text && (
                    <p style={{ marginBottom: '1rem', color: message.type === 'success' ? '#1DB954' : message.type === 'error' ? '#e91429' : '#a7a7a7', fontWeight: 600 }}>
                        {message.type === 'success' ? '✓ ' : ''}{message.text}
                    </p>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            background: '#1DB954', color: '#000', border: 'none', borderRadius: '50px',
                            padding: '0.75rem 2rem', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                            transition: 'transform 0.2s, background 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem',
                            opacity: saving ? 0.7 : 1
                        }}
                        onMouseEnter={e => !saving && (e.currentTarget.style.transform = 'scale(1.04)')}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Check size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        onClick={() => { setUsername(user?.username || ''); setPreviewImage(user?.profileImage || ''); setSelectedFile(null); setMessage({ text: '', type: '' }); }}
                        style={{
                            background: 'transparent', color: '#a7a7a7', border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '50px', padding: '0.75rem 1.5rem', fontWeight: 600, cursor: 'pointer',
                            transition: 'color 0.2s, border-color 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#a7a7a7'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                    >
                        <X size={16} /> Cancel
                    </button>
                </div>
            </div>

            {/* Account info */}
            <div style={{ background: '#121212', borderRadius: '12px', padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.85rem' }}>Account</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                        <p style={{ fontWeight: 600, marginBottom: '0.15rem' }}>Email</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.email}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontWeight: 600, marginBottom: '0.15rem' }}>Plan</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'capitalize' }}>{user?.role === 'artist' ? 'Artist Account' : 'Free Plan'}</p>
                    </div>
                </div>
            </div>

            {/* Logout */}
            <button
                onClick={handleLogout}
                style={{
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff', borderRadius: '50px', padding: '0.75rem 2rem',
                    fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                    transition: 'background 0.2s, border-color 0.2s', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    width: 'fit-content'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            >
                <LogOut size={20} /> Log out
            </button>
        </div>
    );
}

export default Profile;

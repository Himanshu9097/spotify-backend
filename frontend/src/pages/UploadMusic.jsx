import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { UploadCloud } from 'lucide-react';

function UploadMusic() {
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !file) {
            setError('Please provide title and select a file');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('music', file);

        try {
            await api.post('/music/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess('Music uploaded successfully!');
            setTitle('');
            setFile(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Error uploading music');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="content-wrapper fade-in" style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <UploadCloud size={28} color="var(--primary-color)" /> Upload New Track
                </h2>
                {error && <div className="error-msg">{error}</div>}
                {success && <div className="success-msg">{success}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Track Title</label>
                        <input
                            type="text"
                            className="text-input"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Bohemian Rhapsody"
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Audio File</label>
                        <input
                            type="file"
                            accept="audio/*"
                            className="text-input"
                            onChange={e => setFile(e.target.files[0])}
                            style={{ padding: '0.75rem 1rem' }}
                        />
                    </div>
                    <button type="submit" className="btn" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
                        {loading ? 'Uploading...' : 'Publish Track'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default UploadMusic;

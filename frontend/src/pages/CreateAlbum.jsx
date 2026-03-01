import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { FolderPlus } from 'lucide-react';

function CreateAlbum() {
    const [title, setTitle] = useState('');
    const [musics, setMusics] = useState(''); // Comma separated music IDs (optional)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title) {
            setError('Title is required');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');

        const musicArray = musics ? musics.split(',').map(m => m.trim()).filter(Boolean) : [];

        try {
            await api.post('/music/album', { title, musics: musicArray });
            setSuccess('Album created successfully!');
            setTitle('');
            setMusics('');
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating album');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="content-wrapper fade-in" style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <FolderPlus size={28} color="var(--primary-color)" /> Create Album
                </h2>
                {error && <div className="error-msg">{error}</div>}
                {success && <div className="success-msg">{success}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Album Title</label>
                        <input
                            type="text"
                            className="text-input"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. The Dark Side of the Moon"
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Track IDs (Optional)</label>
                        <textarea
                            className="text-input"
                            value={musics}
                            onChange={e => setMusics(e.target.value)}
                            placeholder="Comma separated Music Object IDs"
                            style={{ minHeight: '80px', resize: 'vertical' }}
                        />
                    </div>
                    <button type="submit" className="btn" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
                        {loading ? 'Creating...' : 'Create Record'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateAlbum;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/store';
import usePostStore from '../store/postStore';

export default function CreatePostPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const { user } = useAuthStore();
    const { createPost, loading, error } = usePostStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !description) return;

        try {
            await createPost({ title, description });
            navigate('/posts');
        } catch (err) {
            console.error('Klaida:', err);
        }
    };

    if (!user) {
        navigate('/');
        return null;
    }

    return (
        <div className="create-post-container">
            <h1>Sukurti naują postą</h1>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="post-form">
                <div className="form-group">
                    <label>Pavadinimas:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength="100"
                        required
                        disabled={loading}
                    />
                    <small>{title.length}/100 simbolių</small>
                </div>

                <div className="form-group">
                    <label>Aprašymas:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        maxLength="500"
                        required
                        rows="5"
                        disabled={loading}
                    />
                    <small>{description.length}/500 simbolių</small>
                </div>

                <div className="form-group">
                    <label>Autorius:</label>
                    <input
                        type="text"
                        value={user?.username || ''}
                        readOnly
                    />
                </div>

                <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                >
                    {loading ? 'Kuriama...' : 'Sukurti postą'}
                </button>
            </form>
        </div>
    );
}
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useFavoriteStore from '../store/favoriteStore';
import useAuthStore from '../store/store';
import '../styles.css';

export default function FavoritesPage() {
    const { favorites, fetchFavorites, removeFavorite, loading, error } = useFavoriteStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchFavorites();
        } else {
            navigate('/');
        }
    }, [user, fetchFavorites, navigate]);

    const handleRemoveFavorite = async (postId) => {
        try {
            await removeFavorite(postId);
        } catch (err) {
            console.error('Klaida:', err);
        }
    };

    if (loading) return <div className="loading">Kraunama...</div>;
    if (error) return <div className="error">Klaida: {error}</div>;

    return (
        <div className="favorites-container">
            <h1>Mėgstami postai</h1>

            <div className="posts-list">
                {favorites.length > 0 ? (
                    favorites.map(post => (
                        <div key={post._id} className="post-card">
                            <h3>{post.title}</h3>
                            <p className="post-description">{post.description}</p>
                            <div className="post-meta">
                                <span className="post-author">{post.username}</span>
                                <span className="post-time">
                                    {new Date(post.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <button
                                onClick={() => handleRemoveFavorite(post._id)}
                                className="remove-favorite-btn"
                            >
                                Pašalinti iš mėgstamų
                            </button>
                        </div>
                    ))
                ) : (
                    <p>Neturite mėgstamų postų.</p>
                )}
            </div>
        </div>
    );
}
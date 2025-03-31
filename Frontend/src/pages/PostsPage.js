import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePostStore from '../store/postStore';
import useAuthStore from '../store/store';
import useFavoriteStore from '../store/favoriteStore';
import '../styles.css';

export default function PostsPage() {
    const { posts, fetchPosts, loading, error } = usePostStore();
    const { user } = useAuthStore();
    const { favorites, addFavorite, removeFavorite, fetchFavorites } = useFavoriteStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
        if (user) {
            fetchFavorites();
        }
    }, [fetchPosts, fetchFavorites, user]);

    const handleUserClick = (username, e) => {
        e.stopPropagation();
        if (user && user.username !== username) {
            navigate(`/profile/${username}`);
        }
    };

    const handlePostClick = (postId) => {
        navigate(`/posts/${postId}`);
    };

    const handleFavoriteClick = async (postId, e) => {
        e.stopPropagation();
        if (!user) {
            alert('Norėdami išsaugoti mėgstamus postus, turite prisijungti');
            return;
        }

        const isFavorite = favorites.some(fav => fav._id === postId);
        try {
            if (isFavorite) {
                await removeFavorite(postId);
            } else {
                await addFavorite(postId);
            }
        } catch (err) {
            console.error('Klaida:', err);
        }
    };

    if (loading) return <div className="loading">Kraunama...</div>;
    if (error) return <div className="error">Klaida: {error}</div>;

    return (
        <div className="posts-container">
            <h1>Visi postai</h1>

            <div className="posts-list">
                {posts.length > 0 ? (
                    posts.map(post => {
                        const isFavorite = favorites.some(fav => fav._id === post._id);
                        return (
                            <div
                                key={post._id}
                                className="post-card"
                                onClick={() => handlePostClick(post._id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <h3>{post.title}</h3>
                                <p className="post-description">{post.description}</p>
                                <div className="post-meta">
                                    <span
                                        className="post-author"
                                        onClick={(e) => handleUserClick(post.username, e)}
                                        style={{
                                            cursor: user && user.username !== post.username ? 'pointer' : 'default',
                                            textDecoration: user && user.username !== post.username ? 'underline' : 'none'
                                        }}
                                    >
                                        {post.username}
                                    </span>
                                    <span className="post-time">
                                        {new Date(post.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => handleFavoriteClick(post._id, e)}
                                    className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                                >
                                    {isFavorite ? '❤️ Mėgstamas' : '🤍 Įtraukti į mėgstamus'}
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <p>Nėra postų.</p>
                )}
            </div>
        </div>
    );
}
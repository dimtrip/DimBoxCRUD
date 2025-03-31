import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePostStore from '../store/postStore';
import useCommentStore from '../store/commentStore';
import useAuthStore from '../store/store';
import useFavoriteStore from '../store/favoriteStore';
import '../styles.css';

export default function PostDetailPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { getPostById, loading: postLoading, error: postError } = usePostStore();
    const { comments, fetchComments, createComment, loading: commentLoading, error: commentError } = useCommentStore();
    const { favorites, addFavorite, removeFavorite, fetchFavorites } = useFavoriteStore();
    const [post, setPost] = useState(null);
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const postData = await getPostById(postId);
                setPost(postData);
                await fetchComments(postId);
                if (user) {
                    await fetchFavorites();
                }
            } catch (err) {
                console.error('Klaida:', err);
            }
        };

        loadData();
    }, [postId, getPostById, fetchComments, fetchFavorites, user]);

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        if (!user) {
            alert('Norėdami komentuoti, turite prisijungti');
            navigate('/');
            return;
        }

        try {
            await createComment({
                text: commentText,
                postId
            });
            setCommentText('');
        } catch (err) {
            console.error('Klaida:', err);
            if (err.message.includes('401')) {
                alert('Jūsų sesija pasibaigė. Prisijunkite iš naujo.');
                useAuthStore.getState().logout();
                navigate('/');
            }
        }
    };

    const handleFavoriteClick = async () => {
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

    const handleAuthorClick = () => {
        if (post?.username) {
            navigate(`/profile/${post.username}`);
        }
    };

    if (postLoading) return <div className="loading">Kraunama...</div>;
    if (postError) return <div className="error">Klaida: {postError}</div>;
    if (!post) return <div className="error">Postas nerastas</div>;

    const isFavorite = favorites.some(fav => fav._id === postId);

    return (
        <div className="post-detail-container">
            <button onClick={() => navigate(-1)} className="back-button">← Grįžti atgal</button>

            <div className="post-detail-card">
                <div className="post-header">
                    <div className="author-info" onClick={handleAuthorClick}>
                        <div className="author-avatar-placeholder">
                            {post.username?.charAt(0).toUpperCase()}
                        </div>
                        <span className="author-name">@{post.username}</span>
                    </div>
                    <button
                        onClick={handleFavoriteClick}
                        className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                    >
                        {isFavorite ? '❤️ Mėgstamas' : '🤍 Įtraukti į mėgstamus'}
                    </button>
                </div>

                <div className="post-content">
                    <h2>{post.title}</h2>
                    <p className="post-description">{post.description}</p>
                    <div className="post-meta">
                        <span className="post-time">
                            {new Date(post.createdAt).toLocaleString()}
                        </span>
                        <span className="post-comments-count">
                            {post.commentsCount} komentarai
                        </span>
                    </div>
                </div>

                <div className="comments-section">
                    <h3>Komentarai</h3>

                    {commentError && <div className="error-message">{commentError}</div>}

                    {user ? (
                        <form onSubmit={handleSubmitComment} className="comment-form">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Jūsų komentaras..."
                                maxLength="500"
                                required
                                rows="3"
                                disabled={commentLoading}
                            />
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={commentLoading || !commentText.trim()}
                            >
                                {commentLoading ? 'Siunčiama...' : 'Komentuoti'}
                            </button>
                        </form>
                    ) : (
                        <div className="login-prompt">
                            <p>Norėdami komentuoti, turite prisijungti</p>
                            <button onClick={() => navigate('/')} className="login-btn">
                                Prisijungti
                            </button>
                        </div>
                    )}

                    <div className="comments-list">
                        {comments.length > 0 ? (
                            comments.map(comment => (
                                <div key={comment._id} className="comment-card">
                                    <div className="comment-header">
                                        <span className="comment-author">@{comment.username}</span>
                                        <span className="comment-time">
                                            {new Date(comment.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="comment-text">{comment.text}</p>
                                </div>
                            ))
                        ) : (
                            <p className="no-comments">Dar nėra komentarų. Būkite pirmas!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
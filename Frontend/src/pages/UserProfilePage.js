import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/store';
import '../styles.css';

export default function UserProfilePage() {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [messageContent, setMessageContent] = useState('');
    const [showMessageForm, setShowMessageForm] = useState(false);
    const [messageStatus, setMessageStatus] = useState({ text: '', isError: false });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await axios.get(`/api/users/${username}`, {
                    validateStatus: (status) => status < 500
                });

                if (response.status === 404) {
                    setError('Vartotojas nerastas');
                    return;
                }

                if (!response.data) {
                    throw new Error('Vartotojo duomenys nerasti');
                }

                setUserData(response.data);
            } catch (err) {
                console.error('Klaida:', err);
                setError(err.response?.data?.error || err.message || 'Nepavyko gauti vartotojo duomenų');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [username]);

    const handlePostClick = (postId) => {
        navigate(`/posts/${postId}`);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        try {
            if (!messageContent.trim()) {
                throw new Error('Žinutė negali būti tuščia');
            }

            await axios.post('/api/messages', {
                receiverUsername: username,
                content: messageContent
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            setMessageStatus({ text: 'Žinutė sėkmingai išsiųsta!', isError: false });
            setMessageContent('');
            setTimeout(() => {
                setShowMessageForm(false);
                setMessageStatus({ text: '', isError: false });
            }, 2000);
        } catch (err) {
            console.error('Failed to send message:', err);
            setMessageStatus({
                text: err.response?.data?.error || err.message || 'Nepavyko išsiųsti žinutės',
                isError: true
            });
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('lt-LT', options);
    };

    if (loading) return <div className="loading">Kraunama...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="user-profile-container">
            <button onClick={() => navigate(-1)} className="back-button">← Grįžti atgal</button>

            <div className="profile-header">
                <div className="avatar-container golden-frame">
                    {userData?.imageUrl ? (
                        <img
                            src={userData.imageUrl}
                            alt={`${userData.username} profilis`}
                            className="profile-avatar"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/150';
                            }}
                        />
                    ) : (
                        <div className="avatar-placeholder golden-frame">
                            {userData?.username?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="profile-info">
                    <h1>@{userData?.username}</h1>
                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-number">{userData?.postsCount || 0}</span>
                            <span className="stat-label">Postai</span>
                        </div>
                    </div>
                    {user?.username !== username && (
                        <button
                            onClick={() => setShowMessageForm(!showMessageForm)}
                            className="message-button"
                        >
                            {showMessageForm ? 'Atšaukti' : 'Siųsti žinutę'}
                        </button>
                    )}
                </div>
            </div>

            {showMessageForm && (
                <div className="message-form-container">
                    <form onSubmit={handleSendMessage} className="message-form">
                        <h3>Siųsti žinutę @{userData?.username}</h3>
                        <textarea
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            placeholder="Jūsų žinutė..."
                            required
                            rows="4"
                        />
                        <button type="submit" className="send-btn">
                            Siųsti
                        </button>
                        {messageStatus.text && (
                            <div className={`message-status ${messageStatus.isError ? 'error' : 'success'}`}>
                                {messageStatus.text}
                            </div>
                        )}
                    </form>
                </div>
            )}

            <div className="user-posts-section">
                <h2>{userData?.username} postai</h2>

                {userData?.posts?.length > 0 ? (
                    <div className="posts-grid">
                        {userData.posts.map(post => (
                            <div
                                key={post._id}
                                className="post-card"
                                onClick={() => handlePostClick(post._id)}
                            >
                                <h3>{post.title}</h3>
                                <p className="post-description">{post.description}</p>
                                <div className="post-footer">
                                    <span className="post-date">
                                        {post.createdAt ? formatDate(post.createdAt) : 'N/A'}
                                    </span>
                                    <span className="post-comments">
                                        {post.commentsCount || 0} {post.commentsCount === 1 ? 'komentaras' : 'komentarai'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-posts">Vartotojas dar nesukūrė postų.</p>
                )}
            </div>
        </div>
    );
}
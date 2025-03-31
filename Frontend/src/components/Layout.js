import { Link } from 'react-router-dom';
import useAuthStore from '../store/store';
import useMessageStore from '../store/messageStore';
import { useEffect } from 'react';

export default function Layout({ children }) {
    const { user, logout } = useAuthStore();
    const { unreadCount, fetchConversations } = useMessageStore();

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user, fetchConversations]);

    return (
        <div className="app-container">
            <nav className="navbar">
                <Link to="/" className="logo">DimBox</Link>

                {user && (
                    <div className="nav-links">
                        {user.imageUrl ? (
                            <img
                                src={user.imageUrl}
                                alt="Profilio nuotrauka"
                                className="nav-avatar"
                            />
                        ) : (
                            <div className="nav-avatar-placeholder">
                                {user.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <Link to="/posts">Postai</Link>
                        <Link to="/posts/create">Naujas postas</Link>
                        <Link to="/favorites">Mėgstami</Link>
                        <Link
                            to="/messages"
                            className={`nav-messages ${unreadCount > 0 ? 'has-unread' : ''}`}
                        >
                            Pokalbiai
                            {unreadCount > 0 && (
                                <span className="unread-count-badge">{unreadCount}</span>
                            )}
                        </Link>
                        <Link to="/profile">Profilis</Link>
                        <button onClick={logout} className="logout-btn">Atsijungti</button>
                    </div>
                )}
            </nav>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
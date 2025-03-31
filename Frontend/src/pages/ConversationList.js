import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/store';
import useMessageStore from '../store/messageStore';
import '../styles.css';

export default function ConversationList() {
    const { user } = useAuthStore();
    const { conversations, loading, error, fetchConversations } = useMessageStore();

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user, fetchConversations]);

    if (loading) return <div className="loading">Įkeliama...</div>;
    if (error) return <div className="error">Klaida: {error}</div>;

    return (
        <div className="conversation-list-container">
            <h1>Pokalbiai</h1>

            {!conversations || conversations.length === 0 ? (
                <p className="no-conversations">Pokalbių dar nėra</p>
            ) : (
                <div className="conversations-grid">
                    {conversations.map((conversation) => {

                        //Saugi prieiga prie galimai neapibrėžtų savybių
                        const partner = conversation?.user || {};
                        const lastMessage = conversation?.lastMessage || {};
                        const messageContent = lastMessage?.content || '';

                        return (
                            <Link
                                key={partner._id || Math.random()}
                                to={`/messages/${partner.username}`}
                                className={`conversation-card ${conversation.unreadCount > 0 ? 'unread' : ''}`}
                            >
                                <div className="conversation-avatar">
                                    {partner.imageUrl ? (
                                        <img src={partner.imageUrl} alt={partner.username} />
                                    ) : (
                                        <div>{partner.username?.charAt(0)?.toUpperCase() || '?'}</div>
                                    )}
                                </div>
                                <div className="conversation-info">
                                    <h3>@{partner.username || 'Unknown'}</h3>
                                    <p className="last-message">
                                        {messageContent.substring(0, 50)}...
                                    </p>
                                    <div className="conversation-meta">
                    <span className="time">
                      {lastMessage.createdAt ?
                          new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                          ''}
                    </span>
                                        {conversation.unreadCount > 0 && (
                                            <span className="unread-badge">{conversation.unreadCount}</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
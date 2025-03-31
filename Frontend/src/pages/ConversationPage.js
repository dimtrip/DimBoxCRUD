import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/store';
import useMessageStore from '../store/messageStore';
import '../styles.css';

export default function ConversationPage() {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        currentMessages,
        loading,
        error,
        fetchMessages,
        sendMessage,
        deleteMessage
    } = useMessageStore();
    const [newMessage, setNewMessage] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (user && username) {
            fetchMessages(username);
        }
    }, [user, username, fetchMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [currentMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await sendMessage(username, newMessage, replyingTo?._id);
            setNewMessage('');
            setReplyingTo(null);
        } catch (err) {
            console.error('Nepavyko išsiųsti pranešimo:', err);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (window.confirm('Ar tikrai norite ištrinti šį pranešimą?')) {
            try {
                await deleteMessage(messageId);
            } catch (err) {
                console.error('Nepavyko ištrinti pranešimo:', err);
            }
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="conversation-page">
            <div className="conversation-header">
                <button onClick={() => navigate('/messages')} className="back-button">
                    ← Atgal
                </button>
                <h2>Pokalbis su @{username}</h2>
            </div>

            <div className="messages-container">
                {!currentMessages || currentMessages.length === 0 ? (
                    <p className="no-messages">Pranešimų dar nėra. Pradėkite pokalbį!</p>
                ) : (
                    currentMessages.map((message) => {
                        // Saugi prieiga prie pranešimų
                        const sender = message?.sender || {};
                        const content = message?.content || '';
                        const replyContent = message?.replyTo?.content || '';

                        return (
                            <div
                                key={message._id || Math.random()}
                                className={`message ${sender._id === user?._id ? 'sent' : 'received'}`}
                            >
                                {message.replyTo && (
                                    <div className="reply-preview">
                                        <p>Atsakant į: {replyContent.substring(0, 50)}...</p>
                                    </div>
                                )}
                                <div className="message-content">
                                    <p>{content}</p>
                                    <div className="message-footer">
                    <span className="message-time">
                      {message.createdAt ?
                          new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                          ''}
                    </span>
                                        <div className="message-actions">
                                            <button
                                                onClick={() => setReplyingTo(message)}
                                                className="action-btn reply-btn"
                                            >
                                                Atsakyti
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMessage(message._id)}
                                                className="action-btn delete-btn"
                                            >
                                                Ištrinti
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {replyingTo && (
                <div className="reply-indicator">
                    <p>Atsakant į: {(replyingTo?.content || '').substring(0, 50)}...</p>
                    <button
                        onClick={() => setReplyingTo(null)}
                        className="cancel-reply-btn"
                    >
                        Atšaukti
                    </button>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="message-form">
        <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Įveskite savo žinutę..."
            rows="3"
            maxLength="1000"
            required
        />
                <button
                    type="submit"
                    className="send-btn"
                    disabled={loading}
                >
                    {loading ? 'Siunčiama...' : 'Siųsti'}
                </button>
            </form>
        </div>
    );
}
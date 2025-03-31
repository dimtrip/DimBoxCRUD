import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/store';
import '../styles.css';

export default function MessagesPage() {
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/messages/conversations');
                setConversations(response.data);
            } catch (err) {
                setError(err.response?.data?.error || err.message || 'Failed to load conversations');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchConversations();
        } else {
            navigate('/login');
        }
    }, [user, navigate]);

    const fetchMessages = async (username) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/messages/${username}`);
            setMessages(response.data);
            setSelectedConversation(username);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        try {
            if (!newMessage.trim()) {
                throw new Error('Message cannot be empty');
            }

            const response = await axios.post('/api/messages', {
                receiverUsername: selectedConversation,
                content: newMessage
            });

            setMessages([...messages, response.data]);
            setNewMessage('');

            // Refresh conversations to update last message
            const convResponse = await axios.get('/api/messages/conversations');
            setConversations(convResponse.data);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to send message');
        }
    };

    if (loading) return <div className="loading">Kraunama...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="messages-container">
            <h1>Pokalbiai</h1>

            <div className="messages-layout">
                <div className="conversations-list">
                    <h2>Pokalbiai</h2>
                    {conversations.length > 0 ? (
                        <ul>
                            {conversations.map(conv => (
                                <li
                                    key={conv.user._id}
                                    className={`conversation-item ${selectedConversation === conv.user.username ? 'active' : ''}`}
                                    onClick={() => fetchMessages(conv.user.username)}
                                >
                                    <div className="conversation-user">
                                        {conv.user.imageUrl ? (
                                            <img
                                                src={conv.user.imageUrl}
                                                alt={conv.user.username}
                                                className="conversation-avatar"
                                            />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {conv.user.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span>@{conv.user.username}</span>
                                        {conv.unreadCount > 0 && (
                                            <span className="unread-badge">{conv.unreadCount}</span>
                                        )}
                                    </div>
                                    <p className="conversation-preview">
                                        {conv.lastMessage.content.length > 30
                                            ? `${conv.lastMessage.content.substring(0, 30)}...`
                                            : conv.lastMessage.content}
                                    </p>
                                    <small className="conversation-time">
                                        {new Date(conv.lastMessage.createdAt).toLocaleString()}
                                    </small>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Neturite pokalbių.</p>
                    )}
                </div>

                <div className="messages-view">
                    {selectedConversation ? (
                        <>
                            <div className="messages-header">
                                <h2>Pokalbis su @{selectedConversation}</h2>
                            </div>
                            <div className="messages-list">
                                {messages.length > 0 ? (
                                    messages.map(message => (
                                        <div
                                            key={message._id}
                                            className={`message ${message.sender._id === user._id ? 'sent' : 'received'}`}
                                        >
                                            <div className="message-sender">
                                                {message.sender.imageUrl ? (
                                                    <img
                                                        src={message.sender.imageUrl}
                                                        alt={message.sender.username}
                                                        className="message-avatar"
                                                    />
                                                ) : (
                                                    <div className="avatar-placeholder">
                                                        {message.sender.username.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span>@{message.sender.username}</span>
                                            </div>
                                            <p className="message-content">{message.content}</p>
                                            <small className="message-time">
                                                {new Date(message.createdAt).toLocaleString()}
                                            </small>
                                        </div>
                                    ))
                                ) : (
                                    <p>Nėra žinučių šiame pokalbyje.</p>
                                )}
                            </div>
                            <form onSubmit={handleSendMessage} className="message-input-form">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Rašykite žinutę..."
                                    rows="3"
                                    required
                                />
                                <button type="submit" className="send-btn">Siųsti</button>
                            </form>
                        </>
                    ) : (
                        <div className="select-conversation-prompt">
                            <p>Pasirinkite pokalbį arba pradėkite naują</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
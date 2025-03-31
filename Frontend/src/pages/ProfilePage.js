import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../store/store';
import '../styles.css';

export default function ProfilePage() {
    const { user, updateUser, logout } = useAuthStore();
    const [form, setForm] = useState({
        username: user?.username || '',
        password: '',
        imageUrl: user?.imageUrl || ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setForm({
                username: user.username,
                password: '',
                imageUrl: user.imageUrl || ''
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.put('/api/users/me', form);
            updateUser(data);
            setMessage('Profilis atnaujintas');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Klaida atnaujinant profilį');
        }
    };

    return (
        <div className="profile-container">
            <h1>Profilis</h1>

            {message && (
                <div className={`message ${message.includes('Klaida') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            <div className="profile-content">
                <div className="profile-info">
                    <div className="avatar-container golden-frame">
                        {form.imageUrl ? (
                            <img
                                src={form.imageUrl}
                                alt="Profilio nuotrauka"
                                className="profile-avatar"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/150';
                                }}
                            />
                        ) : (
                            <div className="avatar-placeholder golden-frame">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <h3>@{user?.username}</h3>
                </div>

                <div className="profile-form">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Vartotojo vardas:</label>
                            <input
                                value={form.username}
                                onChange={(e) => setForm({...form, username: e.target.value})}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Naujas slaptažodis:</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({...form, password: e.target.value})}
                                placeholder="Palikite tuščią, jei nekeičiate"
                            />
                        </div>

                        <div className="form-group">
                            <label>Profilio nuotraukos URL:</label>
                            <input
                                value={form.imageUrl}
                                onChange={(e) => setForm({...form, imageUrl: e.target.value})}
                                placeholder="Įveskite nuotraukos nuorodą"
                            />
                            <small>Pvz.: https://example.com/nuotrauka.jpg</small>
                        </div>

                        <button type="submit" className="submit-btn">Atnaujinti profilį</button>
                    </form>

                    <button onClick={logout} className="logout-btn">Atsijungti</button>
                </div>
            </div>
        </div>
    );
}
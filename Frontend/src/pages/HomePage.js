import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/store';
import axios from 'axios';

export default function HomePage() {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const { user, login } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const { data } = await axios.post(endpoint, form);

            if (isLogin) {
                login(data.token, data.user);
                navigate('/profile');
            } else {
                setIsLogin(true);
                setError('');
                alert('Registracija sėkminga! Dabar galite prisijungti.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Įvyko klaida');
        }
    };

    return (
        <div className="auth-container">
            <h1>{isLogin ? 'Prisijungimas' : 'Registracija'}</h1>

            {error && <div className="error-message">{error}</div>}

            {user && (
                <div className="user-info">
                    {user.imageUrl ? (
                        <img
                            src={user.imageUrl}
                            alt="Profilio nuotrauka"
                            className="user-avatar"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/50';
                            }}
                        />
                    ) : (
                        <div className="avatar-placeholder">
                            {user.username?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <p className="username">{user.username}</p>
                        <p className="user-status">Jūs jau prisijungęs</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label>Vartotojo vardas:</label>
                    <input
                        type="text"
                        value={form.username}
                        onChange={(e) => setForm({...form, username: e.target.value})}
                        required
                        minLength="4"
                        maxLength="20"
                    />
                </div>

                <div className="form-group">
                    <label>Slaptažodis:</label>
                    <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({...form, password: e.target.value})}
                        required
                        minLength="6"
                    />
                </div>

                {!isLogin && (
                    <div className="form-group">
                        <label>Pakartokite slaptažodį:</label>
                        <input
                            type="password"
                            value={form.confirmPassword || ''}
                            onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                            required
                            minLength="6"
                        />
                    </div>
                )}

                <button type="submit" className="submit-btn">
                    {isLogin ? 'Prisijungti' : 'Registruotis'}
                </button>
            </form>

            <div className="toggle-auth">
                <button
                    onClick={() => {
                        setIsLogin(!isLogin);
                        setError('');
                    }}
                >
                    {isLogin
                        ? 'Neturite paskyros? Registruokitės'
                        : 'Jau turite paskyrą? Prisijunkite'}
                </button>
            </div>
        </div>
    );
}
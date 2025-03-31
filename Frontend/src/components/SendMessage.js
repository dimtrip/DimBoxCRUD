import { useState } from 'react';
import useMessageStore from '../store/messageStore';

export default function SendMessage({ receiverUsername, onClose }) {
    const [text, setText] = useState('');
    const { loading, error } = useMessageStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!text.trim()) return;

            // Siuntimo logika...
            if (onClose) onClose();
        } catch (err) {
            console.error('Klaida:', err);
        }
    };

    return (
        <div className="send-message-container">
            <h3>Siųsti žinutę @{receiverUsername}</h3>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Jūsų žinutė..."
                    maxLength="1000"
                    required
                    rows="4"
                    disabled={loading}
                />
                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading || !text.trim()}
                    >
                        {loading ? 'Siunčiama...' : 'Siųsti'}
                    </button>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="cancel-btn"
                        >
                            Atšaukti
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
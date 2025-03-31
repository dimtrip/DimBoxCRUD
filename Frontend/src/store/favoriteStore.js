import { create } from 'zustand';

const useFavoriteStore = create((set) => ({
    favorites: [],
    loading: false,
    error: null,

    fetchFavorites: async () => {
        try {
            set({ loading: true, error: null });
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Nėra autentifikacijos tokeno');
            }

            const response = await fetch('http://localhost:5000/api/favorites', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            set({ favorites: data, loading: false });
        } catch (err) {
            console.error('Klaida gaunant mėgstamus postus:', err);
            set({ error: err.message, loading: false });
        }
    },

    addFavorite: async (postId) => {
        try {
            set({ loading: true, error: null });
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Nėra autentifikacijos tokeno');
            }

            const response = await fetch(`http://localhost:5000/api/favorites/${postId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            set({ loading: false });
        } catch (err) {
            console.error('Klaida pridedant mėgstamą postą:', err);
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    removeFavorite: async (postId) => {
        try {
            set({ loading: true, error: null });
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Nėra autentifikacijos tokeno');
            }

            const response = await fetch(`http://localhost:5000/api/favorites/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            set((state) => ({
                favorites: state.favorites.filter(post => post._id !== postId),
                loading: false
            }));
        } catch (err) {
            console.error('Klaida pašalinant mėgstamą postą:', err);
            set({ error: err.message, loading: false });
            throw err;
        }
    }
}));

export default useFavoriteStore;
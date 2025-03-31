import { create } from 'zustand';


const useCommentStore = create((set) => ({
    comments: [],
    loading: false,
    error: null,

    fetchComments: async (postId) => {
        try {
            set({ loading: true, error: null });
            const response = await fetch(`http://localhost:5000/api/comments/${postId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            set({ comments: data, loading: false });
        } catch (err) {
            console.error('Klaida gaunant komentarus:', err);
            set({ error: err.message, loading: false });
        }
    },

    createComment: async (commentData) => {
        try {
            set({ loading: true, error: null });

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Nėra autentifikacijos tokeno');
            }

            const response = await fetch('http://localhost:5000/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(commentData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            set((state) => ({ comments: [data, ...state.comments], loading: false }));
            return data;
        } catch (err) {
            console.error('Klaida kuriant komentarą:', err);
            set({ error: err.message, loading: false });
            throw err;
        }
    }
}));

export default useCommentStore;
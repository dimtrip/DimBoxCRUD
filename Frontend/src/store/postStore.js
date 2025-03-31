import { create } from 'zustand';

const usePostStore = create((set) => ({
    posts: [],
    loading: false,
    error: null,

    createPost: async (postData) => {
        try {
            set({ loading: true, error: null });
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(postData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            set((state) => ({ posts: [data, ...state.posts], loading: false }));
            return data;
        } catch (err) {
            console.error('Klaida kuriant postą:', err);
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    fetchPosts: async () => {
        try {
            set({ loading: true, error: null });
            const response = await fetch('http://localhost:5000/api/posts');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            set({ posts: data, loading: false });
        } catch (err) {
            console.error('Klaida gaunant postus:', err);
            set({ error: err.message, loading: false });
        }
    },

    getPostById: async (postId) => {
        try {
            set({ loading: true, error: null });
            const response = await fetch(`http://localhost:5000/api/posts/${postId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            set({ loading: false });
            return data;
        } catch (err) {
            console.error('Klaida gaunant postą:', err);
            set({ error: err.message, loading: false });
            throw err;
        }
    }
}));

export default usePostStore;
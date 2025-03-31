import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/store';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import CreatePostPage from './pages/CreatePostPage';
import PostsPage from './pages/PostsPage';
import UserProfilePage from './pages/UserProfilePage';
import PostDetailPage from './pages/PostDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import ConversationList from './pages/ConversationList';
import ConversationPage from './pages/ConversationPage';
import './styles.css';

function App() {
    const { user } = useAuthStore();

    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={user ? <Navigate to="/posts" /> : <HomePage />} />
                    <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/" />} />
                    <Route path="/profile/:username" element={<UserProfilePage />} />
                    <Route path="/posts" element={<PostsPage />} />
                    <Route path="/posts/:postId" element={<PostDetailPage />} />
                    <Route path="/posts/create" element={user ? <CreatePostPage /> : <Navigate to="/" />} />
                    <Route path="/favorites" element={user ? <FavoritesPage /> : <Navigate to="/" />} />
                    <Route path="/messages" element={user ? <ConversationList /> : <Navigate to="/" />} />
                    <Route path="/messages/:username" element={user ? <ConversationPage /> : <Navigate to="/" />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
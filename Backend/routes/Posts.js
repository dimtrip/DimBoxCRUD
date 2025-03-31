import express from 'express';
import { auth } from '../middleware/authMiddleware.js';
import Post from '../models/Post.js';


const router = express.Router();

// Sukurti naują postą
router.post('/', auth, async (req, res) => {
    try {
        const { title, description } = req.body;

        const post = new Post({
            title,
            description,
            username: req.user.username,
            userId: req.user._id
        });

        await post.save();

        // Grąžiname su papildomais laukais
        const result = post.toObject();
        result.commentsCount = 0;

        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Gauti visus postus
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .select('title description createdAt username userId commentsCount');
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Gauti konkretų postą pagal ID
router.get('/:postId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
            .select('title description createdAt username userId commentsCount');

        if (!post) {
            return res.status(404).json({ error: 'Postas nerastas' });
        }

        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
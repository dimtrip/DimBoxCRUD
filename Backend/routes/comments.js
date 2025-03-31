import express from 'express';
import { auth } from '../middleware/authMiddleware.js';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

const router = express.Router();

// Gauti visus komentarus pagal postą
router.get('/:postId', async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId })
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Sukurti naują komentarą
router.post('/', auth, async (req, res) => {
    try {
        const { text, postId } = req.body;

        const comment = new Comment({
            text,
            username: req.user.username,
            userId: req.user._id,
            postId
        });

        await comment.save();

        // Atnaujiname komentarų skaičių poste
        await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

        res.status(201).json(comment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
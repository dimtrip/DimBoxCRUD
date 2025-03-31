import express from 'express';
import bcrypt from 'bcryptjs';
import { auth } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Post from '../models/Post.js';


const router = express.Router();

// Gauti prisijungusio vartotojo profilį
router.get('/me', auth, async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .select('title description createdAt commentsCount');

        res.json({
            username: req.user.username,
            imageUrl: req.user.imageUrl,
            postsCount: posts.length,
            posts
        });
    } catch (err) {
        res.status(500).json({ error: 'Vidinė serverio klaida' });
    }
});

// Gauti vartotojo duomenis pagal vardą
router.get('/:username', async (req, res) => {
    try {
        if (!req.params.username || typeof req.params.username !== 'string') {
            return res.status(400).json({ error: 'Netinkamas vartotojo vardas' });
        }

        const user = await User.findOne({ username: req.params.username })
            .select('username imageUrl');

        if (!user) {
            return res.status(404).json({ error: 'Vartotojas nerastas' });
        }

        const posts = await Post.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .select('title description createdAt commentsCount');

        res.json({
            username: user.username,
            imageUrl: user.imageUrl,
            postsCount: posts.length,
            posts
        });
    } catch (err) {
        console.error('Klaida:', err);
        res.status(500).json({ error: 'Vidinė serverio klaida' });
    }
});

// Atnaujinti profilį
router.put('/me', auth, async (req, res) => {
    try {
        const { username, password, imageUrl } = req.body;
        const updates = {};

        if (username) updates.username = username;
        if (password) updates.password = await bcrypt.hash(password, 10);
        if (imageUrl) updates.imageUrl = imageUrl;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, select: 'username imageUrl' }
        );

        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
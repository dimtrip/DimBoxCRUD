import express from 'express';
import { auth } from '../middleware/authMiddleware.js';
import Favorite from '../models/Favorite.js';


const router = express.Router();

// Gauti vartotojo mėgstamus postus
router.get('/', auth, async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.user._id })
            .populate('postId')
            .sort({ createdAt: -1 });

        const favoritePosts = favorites.map(fav => fav.postId).filter(post => post !== null);
        res.json(favoritePosts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Pridėti postą prie mėgstamų
router.post('/:postId', auth, async (req, res) => {
    try {
        const { postId } = req.params;

        const existingFavorite = await Favorite.findOne({
            userId: req.user._id,
            postId
        });

        if (existingFavorite) {
            return res.status(400).json({ error: 'Postas jau yra mėgstamų sąraše' });
        }

        const favorite = new Favorite({
            userId: req.user._id,
            postId
        });

        await favorite.save();
        res.status(201).json({ message: 'Postas pridėtas prie mėgstamų' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Pašalinti postą iš mėgstamų
router.delete('/:postId', auth, async (req, res) => {
    try {
        const { postId } = req.params;

        const favorite = await Favorite.findOneAndDelete({
            userId: req.user._id,
            postId
        });

        if (!favorite) {
            return res.status(404).json({ error: 'Mėgstamas postas nerastas' });
        }

        res.json({ message: 'Postas pašalintas iš mėgstamų' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
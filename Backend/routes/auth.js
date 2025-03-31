import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Registracija
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (await User.findOne({ username })) {
            return res.status(400).json({ error: 'Vartotojas jau egzistuoja' });
        }

        const user = new User({
            username,
            password: await bcrypt.hash(password, 10)
        });

        await user.save();
        res.status(201).json({ message: 'Vartotojas sukurtas' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Prisijungimas
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: 'Neteisingi duomenys' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { username: user.username, imageUrl: user.imageUrl } });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
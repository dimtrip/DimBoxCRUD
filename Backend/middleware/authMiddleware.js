import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Autentifikacija reikalinga' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'Vartotojas nerastas' });
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Autentifikacijos klaida' });
    }
};
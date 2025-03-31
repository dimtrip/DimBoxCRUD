import express from 'express';
import { auth } from '../middleware/authMiddleware.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

const router = express.Router();

// Siųsti naują žinutę
router.post('/', auth, async (req, res) => {
    try {
        const { receiverUsername, content, replyTo } = req.body;

        const receiver = await User.findOne({ username: receiverUsername });
        if (!receiver) {
            return res.status(404).json({ error: 'Gavėjas nerastas' });
        }

        const message = new Message({
            sender: req.user._id,
            receiver: receiver._id,
            content,
            ...(replyTo && { replyTo })
        });

        await message.save();
        res.status(201).json(message);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Gauti visus pokalbius dabartiniam vartotojui
router.get('/conversations', auth, async (req, res) => {
    try {
        // Gauti visas žinutes, kuriose vartotojas yra siuntėjas arba gavėjas
        const messages = await Message.find({
            $or: [
                { sender: req.user._id },
                { receiver: req.user._id }
            ]
        })
            .populate('sender', 'username imageUrl')
            .populate('receiver', 'username imageUrl')
            .sort({ createdAt: -1 });

        // Grupuoti pagal pokalbio dalyvį
        const conversationsMap = new Map();

        messages.forEach(message => {
            const partnerId = message.sender._id.equals(req.user._id)
                ? message.receiver._id
                : message.sender._id;

            const partner = message.sender._id.equals(req.user._id)
                ? message.receiver
                : message.sender;

            if (!conversationsMap.has(partnerId.toString())) {
                conversationsMap.set(partnerId.toString(), {
                    user: partner,
                    lastMessage: message,
                    unreadCount: 0
                });
            }

            // Skaičiuoti neperskaitytas žinutes
            if (message.receiver._id.equals(req.user._id) && !message.read) {
                const conv = conversationsMap.get(partnerId.toString());
                conv.unreadCount += 1;
            }
        });

        const conversations = Array.from(conversationsMap.values());

        res.json(conversations);
    } catch (err) {
        console.error('Klaida gaunant pokalbius:', err);
        res.status(500).json({ error: 'Nepavyko gauti pokalbių' });
    }
});

// Gauti žinutes tarp dabartinio ir kito vartotojo
router.get('/:username', auth, async (req, res) => {
    try {
        const otherUser = await User.findOne({ username: req.params.username });
        if (!otherUser) {
            return res.status(404).json({ error: 'Vartotojas nerastas' });
        }

        // Pažymėti žinutes kaip perskaitytas
        await Message.updateMany(
            {
                sender: otherUser._id,
                receiver: req.user._id,
                read: false
            },
            { $set: { read: true } }
        );

        const messages = await Message.find({
            $or: [
                { sender: req.user._id, receiver: otherUser._id },
                { sender: otherUser._id, receiver: req.user._id }
            ]
        })
            .sort({ createdAt: 1 })
            .populate('sender', 'username imageUrl')
            .populate('receiver', 'username imageUrl')
            .populate({
                path: 'replyTo',
                populate: [
                    { path: 'sender', select: 'username' },
                    { path: 'receiver', select: 'username' }
                ]
            });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ištrinti žinutę
router.delete('/:id', auth, async (req, res) => {
    try {
        const message = await Message.findOneAndDelete({
            _id: req.params.id,
            $or: [
                { sender: req.user._id },
                { receiver: req.user._id }
            ]
        });

        if (!message) {
            return res.status(404).json({ error: 'Žinutė nerasta' });
        }

        res.json({ message: 'Žinutė ištrinta' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
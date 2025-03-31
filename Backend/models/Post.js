import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
    username: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    commentsCount: { type: Number, default: 0 }
});

export default mongoose.model('Post', PostSchema);
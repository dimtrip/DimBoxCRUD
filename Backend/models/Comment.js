import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    text: { type: String, required: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
    username: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }
});

export default mongoose.model('Comment', CommentSchema);
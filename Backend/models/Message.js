import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    receiver: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    content: {type: String, required: true, maxlength: 1000},
    createdAt: {type: Date, default: Date.now},
    read: {type: Boolean, default: false},
    replyTo: {type: mongoose.Schema.Types.ObjectId, ref: 'Message'}
});

export default mongoose.model('Message', MessageSchema);
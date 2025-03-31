import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, min: 4, max: 20 },
    password: { type: String, required: true, min: 6 },
    imageUrl: { type: String, default: '' }
});

export default mongoose.model('User', UserSchema);
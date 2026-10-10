import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  commissionRate: {
    type: Number,
    default: 2.0,
  },
});

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;

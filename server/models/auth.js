import mongoose from "mongoose";

// Define the schema for the user model
const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
  },
  bio: String,
  country: { type: String, default: 'Sierra Leone' }, 
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  sudo: {
    type: Boolean,
    default: false,
  },

  // 🔥 Subscription fields
  subscription: {
    type: Boolean,
    default: true,               // starts as active
  },
  subscriptionExpiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),  // +30 days
  },

  twoFactorSecret: {
    type: String,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  lastLoginIP: {
    type: String,
  },
  lastLoginDevice: {
    type: String,
  },
  lastLoginCountry: {
    type: String,
  },
  loginHistory: [
    {
      ip: String,
      device: String,
      country: String,
      date: { type: Date, default: Date.now },
    },
  ],
  messages: [
    {
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
      message: String,
      link: String,
      date: { type: Date, default: Date.now },
      replies: [
        {
          senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
          replyMessage: String,
          date: { type: Date, default: Date.now },
        }
      ]
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }

}, { timestamps: true });

const User = mongoose.model('users', userSchema);
export default User;

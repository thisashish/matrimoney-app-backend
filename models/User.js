const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the schema for a single photo
const PhotoSchema = new mongoose.Schema({
  filename: String,
  originalname: String,
  mimetype: String,
  size: Number
});

// Define the user schema
const UserSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() }, // Modified default value assignment
  firstName: String,
  lastName: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
},
  phone: Number,
  password: {
    type: String,
    required: true
  },
  confirm_password: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        // Ensure the confirm_password matches the password
        return value === this.password;
      },
      message: 'Password and confirm password do not match'
    }
  },
  age: Number,
  gender: {
    type: String,
    enum: ['male', 'female']
  },
  dateOfBirth: Date,
  // bio: String,
  preferences: {
    ageRange: {
      min: Number,
      max: Number
    },
    gender: {
      type: String,
      enum: ['male', 'female']
    }
  },
  otp: String,
  isOtpVerified: {
    type: Boolean,
    default: false
  },
  photos: [PhotoSchema],
  bio: {
    type: String,
  },
  maritalStatus: {
    type: String,
    enum: ['Never Married', 'Divorced', 'Widowed', 'Awaiting divorce'],
  },
  religion: {
    type: String,
    // enum: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Parsis', 'Others'],
  },
  motherTongue: {
    type: String,
    // enum: ['Hindi', 'Marathi', 'Bangali', 'Telugu', 'Tamil', 'Kannada'],
  },
  community: {
    type: String,
  },
  settleDown: {
    type: String,
  },
  homeTown: String,
  highestQualification: String,
  college: String,
  jobTitle: String,
  companyName: String,
  salary: Number,
  foodPreference: String,
  smoke: {
    type: String,
    enum: ['Never', 'Socially', 'Ragularly', 'Planning to quit']
  },
  drink: {
    type: String,
  },
  sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  receivedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  acceptedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tokens: [{ type: String }]
});

// Hash password and confirm_password before saving to database
UserSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password') && !user.isModified('confirm_password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(user.password, salt);
  const confirmHash = await bcrypt.hash(user.confirm_password, salt);
  user.password = passwordHash;
  user.confirm_password = confirmHash;
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;

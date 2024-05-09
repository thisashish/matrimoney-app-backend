const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');


const PhotoSchema = new mongoose.Schema({
  filename: String,
  originalname: String,
  mimetype: String,
  size: Number
});



const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  firstName: String,
  lastName: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['user', 'admin','super-admin'],
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
        
        return value === this.password;
      },
      message: 'Password and confirm password do not match'
    }
  },
  age: Number,
  gender: {

    type: String,
    // enum: ['Male', 'Female']
  },
  dateOfBirth: Date,

  preferences: {
    ageRange: {
      min: Number,
      max: Number
    },
    gender: {
      type: String,
      enum: ['Male', 'Female']
    }
  },
  otp: String,
  isOtpVerified: {
    type: Boolean,
    default: false
  },
  photos: [PhotoSchema],
  profileVisitors: [{ type: String, ref: 'User' }],
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



UserSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password') && !user.isModified('confirm_password') && !user.isModified('firstName') && !user.isModified('lastName') && !user.isModified('email')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(user.password, salt);
    const confirmHash = await bcrypt.hash(user.confirm_password, salt);
    user.password = passwordHash;
    user.confirm_password = confirmHash;

    // Generate unique userId based on email
    const userId = generateUniqueId(user.email);
    user.userId = userId;

    next();
  } catch (error) {
    next(error);
  }
});

// Function to generate unique ID using email
function generateUniqueId(email) {
  const hash = crypto.createHash('sha256').update(email).digest('hex');
  return hash.substring(0, 8);
}




const User = mongoose.model('User', UserSchema);

module.exports = User;

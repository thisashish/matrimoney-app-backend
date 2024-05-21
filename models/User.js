const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');


const PhotoSchema = new mongoose.Schema({
  filename: String,
  originalname: String,
  mimetype: String,
  size: Number,
  verified: {
    type: Boolean,
    default: false
  }
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
    enum: ['user', 'admin', 'super-admin'],
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

  gender: {

    type: String,
    enum: ['Male', 'Female'],
    required:true
  },
  dateOfBirth: Date,

  // Calculate age based on date of birth
  age: {
    type: Number,
    default: function () {
      if (!this.dateOfBirth) return null;
      const diff = Date.now() - this.dateOfBirth.getTime();
      const ageDate = new Date(diff);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    }
  },

  // Format date of birth to make it more readable
  formattedDateOfBirth: {
    type: String,
    default: function () {
      if (!this.dateOfBirth) return null;
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return this.dateOfBirth.toLocaleDateString('en-US', options);
    }
  },


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
  
  status: { type: String, enum: ['active', 'blocked', 'inactive'], default: 'active' },

  bio: {
    type: String,
  },
  maritalStatus: {
    type: String,
    // enum: ['Never Married', 'Divorced', 'Widowed', 'Awaiting divorce'],
  },
  religion: {
    type: String,

  },
  height: Number,
  motherTongue: {
    type: String,

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
    // enum: ['Never', 'Socially', 'Ragularly', 'Planning to quit']
  },
  drink: {
    type: String,
  },

  sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  receivedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  acceptedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  declinedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
  
  blockedUsers: [String],

  interactedUsers: { type: [String], default: [] },
  dailyRequestCount: { type: Number, default: 0 },
  lastRequestDate: { type: Date, default: Date.now },
  isPremium: { type: Boolean, default: false },
  tokens: [{ type: String }],
  firstPhotoVerified: {
    type: Boolean,
    default: false
  },
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

    // Mark the first photo as verified
    if (user.photos && user.photos.length > 0 && !user.firstPhotoVerified) {
      user.photos[0].verified = true;
      user.firstPhotoVerified = true;
    }

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

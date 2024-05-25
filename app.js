const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const session = require('express-session');

// const { connectRabbitMQ } = require('./utils/rabbitmq');
const { initializeSocket } = require('./utils/socket');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const photoRoutes = require('./routes/photoRoutes');
const profileRoutes = require('./routes/profileRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const chatRoutes = require('./routes/chatRoutes');
const superadminRoutes = require('./routes/super-adminRoutes');
const collegeList = require('./routes/user/collegeList');
const jobtitle = require('./routes/user/jobtitle');
const userQualification = require('./routes/user/qualification');
const paymentRoutes = require('./routes/paymentRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

const connectDB = require('./utils/db');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// Middleware to update online status
app.use((req, res, next) => {
  if (req.user) {
    const onlineThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds
    const currentTime = new Date();

    // Check if the user's last online time is within the online threshold
    const isOnline = (currentTime - req.user.lastOnline) <= onlineThreshold;

    // Update the online status based on activity within the threshold
    User.findByIdAndUpdate(req.user._id, { online: isOnline, lastOnline: currentTime }, (err, user) => {
      if (err) {
        console.error('Error updating online status:', err);
      }
    });
  }
  next();
});


// Connect to MongoDB
connectDB();
// connectRabbitMQ();
initializeSocket(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));
app.set("view engine", "ejs");
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/super-admin', superadminRoutes);
app.use('/college-list', collegeList);
app.use('/api/job-titles', jobtitle);
app.use('/api/qualification', userQualification);
app.use('/api/payment', paymentRoutes);
app.use('/api/user', recommendationRoutes);

// Serve uploaded photos statically
app.use('/uploads', express.static('uploads'));

// Ensure indexes are created
const Message = require('./models/Message');
Message.createIndexes();

const cron = require('node-cron');
const chatController = require('./controllers/chatController');
// Schedule the deleteOldMessages task to run every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    await chatController.deleteOldMessages();
  } catch (error) {
    console.error('Error running scheduled deleteOldMessages task:', error);
  }
});


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


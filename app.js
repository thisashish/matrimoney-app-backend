// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');


const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const photoRoutes = require('./routes/photoRoutes');
const profileRoutes = require('./routes/profileRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const chatRoutes = require('./routes/chatRoutes');
const superadminRoutes = require('./routes/super-adminRoutes');
const collegeList = require('./routes/user/collegeList');
const jobtitle = require('./routes/user/jobtitle');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = socketIo(server);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => console.log(err));

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



// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/super-admin', superadminRoutes);
app.use('/college-list',collegeList);
app.use('/api/job-titles', jobtitle);
// Serve uploaded photos statically
app.use('/uploads', express.static('uploads'));

// Socket.IO integration
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('newMessage', (message) => {
    console.log('New message:', message);
    // Broadcast the message to all connected clients
    io.emit('newMessage', message);
  });
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

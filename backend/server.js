const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ["https://quizverses.netlify.app", "http://localhost:3000", "http://localhost:5173"];

app.use(cors({
    origin: corsOrigins,
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/attempts', require('./routes/attempts'));

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!', status: 'success' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://prashantmaurya307:Kartik%40701@cluster0.x4l2566.mongodb.net/')
    .then(() => console.log('MongoDB connected to Atlas successfully! ✅'))
    .catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port: ${PORT} ✅`));

// Load environment variables from .env file FIRST
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const mapRoutes = require('./routes/mapRoutes');
const path = require('path'); 

// --- 1. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully...'))
    .catch(err => console.error('MongoDB connection error. Is the connection string correct?', err));

const app = express();

// --- 2. MIDDLEWARE SETUP ---
// Configure CORS for allowed origins
app.use(cors({
    origin: [
        'https://insdaga.netlify.app', 
        'http://localhost:5175', 
        'http://localhost:5174', 
        'http://localhost:5173', // Vite default port
    ]
}));

// Express middleware to parse incoming JSON request bodies (REQUIRED for POST /new)
app.use(express.json());

// Serve the 'uploads' folder statically
// This maps '/uploads' to the local 'public/uploads' directory for image retrieval
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static('public'));


// --- 3. ROUTE REGISTRATION ---
app.use('/api/map', mapRoutes);

// --- 4. SERVER START ---
const PORT = 5005;
app.listen(PORT, () => console.log(`Express Server running on port ${PORT}`));
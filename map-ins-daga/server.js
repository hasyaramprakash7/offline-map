// server.js

// Load environment variables from .env file FIRST
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const mapRoutes = require('./routes/mapRoutes');
const path = require('path'); 

// --- SECURITY/STABILITY CHECK ---
if (!process.env.MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined in the .env file.');
    // Exit the application if the crucial environment variable is missing
    process.exit(1); 
}

// --- 1. DATABASE CONNECTION & ERROR HANDLING ---
mongoose.set('strictQuery', true); 

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB initial connection established...'))
    // Catch initial connection failure
    .catch(err => console.error('MongoDB initial connection error. Is the connection string correct?', err));

const db = mongoose.connection; // Get the default connection object

// Set up event listeners for connection status
db.on('error', (err) => console.error('MongoDB runtime error:', err));
db.on('disconnected', () => console.log('MongoDB disconnected. Reconnecting...'));
db.on('reconnected', () => console.log('MongoDB reconnected successfully!'));
db.once('open', () => console.log('MongoDB connection successful and open.'));


const app = express();

// --- 2. MIDDLEWARE SETUP (UPDATED FOR ALL ORIGINS) ---

// !!! WARNING: Using 'origin: *' allows ANY domain to access your API. 
// This is suitable for debugging/development but is NOT secure for production.
app.use(cors({
    origin: '*', // <--- WILD CARD: ALL ORIGINS ARE NOW ALLOWED
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
}));


// Express middleware to parse incoming JSON request bodies (REQUIRED for POST /new)
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Serve the 'uploads' folder statically under the '/uploads' URL path
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


// --- 3. ROUTE REGISTRATION ---
// All routes defined in mapRoutes.js will be prefixed with /api/map
app.use('/api/map', mapRoutes);

// --- 4. SERVER START ---
// Use the environment variable PORT (standard for cloud hosting), or default to 5005
const PORT = process.env.PORT || 5005; 

app.listen(PORT, () => {
    console.log(`Express Server running on port ${PORT}.`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Access at http://localhost:${PORT}`);
    }
});
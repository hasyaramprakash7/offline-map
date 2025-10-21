const express = require('express');
const router = express.Router();
const axios = require('axios');
const Building = require('../models/Building'); 
const multer = require('multer');
const path = require('path');

// --- MULTER CONFIGURATION for File Uploads ---
const storage = multer.diskStorage({
    destination: './public/uploads/', 
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50000000 }, 
}).single('360Image');

// --- 1. GET /buildings: Fetch All Building Data as GeoJSON ---
router.get('/buildings', async (req, res) => {
    try {
        const buildings = await Building.find({});
        const geojson = {
            type: "FeatureCollection",
            features: buildings.map(b => ({
                type: "Feature",
                geometry: b.location,
                properties: {
                    id: b._id,
                    name: b.name,
                    category: b.category,
                    height: b.buildingInfo ? b.buildingInfo.height : null,
                    imageURL: b.imageURL
                }
            }))
        };
        res.json(geojson);
    } catch (err) {
        console.error("Error retrieving buildings:", err);
        res.status(500).json({ msg: 'Server error retrieving buildings' });
    }
});

// --- 2. POST /route: Calculate Path ---
router.post('/route', async (req, res) => {
    const { startLng, startLat, endLng, endLat } = req.body;
    const OSRM_URL = `http://router.project-osrm.org/route/v1/foot/${startLng},${startLat};${endLng},${endLat}?geometries=geojson`;

    try {
        const response = await axios.get(OSRM_URL);
        if (response.data && response.data.routes && response.data.routes.length > 0) {
            res.json(response.data.routes[0].geometry);
        } else {
            res.status(404).json({ msg: 'OSRM: Route could not be found between the points.' });
        }
    } catch (err) {
        console.error("Routing service error:", err.message);
        res.status(500).json({ msg: 'Public Routing service error - Check coordinates or network.' });
    }
});

// --- 3. POST /upload: Handle Image Uploads ---
router.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err || req.file === undefined) {
            return res.status(400).json({ msg: err || 'No file selected!' });
        }
        res.json({
            msg: 'File uploaded!',
            filePath: `/uploads/${req.file.filename}`
        });
    });
});

// --- 4. POST /new: Save New Building Data ---
router.post('/new', async (req, res) => {
    try {
        const newBuilding = new Building(req.body);
        await newBuilding.save();
        res.status(201).json({ msg: 'Building data saved successfully!', id: newBuilding._id });
    } catch (err) {
        console.error("Data entry error:", err.message); 
        if (err.name === 'ValidationError') {
            // This returns the specific Mongoose error message
            return res.status(400).json({ msg: `Validation Error: ${err.message}` });
        }
        res.status(400).json({ msg: 'Invalid data format or server error.' });
    }
});

module.exports = router;
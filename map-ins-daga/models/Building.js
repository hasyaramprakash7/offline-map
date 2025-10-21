const mongoose = require('mongoose');

// --- 1. GEOSPATIAL DATA STRUCTURES ---

// Define the schema for the GeoJSON Geometry (Point or Polygon)
// This is reusable for both the 'location' (polygon) and 'viewpoint' (point) fields.
const GeoSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point', 'Polygon'], // MongoDB supports these standard GeoJSON types
        required: true,
    },
    coordinates: {
        // Stores array of coordinates: [[...]] for Polygon, [lng, lat] for Point
        type: mongoose.Schema.Types.Mixed,
        required: true,
    }
});

// --- 2. MAIN BUILDING SCHEMA ---

const BuildingSchema = new mongoose.Schema({
    // Standard descriptive fields
    name: {
        type: String,
        required: true,
    },
    description: String,

    // **NEW FIELD: Category for grouping and list display**
    category: {
        type: String,
        // Enforce a list of valid categories
        enum: ['Building', 'Cabin', 'Security Pillar', 'Gate', 'Other',"main"],
        default: 'Building',
        required: true,
    },

    // Custom data used for front-end logic (3D rendering and info pop-ups)
    buildingInfo: {
        // CRITICAL: Used by MapLibre's extrusion effect to draw buildings in 3D
        height: Number,
        capacity: Number,
        hours: String,
    },

    // The GeoJSON Polygon representing the building's physical footprint on the map
    location: {
        type: GeoSchema,
        // CRITICAL: Enables MongoDB's spatial queries (e.g., finding nearby buildings)
        index: '2dsphere'
    },

    // The point used for triggering the 360° virtual tour
    viewpoint: {
        type: GeoSchema,
        index: '2dsphere'
    },

    // The link to the actual 360° image file hosted on your server's public folder
    imageURL: String
});

module.exports = mongoose.model('Building', BuildingSchema);
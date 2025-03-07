const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    image: { type: String, required: true },
    availability: { type: [String], required: true },
    timeSlots: { type: [String], required: true },
    consultationType: { 
        type: String, 
        enum: ["In-person", "Video"], 
        required: true 
    }
});

module.exports = mongoose.model("Doctor", doctorSchema);

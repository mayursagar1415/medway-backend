require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const Doctor = require("./models/doctor"); // Import Doctor model

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((error) => console.log("❌ MongoDB connection error:", error));

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Multer to use Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "medway/doctors",
        allowed_formats: ["jpg", "png", "jpeg"],
    },
});

const upload = multer({ storage: storage });

// ✅ Test API Route
app.get("/", (req, res) => {
    res.send("✅ Medway API is running...");
});

// ✅ GET API to fetch all doctors
app.get("/api/doctors", async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ POST API to add a new doctor with image upload

app.post("/api/doctors", upload.single("image"), async (req, res) => {
    try {
        const {
            name, specialization, experience, rating, availability,
            timeSlots, consultationType
        } = req.body;

        const imageUrl = req.file?.path; // Cloudinary image URL (use optional chaining)

        if (!imageUrl) {
            return res.status(400).json({ error: "❌ Image upload failed. Please try again." });
        }

        const newDoctor = new Doctor({
            name,
            specialization,
            experience: parseInt(experience),
            rating: parseFloat(rating),
            image: imageUrl,
            availability: availability.split(",").map(day => day.trim()),
            timeSlots: timeSlots.split(",").map(slot => slot.trim()),
            consultationType
        });

        await newDoctor.save();
        res.json({ message: "✅ Doctor added successfully!" });
    } catch (error) {
        console.error("❌ Error adding doctor:", error.message);
        res.status(500).json({ error: error.message });
    }
});


// ✅ DELETE API to remove a doctor by ID
app.delete("/api/doctors/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await Doctor.findByIdAndDelete(id);
        res.json({ message: "✅ Doctor deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ PUT API to update doctor information by ID
app.put("/api/doctors/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const updatedDoctor = await Doctor.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedDoctor) {
            return res.status(404).json({ message: "❌ Doctor not found" });
        }

        res.json({ message: "✅ Doctor updated successfully!", doctor: updatedDoctor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Start Server
//const PORT
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));

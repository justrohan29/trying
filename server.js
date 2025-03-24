// Import required dependencies
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize the Express app
const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cors()); // Enable CORS for frontend-backend communication

// Data storage
const groups = []; // Store groups, their members, and photos

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'group-photos', // Folder name in Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg'], // Restrict allowed formats
    },
});
const upload = multer({ storage: storage });

// Route: Base Test Route
app.get('/', (req, res) => {
    res.send('Welcome to the Photo Exhibition Platform!');
});

// Route: Host a Group
app.post('/host-group', (req, res) => {
    const { groupName, safeKey, host } = req.body;
    if (!groupName || !safeKey || !host) {
        return res.status(400).json({ message: 'Group name, safe key, and host are required!' });
    }

    // Check if the group already exists
    if (groups.find((g) => g.safeKey === safeKey)) {
        return res.status(400).json({ message: 'A group with this safe key already exists!' });
    }

    groups.push({
        groupName,
        safeKey,
        host,
        members: [host],
        photos: [],
    });

    res.json({ message: `Group '${groupName}' hosted successfully!`, safeKey });
});

// Route: Join a Group
app.post('/join-group', (req, res) => {
    const { safeKey, user } = req.body;
    const group = groups.find((g) => g.safeKey === safeKey);

    if (!group) {
        return res.status(404).json({ message: 'Group not found!' });
    }

    if (group.members.includes(user)) {
        return res.status(400).json({ message: 'You are already part of this group!' });
    }

    group.members.push(user);
    res.json({ message: `You joined '${group.groupName}' successfully!`, groupName: group.groupName });
});

// Route: Upload Photo to Group
app.post('/upload-photo', upload.single('photo'), (req, res) => {
    const { safeKey, user } = req.body;
    const group = groups.find((g) => g.safeKey === safeKey);

    if (!group) {
        return res.status(404).json({ message: 'Group not found!' });
    }

    if (!group.members.includes(user)) {
        return res.status(403).json({ message: 'You are not a member of this group!' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'No photo uploaded!' });
    }

    const photoUrl = req.file.path;
    group.photos.push({ url: photoUrl, uploadedBy: user });
    res.json({ message: 'Photo uploaded successfully!', photoUrl });
});

// Route: Fetch Photos from a Group
app.get('/group-photos', (req, res) => {
    const { safeKey, user } = req.query;
    const group = groups.find((g) => g.safeKey === safeKey);

    if (!group) {
        return res.status(404).json({ message: 'Group not found!' });
    }

    if (!group.members.includes(user)) {
        return res.status(403).json({ message: 'You are not a member of this group!' });
    }

    res.json({ photos: group.photos });
});

// Start the Server
app.listen(5000, () => {
    console.log('Backend server running on http://localhost:5000');
});

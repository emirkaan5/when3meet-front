const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware
app.use(cors());
app.use(express.json());

// Test user for regular login
const testUser = {
    email: "ggoel@test.com",
    password: "test123",
    userName: "ggoel"
};

// Regular login endpoint
app.post('/users/login', (req, res) => {
    const { email, password } = req.body;
    
    if (email === testUser.email && password === testUser.password) {
        res.json({
            success: true,
            user: {
                email: testUser.email,
                userName: testUser.userName
            }
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid email or password'
        });
    }
});

// Google OAuth login endpoint
app.post('/auth/google', async (req, res) => {
    try {
        const { id_token } = req.body;
        
        // Verify the Google ID token
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;
        
        res.json({
            success: true,
            user: {
                email,
                userName: name,
                picture
            }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid Google token'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
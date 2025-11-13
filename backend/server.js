const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// MongoDB connection
let db;
MongoClient.connect(process.env.MONGODB_URI)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db('when3meet');
  })
  .catch(error => console.error('MongoDB connection error:', error));

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
app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Check test user first
        if (email === testUser.email && password === testUser.password) {
            // Store/update user in database
            await db.collection('users').updateOne(
                { email: testUser.email },
                { 
                    $set: { 
                        email: testUser.email,
                        userName: testUser.userName,
                        loginMethod: 'regular',
                        lastLogin: new Date()
                    }
                },
                { upsert: true }
            );
            
            console.log(`User ${testUser.email} logged in and stored in database`);
            
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
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
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
        const { email, name, picture, sub: googleId } = payload;
        
        // Store/update user in database
        const result = await db.collection('users').updateOne(
            { email: email },
            { 
                $set: { 
                    email: email,
                    userName: name,
                    picture: picture,
                    googleId: googleId,
                    loginMethod: 'google',
                    lastLogin: new Date()
                }
            },
            { upsert: true }
        );
        
        console.log(`Google user ${email} logged in and stored in database`);
        console.log('Database operation result:', result.upsertedId ? 'New user created' : 'Existing user updated');
        
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

// Endpoint to check users in database
app.get('/users', async (req, res) => {
    try {
        const users = await db.collection('users').find({}).toArray();
        res.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
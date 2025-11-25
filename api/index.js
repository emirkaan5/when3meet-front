import express from 'express';
import cors from 'cors';
import { OAuth2Client } from 'google-auth-library';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

let db;
let dbClient;

async function connectDB() {
  if (db) return db;
  
  dbClient = await MongoClient.connect(process.env.MONGODB_URI);
  db = dbClient.db('when3meet');
  return db;
}

app.use(cors());
app.use(express.json());

const testUser = {
  email: "ggoel@test.com",
  password: "test123",
  userName: "ggoel"
};

app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const database = await connectDB();
    
    if (email === testUser.email && password === testUser.password) {
      await database.collection('users').updateOne(
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

app.post('/api/auth/google', async (req, res) => {
  try {
    const { id_token } = req.body;
    const database = await connectDB();
    
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;
    
    await database.collection('users').updateOne(
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

app.post('/api/availability', async (req, res) => {
  try {
    const database = await connectDB();
    const { eventKey, name, selectedByDay, userEmail } = req.body;
    
    if (!eventKey || !name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: eventKey and name'
      });
    }
    
    const availabilityData = {
      eventKey,
      name,
      selectedByDay: selectedByDay || {},
      userEmail: userEmail || 'anonymous',
      timestamp: new Date()
    };
    
    const result = await database.collection('availability').insertOne(availabilityData);
    
    res.json({
      success: true,
      id: result.insertedId
    });
  } catch (error) {
    console.error('Error saving availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save availability'
    });
  }
});

app.get('/api/availability/:eventKey', async (req, res) => {
  try {
    const database = await connectDB();
    const { eventKey } = req.params;
    const availability = await database.collection('availability').find({ eventKey }).toArray();
    res.json({ availability });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

app.post('/api/meetings', async (req, res) => {
  try {
    const database = await connectDB();
    const { title, description, startTime, endTime, selectedDays, month, year, creatorEmail } = req.body;
    
    const meetingData = {
      title,
      description: description || '',
      startTime,
      endTime,
      selectedDays,
      month,
      year,
      creatorEmail: creatorEmail || 'anonymous',
      createdAt: new Date()
    };
    
    const result = await database.collection('meetings').insertOne(meetingData);
    
    res.json({
      success: true,
      id: result.insertedId,
      meeting: meetingData
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create meeting'
    });
  }
});

app.get('/api/meetings', async (req, res) => {
  try {
    const database = await connectDB();
    const meetings = await database.collection('meetings').find({}).toArray();
    res.json({ meetings });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const database = await connectDB();
    const users = await database.collection('users').find({}).toArray();
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default app;

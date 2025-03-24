const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database simulation with JSON file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to submit feedback
app.post('/api/feedback', async (req, res) => {
  try {
    let feedback = (await kv.get('feedback')) || [];
    const feedbackData = {
      ...req.body,
      timestamp: new Date().toISOString()
    };
    feedback.push(feedbackData);
    await kv.set('feedback', feedback);
    res.status(200).json({ success: true, message: 'Feedback submitted' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error saving feedback' });
  }
});

// API endpoint to get all feedback (admin dashboard)


// Admin dashboard route
app.get('/api/feedback', async (req, res) => {
  try {
    const feedback = (await kv.get('feedback')) || [];
    res.status(200).json(feedback);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving feedback' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
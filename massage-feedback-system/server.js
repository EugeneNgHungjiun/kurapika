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
const dbPath = path.join(__dirname, 'feedback_db.json');

// Initialize the database file if it doesn't exist
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ feedback: [] }));
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to submit feedback
app.post('/api/feedback', (req, res) => {
  try {
    const data = fs.readFileSync(dbPath);
    const db = JSON.parse(data);
    
    // Add timestamp to the submission
    const feedbackData = {
      ...req.body,
      timestamp: new Date().toISOString()
    };
    
    db.feedback.push(feedbackData);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    
    res.status(200).json({ success: true, message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ success: false, message: 'Error saving feedback' });
  }
});

// API endpoint to get all feedback (admin dashboard)
app.get('/api/feedback', (req, res) => {
  try {
    const data = fs.readFileSync(dbPath);
    const db = JSON.parse(data);
    res.status(200).json(db.feedback);
  } catch (error) {
    console.error('Error retrieving feedback:', error);
    res.status(500).json({ success: false, message: 'Error retrieving feedback' });
  }
});

// Admin dashboard route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
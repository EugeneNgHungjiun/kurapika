const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { kv } = require('@vercel/kv'); // Add Vercel KV import

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API endpoint to submit feedback
app.post('/api/feedback', async (req, res) => {
  try {
    let feedback = (await kv.get('feedback')) || [];
    const feedbackData = {
      id: Date.now(), // Add unique ID
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

// API endpoint to get all feedback
app.get('/api/feedback', async (req, res) => {
  try {
    const feedback = (await kv.get('feedback')) || [];
    res.status(200).json(feedback);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving feedback' });
  }
});

// API endpoint to update feedback
app.put('/api/feedback/:id', async (req, res) => {
  try {
    let feedback = (await kv.get('feedback')) || [];
    const id = parseInt(req.params.id);
    const index = feedback.findIndex(item => item.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }
    feedback[index] = { ...feedback[index], ...req.body };
    await kv.set('feedback', feedback);
    res.status(200).json({ success: true, message: 'Feedback updated' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error updating feedback' });
  }
});

// API endpoint to delete feedback
app.delete('/api/feedback/:id', async (req, res) => {
  try {
    let feedback = (await kv.get('feedback')) || [];
    const id = parseInt(req.params.id);
    const updatedFeedback = feedback.filter(item => item.id !== id);
    if (updatedFeedback.length === feedback.length) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }
    await kv.set('feedback', updatedFeedback);
    res.status(200).json({ success: true, message: 'Feedback deleted' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error deleting feedback' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises; // Use promises for async file operations

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Path to JSON file for feedback storage
const FEEDBACK_FILE = path.join(__dirname, 'feedback.json');

// Helper function to read feedback from file
async function readFeedback() {
    try {
        const data = await fs.readFile(FEEDBACK_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') return []; // File doesn’t exist yet
        throw error;
    }
}

// Helper function to write feedback to file
async function writeFeedback(feedback) {
    await fs.writeFile(FEEDBACK_FILE, JSON.stringify(feedback, null, 2), 'utf8');
}

// Routes
// Serve index.html at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve admin.html at /admin.html
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API endpoint to submit feedback
app.post('/api/feedback', async (req, res) => {
    try {
        let feedback = await readFeedback();
        const feedbackData = {
            id: feedback.length + 1, // Simple incremental ID
            ...req.body,
            timestamp: new Date().toISOString()
        };
        feedback.push(feedbackData);
        await writeFeedback(feedback);
        res.status(200).json({ success: true, message: 'Feedback submitted' });
    } catch (error) {
        console.error('Error saving feedback:', error);
        res.status(500).json({ success: false, message: 'Error saving feedback' });
    }
});

// API endpoint to get all feedback (admin dashboard)
app.get('/api/feedback', async (req, res) => {
    try {
        const feedback = await readFeedback();
        res.status(200).json(feedback);
    } catch (error) {
        console.error('Error retrieving feedback:', error);
        res.status(500).json({ success: false, message: 'Error retrieving feedback' });
    }
});

// API endpoint to update feedback
app.put('/api/feedback/:id', async (req, res) => {
    try {
        let feedback = await readFeedback();
        const id = parseInt(req.params.id);
        const index = feedback.findIndex(item => item.id === id);

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }

        feedback[index] = {
            ...feedback[index],
            ...req.body,
            timestamp: feedback[index].timestamp // Preserve original timestamp
        };
        await writeFeedback(feedback);
        res.status(200).json({ success: true, message: 'Feedback updated' });
    } catch (error) {
        console.error('Error updating feedback:', error);
        res.status(500).json({ success: false, message: 'Error updating feedback' });
    }
});

// API endpoint to delete feedback
app.delete('/api/feedback/:id', async (req, res) => {
    try {
        let feedback = await readFeedback();
        const id = parseInt(req.params.id);
        const updatedFeedback = feedback.filter(item => item.id !== id);

        if (feedback.length === updatedFeedback.length) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }

        await writeFeedback(updatedFeedback);
        res.status(200).json({ success: true, message: 'Feedback deleted' });
    } catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({ success: false, message: 'Error deleting feedback' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
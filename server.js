require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini API
// Make sure to set GEMINI_API_KEY in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY');

app.post('/generate-sentence', async (req, res) => {
    try {
        const { words } = req.body;

        if (!words) {
            return res.status(400).json({ error: 'Words are required' });
        }

        // Initialize the model
        // Changed to 'gemini-pro' because your API key/region is throwing a 404 on the 1.5-flash model
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // The Gemini prompt logic
        const prompt = `Convert the following words into a meaningful, grammatically correct English sentence. Keep it simple and natural. Words: ${words}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        res.json({
            sentence: responseText
        });
    } catch (error) {
        console.error('Error with Gemini API:', error);
        res.status(500).json({ error: 'Failed to generate sentence' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

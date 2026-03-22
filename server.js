require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Groq } = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Groq API
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'YOUR_GROQ_API_KEY' });

app.post('/generate-sentence', async (req, res) => {
    try {
        const { words } = req.body;

        if (!words) {
            return res.status(400).json({ error: 'Words are required' });
        }

        const prompt = `Take the exact words provided and form a simple present-tense sentence. Only add minimal conjunctions (and, but, or) and articles (a, an, the) to connect them so they read like a normal sentence. Do not change the original words or output anything else. Words: ${words}`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
        });

        const responseText = chatCompletion.choices[0]?.message?.content || "";

        res.json({
            sentence: responseText.trim()
        });
    } catch (error) {
        console.error('Error with Groq API:', error);
        res.status(500).json({ error: 'Failed to generate sentence' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

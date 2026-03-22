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

        const prompt = `You are a strict text formatter. Form a readable string by ONLY inserting "is", "am", "are", "a", "an", or "the" strictly between the provided words. DO NOT add words to the beginning of the sentence. DO NOT change the original words or tense.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: 'Words: TODAY I SAD' },
                { role: 'assistant', content: 'Today I am sad' },
                { role: 'user', content: 'Words: HELLO I RICH' },
                { role: 'assistant', content: 'Hello I am rich' },
                { role: 'user', content: `Words: ${words}` }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.1,
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

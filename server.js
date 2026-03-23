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
        const { words, language } = req.body;
        const targetLanguage = language || 'English';

        if (!words) {
            return res.status(400).json({ error: 'Words are required' });
        }

        let prompt;
        let messages = [];

        if (targetLanguage.toLowerCase() === 'english') {
            prompt = `You are a strict text formatter. Form a readable string by ONLY inserting "is", "am", "are", "a", "an", or "the" strictly between the provided words. DO NOT add words to the beginning of the sentence. DO NOT change the original words or tense.`;
            messages = [
                { role: 'system', content: prompt },
                { role: 'user', content: 'Words: TODAY I SAD' },
                { role: 'assistant', content: 'Today I am sad' },
                { role: 'user', content: 'Words: HELLO I RICH' },
                { role: 'assistant', content: 'Hello I am rich' },
                { role: 'user', content: `Words: ${words}` }
            ];
        } else {
            prompt = `You are a strict text formatter and translator. Form a readable English string by ONLY inserting "is", "am", "are", "a", "an", or "the" strictly between the provided words. Then, accurately translate that formed sentence into ${targetLanguage}. 
Return ONLY the translated sentence in ${targetLanguage}. Do NOT return the English version. Do NOT return any explanations or additional text.`;
            messages = [
                { role: 'system', content: prompt },
                { role: 'user', content: `Words: ${words}` }
            ];
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: 'llama-3.1-8b-instant',
            temperature: 0.1,
        });

        let responseText = chatCompletion.choices[0]?.message?.content || "";
        
        // FIX: The Llama 3 model stubbornly tries to start sentences with "The" even when explicitly told not to.
        // We will forcefully remove "The " from the beginning of the string using JavaScript.
        if (targetLanguage.toLowerCase() === 'english') {
            responseText = responseText.trim().replace(/^the\s+/i, '');
        } else {
            responseText = responseText.trim();
        }
        
        // Ensure the first letter is capitalized so it still looks like a proper sentence!
        if (responseText.length > 0) {
            responseText = responseText.charAt(0).toUpperCase() + responseText.slice(1);
        }

        res.json({
            sentence: responseText
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

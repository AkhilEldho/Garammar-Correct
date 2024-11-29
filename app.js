import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';


const app = express();
const port = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

//MAIN LOGIC ROUTE
//ENDPOINT https://api.openai.com/v1/chat/completions
app.post('/correct', async (req, res) => {
    const { text } = req.body.text.trim();
    if(!text) {
        res.render("index",{
            error: 'No input found',
            inputText: text
        });
    }
    try{
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'GPT-3.5 Turbo',
                messages: [
                    {
                        role: 'system',
                        content: "Hello, I am an AI language model. I will correct grammar, punctuation, and spelling errors in the text that you provide to me."
                    },
                    {
                        role: "user",
                        content: "Correct the following text: ${text}"
                    }
                ],
                max_tokens: 100,
                n:1,
                stop: null,
                temperature: 1
            })
        });
        if(!response.ok) {
            res.render("index",{
                error: 'Something went wrong',
                inputText: text
            })
        }
        const data = await response.json();
        const correctedText = data.choices[0].message.content;
        res.render("index",{
            error: null,
            inputText: text,
            correctedText: correctedText
        });
    }
    catch (error) {
        console.error(error);
        res.render("index",{
            error: 'Something went wrong',
            inputText: text
        });
    }
});

//start server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
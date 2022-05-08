import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

dotenv.config();

//add teh middleware for socket.io
app.use(express.json())
app.use(cors());


app.get('/', (req, res) => {
    //test firebase with a test write
    res.send("hello world");
})
app.get("/api/words", (req, res) => {
    //grab 10 random words from the wordslist
    const count = req.query.count || 10;
    const wordlist = []
    for (let i = 0; i < count; i++) {
        wordlist.push(words[Math.floor(Math.random() * words.length)])
    }
    res.json(wordlist)
})
//a route to see if the word is valid or not
app.get("/api/valid", async (req, res) => {
    const word = `${req.query.word}`.toLowerCase();
    const valid = validGuesses.includes(word);
    res.status(200).json({
        isValid: valid
    })
})
app.listen(PORT, () => {
    console.log(`listening on port http://localhost:${PORT}`);
})
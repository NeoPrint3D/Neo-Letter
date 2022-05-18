
import { createRequire } from "module";
import cors from "cors";
import compression from "compression";
import fastifyServer from "fastify";
import middie from "middie";
import "dotenv/config.js"
const require = createRequire(import.meta.url);
const wordList = require("./static/words.json");
const validList = require("./static/validGuesses.json");




const app = fastifyServer()
const PORT = process.env.PORT || 4000;

//add teh middleware for socket.io
await app.register(middie);
app.use(cors({
  origin: ["http://localhost:3000", "https://neo-letter.web.app"],
}));
app.use(compression());

app.get("/", async (req, res) => {
  res.send({ hello: "world" })
});
app.get("/api/words", async (req, res) => {
  const count = req.query.count || 10;
  const wordlist = []
  for (let i = 0; i < count; i++) {
    wordlist.push(wordList.words[Math.floor(Math.random() * wordList.words.length)])
  }
  res.send({ words: wordlist })
})
//a route to see if the word is valid or not
app.get("/api/valid", async (req, res) => {
  if (req.query.word.length !== 5) {
    res.status(400).send({ isValid: false })
    return
  }
  const valid = validList.words.includes(`${req.query.word}`.toLowerCase());
  res.status(200).send({ isValid: valid })
});

app.delete("/api/rooms", async (req, res) => {
  try {
    const deleteStack = []
    const api_key = req.headers.authorization
    if (api_key !== process.env.DELETE_KEY) {
      res.status(401).send({ message: "Unauthorized" })
    }
    const ids = (await db.collection("rooms").get()).docs.map(doc => doc.id)
    ids.map(id => {
      deleteStack.push(db.collection("rooms").doc(id).delete())
    })
    await Promise.all(deleteStack)
    res.status(202).json({ message: "deleted" })
  }
  catch (error) {
    res.status(500).json({ error })
  }
})


const startServer = async () => {
  try {
    console.log("Fastify server listening at http://localhost:4000");
    await app.listen(PORT)
  }
  catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
startServer()


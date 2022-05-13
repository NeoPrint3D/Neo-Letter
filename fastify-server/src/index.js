
import { createRequire } from "module";
import cors from "cors";
import compression from "compression";
import fastifyServer from "fastify";
import middie from "middie";
const require = createRequire(import.meta.url);
const wordList = require("./static/words.json");
const validList = require("./static/validGuesses.json");



const fastify = fastifyServer()
const PORT = process.env.PORT || 4000;

//add teh middleware for socket.io
await fastify.register(middie);
fastify.use(cors({
  origin: ["http://localhost:3000", "https://neo-letter.web.app"],
}));
fastify.use(compression());

fastify.get("/", async (req, res) => {
  return { hello: "world" }
});
fastify.get("/api/words", async (req, res) => {
  const count = req.query.count || 10;
  const wordlist = []
  for (let i = 0; i < count; i++) {
    wordlist.push(wordList.words[Math.floor(Math.random() * wordList.words.length)])
  }
  return { words: wordlist }
})
//a route to see if the word is valid or not
fastify.get("/api/valid", async (req, res) => {
  if (req.query.word.length !== 5) {
    res.status(400).send({ isValid: false })
    return
  }
  const valid = validList.words.includes(`${req.query.word}`.toLowerCase());
  res.send({ isValid: valid })
});

const startServer = async () => {
  try {
    console.log("Express server listening at http://localhost:4000");
    await fastify.listen(PORT)
  }
  catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
startServer()


import cors from "cors";
import compression from "compression";
import words from "./static/wordlist.js";
import validGuesses from "./static/validGuesses.js";
import fastifyServer from "fastify";
import middie from "middie";


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
  const count = req.query.count || 20;
  const wordlist = [];
  //turn this for statement into a one liner
  for (let i = 0; i < count; i++) {
    wordlist.push(words[Math.floor(Math.random() * words.length)]);
  }
  return { words: wordlist }
});
//a route to see if the word is valid or not
fastify.get("/api/valid", async (req, res) => {
  const status = Promise.resolve((resolve) => {
    const valid = validGuesses.includes(`${req.query.word}`.toLowerCase());
    return resolve({ valid });
  })
  return { isValid: await status }
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


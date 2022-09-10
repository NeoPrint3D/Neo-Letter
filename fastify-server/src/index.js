
import { createRequire } from "module";
import cors from "cors";
import compression from "compression";
import fastifyServer from "fastify";
import middie from "middie";
import "dotenv/config.js"
import { db } from "./utils/firebase.js"
const require = createRequire(import.meta.url);
const wordList = require("./static/words.json");
const validList = require("./static/validGuesses.json");


const app = fastifyServer()
const PORT = process.env.PORT || 4000;
console.log(process.env.NODE_ENV)

//add teh middleware for socket.io
await app.register(middie);
const allOrginsNumbers = process.env.NODE_ENV.trim() === "production" ? [] : Array.from({ length: 10000 }, (_, i) => `http://localhost:${i + 1}`);
app.use(cors({
  origin: [
    ...allOrginsNumbers,
    "https://neo-letter.web.app"],
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
  res.status(200).send({ words: wordlist })
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
  console.log("deleting room")
  const ids = (await db.collection("rooms").get()).docs.map((doc) => doc.data().id)
  if (ids.length > 0) {
    ids.map(async (id) => {
      console.log(id)

      await db.collection("rooms").doc(id).collection("players").get().then(async (snapshot) => {
        snapshot.docs.map(async (doc) => {
          await doc.ref.delete()
        })
      })
      await db.collection("rooms").doc(id).delete()
    })
    res.status(202).send({ message: "deleted rooms" })
  } else {
    res.status(404).send({ message: "no rooms to delete" })
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


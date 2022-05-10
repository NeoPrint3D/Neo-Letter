import { db, admin } from './utils/firebase.js';
import { Server } from 'socket.io';
import dotenv from "dotenv";
import http from 'http';
import parser from 'socket.io-msgpack-parser';
if (process.env.NODE_ENV === 'production') {
    console.log = () => { };
}
dotenv.config();
const requestHandler = (req, res) => {
    res.writeHead(200);
    res.end("Hello World");
}
const server = http.createServer(requestHandler);
const PORT = process.env.PORT || 8080;
const io = new Server(server, {
    parser,
    cors: {
        origin: ['http://localhost:3000', "https://neo-letter.web.app"]
    }
})

//set the max socket connections to max
io.setMaxListeners(0);

io.use((socket, next) => {
    const token = socket.handshake.auth.token.split(':')
    if (token[0] && token[1] && token[2]) {
        next();
    } else {
        next(new Error('Authentication error'));
        socket.disconnect(true);
    }
})
io.on('connection', (socket) => {
    try {
        const [name, uid, roomId] = `${socket.handshake.auth.token}`.split(":");
        socket.on('join', async () => {
            console.log(`${name} joined ${roomId}`);
            await db.collection("rooms").doc(roomId).collection("players").doc(uid).update({
                socketId: socket.id
            }).catch(() => console.log("error"));
            //see if the user has a socekt id
            const hasAlreadyJoined = (await db.collection("rooms").doc(roomId).collection("players").doc(uid).get()).data().socketId;
            if (!hasAlreadyJoined) {
                socket.broadcast.to(roomId).emit('notify', {
                    message: `${name} has joined the room`
                })
            }
            socket.join(roomId);
        })
        socket.on("guess", async (data) => {
            console.log("guess")
            const { statuses, guessLength } = data;
            console.log(statuses, guessLength)
            let emojiString = ""

            statuses.forEach(status => {
                switch (status) {
                    case "correct":
                        emojiString += "🟩"
                        break;
                    case "present":
                        emojiString += "🟨 "
                        break;
                    case "absent":
                        emojiString += "⬛"
                        break;
                    default:
                        return
                }
            })
            //see if all the statuses are correct
            console.log(emojiString, name)


            const allCorrect = statuses.every(status => status === "correct");
            if (allCorrect) {
                await db.collection("rooms").doc(roomId).collection("players").doc(uid).update({
                    points: admin.firestore.FieldValue.increment(1000 - guessLength * 100)
                })
                socket.broadcast.to(roomId).emit('notify', {
                    message: `${name} guessed ${emojiString}`,
                })
                socket.broadcast.to(roomId).emit("reset");
                socket.emit("reset");
            } else {
                socket.broadcast.to(roomId).emit('notify', {
                    message: `${name} guessed ${emojiString}`,
                })
            }

        })


        //disconnection

        socket.on("disconnect", async () => {
            console.log("disconnected")
            socket.broadcast.to(roomId).emit('notify', {
                message: `${name} has left the room`
            })

            await db.collection("rooms").doc(roomId).collection("players").doc(uid).update({
                prevSocketId: socket.id
            }).catch(() => console.log("error"))

            await new Promise(resolve => setTimeout(resolve, 3 * 60 * 1000));

            const player = (await db.collection("rooms").doc(roomId).collection("players").doc(uid).get()).data();

            console.log(player?.socketId === player?.prevSocketId)
            if (player.socketId !== player.prevSocketId) {
                console.log("not deleted")
                return
            }
            console.log("deleted")
            //delete player from room or if he player is the creator, delete the room
            if (player.role !== "creator") {
                db.collection("rooms").doc(roomId).collection("players").doc(uid).delete().catch(() => console.log("error"))
                return
            }
            await db.collection("rooms").doc(roomId).collection("players").get().then(async (players) => {
                await Promise.all(players.docs.map(async (player) => {
                    await player.ref.delete();
                }))
            })
            db.collection("rooms").doc(roomId).delete().catch(() => console.log("error"));
        })
    } catch (error) {
        socket.disconnect();
    }
});

server.listen(PORT, () => {
    console.log(`Socket is listening on port http://localhost:${PORT}`);
});
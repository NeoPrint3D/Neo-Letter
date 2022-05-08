import { db, admin } from './utils/firebase.js';
import { Server } from 'socket.io';
import dotenv from "dotenv";
import http from 'http';
dotenv.config();

function requestHandler(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200)
    res.end("hello world");
}

const server = http.createServer(requestHandler);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', "https://neo-letter.web.app"]
    }
})
const PORT = process.env.PORT || 8080;

//set middleware if the user doesnt have uid roomID or gameID then throw a 404
io.use((socket, next) => {
    if (socket.handshake.query.uid && socket.handshake.query.roomID && socket.handshake.query.gameID) {
        next();
    } else {
        next(new Error('Authentication error'));
    }
})
io.on('connection', async (socket) => {
    try {
        const [name, uid, roomId] = `${socket.handshake.auth.token}`.split(":");
        socket.on('join', async () => {
            console.log(`${name} joined ${roomId}`);
            await db.collection("rooms").doc(roomId).collection("players").doc(uid).update({
                socketId: socket.id
            }).catch(err => {
                console.log(err);
            })
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
            const { statuses, round } = data;
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
            const allCorrect = statuses.every(status => status === "correct");
            if (allCorrect) {
                await Promise.all([
                    db.collection("rooms").doc(roomId).collection("players").doc(uid).update({
                        points: admin.firestore.FieldValue.increment(1000)
                    })
                ])
            }
            socket.broadcast.to(roomId).emit('notify', {
                message: `${name} guessed ${emojiString}`,
                type: allCorrect ? "success" : "error"
            })
        })

        socket.on("disconnect", async () => {
            console.log("disconnected")
            socket.broadcast.to(roomId).emit('notify', {
                message: `${name} has left the room`
            })

            await db.collection("rooms").doc(roomId).collection("players").doc(uid).update({
                prevSocketId: socket.id
            })

            await new Promise(resolve => setTimeout(resolve, 5000));

            const player = (await db.collection("rooms").doc(roomId).collection("players").doc(uid).get()).data();

            console.log(player.socketId === player.prevSocketId)
            if (player.socketId !== player.prevSocketId) {
                console.log("not deleted")
                return
            }
            console.log("deleted")
            //delete player from room or if he player is the creator, delete the room
            if (player.role !== "creator") {
                db.collection("rooms").doc(roomId).collection("players").doc(uid).delete();
                return
            }
            // await db.collection("rooms").doc(roomId).collection("players").get().then(async (players) => {
            //     await Promise.all(players.docs.map(async (player) => {
            //         await player.ref.delete();
            //     }))
            // })
            // await db.collection("rooms").doc(roomId).delete();
        })
    } catch (error) {
        socket.disconnect();
    }
});

//create a route and send hi


server.listen(PORT, () => {
    console.log(`Server is listening on port http://localhost:${PORT}`);
});
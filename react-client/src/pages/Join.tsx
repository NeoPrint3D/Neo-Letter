import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { AnimatePresence, LayoutGroup, m } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLocation } from "react-use";
import { UserContext, UidContext } from "../context/AuthContext";
import { analytics, firestore } from "../utils/firebase";
import Loader from "../components/Loader";
import { logEvent } from "firebase/analytics";


interface Message {
  text: string
  status: "success" | "error"
}
export default function JoinRoom() {
  const [loading, setLoading] = useState(false);
  const [username, setUserame] = useState("");
  const [roomId, setRoomId] = useState("");
  const [id, setId] = useState("");
  const [roomValid, setValidRoom] = useState(false);
  const navigate = useNavigate();
  const user = useContext(UserContext);
  const uid = useContext(UidContext);
  const location = useLocation();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await checkValidRoom(roomId);
  }

  async function checkValidRoom(roomId: string) {
    const room = (await getRoom(roomId)) as Room;
    if (!room) {
      toast.error("Room does not exist", { theme: "dark" });
      return false;
    }

    if (room.started && !room.allowPlayersAfterStart) {
      toast.error("Room already started", { theme: "dark" });
      return false;
    }

    if (room.players.length >= room.maxPlayers && !room.players.includes(uid)) {
      toast.error("Room is full", { theme: "dark" });
      return false;
    }
    setValidRoom(true);
  }

  async function getRoom(id: string) {
    const room = await getDoc(doc(firestore, "rooms", id));
    return room.data();
  }

  async function joinRoom(e: React.FormEvent<HTMLFormElement>) {
    console.log(id);
    e.preventDefault();
    if (!(username.length >= 3)) {
      toast.error("Username is too short. Must be three or more charaters", {
        theme: "dark",
      });
      return;
    }


    const res = await fetch(
      import.meta.env.DEV
        ? `http://localhost:4000/api/profane?username=${username}`
        : `https://neo-letter-fastify.vercel.app/api/profane?username=${username}`).then((res) => res.json())
    const isProfane = res.isProfane
    if (isProfane) {
      toast.error("Inapproopriate name", { theme: "dark" });
      logEvent(analytics, "profane_words", {
        word: username,
        uid,
        date: new Date().getTime()
      })
      return
    }


    const playerRef = doc(firestore, "rooms", id || roomId, "players", uid);
    const player = await getDoc(playerRef);
    setLoading(true);
    if (player.exists()) {
      await updateDoc(playerRef, {
        name: username.charAt(0).toUpperCase() + username.slice(1),
      });
      setLoading(false);
      navigate(`/room/${roomId}`);
      return;
    }

    const playerData: GamePlayer = {
      name: username.charAt(0).toUpperCase() + username.slice(1),
      uid,
      points: 0,
      ready: false,
      signedIn: user?.uid === uid,
      guesses: [],
      guessed: false,
      role: "user",
      wins: user?.wins || 0,
      gamesPlayed: user?.gamesPlayed || 0,
      totalPoints: user?.totalPoints || 0,
    };

    await Promise.all([
      setDoc(playerRef, playerData),
      updateDoc(doc(firestore, "rooms", id || roomId), {
        players: arrayUnion(uid),
      }),
    ]);
    setLoading(false);
    navigate(`/room/${roomId}`);
  }

  useEffect(() => {
    const idRef = new URLSearchParams(location.search).get("id");
    if (idRef) {
      setId(idRef);
      setRoomId(idRef);
      checkValidRoom(idRef);
    }
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Helmet>
        <title>Neo Letter | Join</title>
        <meta property="og:url" content="https://neo-letter.web.app/join" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Join Room" />
        <meta
          property="og:description"
          content="Your friend has invited you to join a room. Join now!"
        />
        <meta property="og:image" content="/images/previews/Join.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="neo-letter.web.app" />
        <meta
          property="twitter:url"
          content="https://neo-letter.web.app/join"
        />
        <meta name="twitter:title" content="Join Room" />
        <meta
          name="twitter:description"
          content="Your friend has invited you to join a room. Join now!"
        />
        <meta
          name="twitter:image"
          content="https://neo-letter.web.app/images/previews/Join.png"
        />
      </Helmet>
      <div className="flex justify-center items-center h-screen">
        {!roomValid && (
          <m.div
            className="flex flex-col items-center w-full max-w-[23.5rem] sm:max-w-xl  main-container px-5 py-10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <div className="flex justify-center mb-10 font-logo">
              <h1 className="text-4xl sm:text-4xl">Join room</h1>
            </div>
            <form
              className="flex flex-col items-center gap-5"
              onSubmit={handleSubmit}
            >
              <input
                className="p-2 shadow-input text-center rounded-xl font-semibold bg-transparent placeholder:font-semibold focus:outline-none"
                type="text"
                placeholder="Room ID"
                value={roomId}
                onChange={(e) =>
                  setRoomId(e.target.value.replace(/[^0-9]/g, "").slice(0, 5))
                }
              />
              <button
                type="submit"
                disabled={!roomId}
                className="transition-all flex items-center py-3 px-5 text-xl font-logo bg-primary disabled:bg-primary/10 hover:bg-red-400 active:bg-red-600 rounded-xl active:scale-95"
              >
                <p className="text-white">Continue</p>
              </button>
            </form>
            <div className="text-lg my-0.5">or</div>
            <Link to="/create">
              <p className="link link-secondary text-xl transition-all duration-300">
                Create Room
              </p>
            </Link>
          </m.div>
        )}
        {roomValid && (
          <LayoutGroup>
            <m.div
              className="w-full max-w-[23.5rem] sm:max-w-xl  main-container px-5 py-10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              layout
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            >
              <div className="flex justify-center mb-7 font-logo">
                <h1 className="text-4xl">Enter</h1>
              </div>
              <m.form
                className="flex flex-col items-center gap-5"
                onSubmit={(e) => joinRoom(e)}
              >
                <input
                  className="p-3 shadow-input rounded-xl text-center font-semibold  bg-transparent placeholder:font-semibold focus:outline-none"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) =>
                    setUserame(
                      e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20)
                    )
                  }
                />
                <AnimatePresence>
                  {user?.uid && username !== user.username && (
                    <m.button
                      onClick={(e) => {
                        e.preventDefault();
                        setUserame(user?.username);
                      }}
                      type="button"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <h1 className="link link-secondary transition-all duration-300">
                        Use <a className="font-black ">{user?.username}</a>{" "}
                        instead?
                      </h1>
                    </m.button>
                  )}
                </AnimatePresence>
                <button
                  disabled={!username || username.length < 3}
                  className="transition-all flex items-center py-3 px-5 text-xl font-logo bg-primary disabled:bg-primary/10 hover:bg-red-400 active:bg-red-600 rounded-xl active:scale-95"
                >
                  <p className="text-white">Join Room</p>
                </button>
              </m.form>
            </m.div>
          </LayoutGroup>
        )}
      </div>
    </>
  );
}

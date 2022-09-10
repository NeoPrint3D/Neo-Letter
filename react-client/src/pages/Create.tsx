
import { doc, getDoc, increment, setDoc, updateDoc } from 'firebase/firestore';
import { FormEvent, useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
//import io
import { analytics, firestore } from '../utils/firebase';;
import { UserContext, UidContext } from '../context/AuthContext';
import Loader from '../components/Loader';
import { AnimatePresence, LayoutGroup, m } from 'framer-motion';
import { IoIosAddCircleOutline, IoIosArrowBack } from 'react-icons/io';
import { BiCustomize } from 'react-icons/bi';
import { toast } from 'react-toastify';
import Tooltip from '../components/Tooltip';
import { v4 } from 'uuid';
import { logEvent } from 'firebase/analytics';

interface CustomWord {
  id: number,
  word: string
}


export default function CreateRoom() {
  const [loading, setLoading] = useState(false)
  const [customMaxPlayers, setCustomMaxPlayers] = useState<number | string>(20)
  const [maxPlayers, setMaxPlayers] = useState("party");
  const [roomType, setRoomType] = useState("private");
  const [allowJoinAfterStart, setAllowJoinAfterStart] = useState(true);
  const [wordCount, setWordCount] = useState<number | string>(5);
  const [customWords, setCustomWords] = useState<CustomWord[]>([])
  const [customWord, setCustomWord] = useState("")
  const [moreOptions, setMoreOptions] = useState(false)
  const [switchUi, setSwitchUI] = useState(false)
  const [selectedId, setSelectedId] = useState(0)
  const navigate = useNavigate()
  const user = useContext(UserContext)
  const uid = useContext(UidContext);

  async function generateCleanId() {
    const id = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
    if (!(await getDoc(doc(firestore, "rooms", `${id}`))).exists()) return id
    generateCleanId()
  }

  function roomSelectToNumber(select: string) {
    switch (select) {
      case "solo": return 1;
      case "versus": return 2
      case "party": return 5
      case "mega-party": return 10
      default: return 1
    }
  }

  function addWords(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (customWord.length === 5) {
      setCustomWords([...customWords, { word: customWord, id: Math.floor(Math.random() * 10000) }])
    } else if (customWord.length > 0) {
      toast.warning("word must be 5 letters", { theme: "dark" })
    }
    setCustomWord("")
  }


  async function createroom() {
    if (moreOptions && customWords.length === 0) {
      toast.error("Please enter at least one word.", { theme: "dark" })
      return
    }
    setLoading(true)
    const res = await fetch(
      import.meta.env.DEV
        ? `http://localhost:4000/api/words?count=${wordCount}`
        : `https://neo-letter-fastify.vercel.app/api/words?count=${wordCount}`
    ).then((res) => res.json())
    const wordlist = res.words
    const id = await generateCleanId()
    const gamePlayerData: GamePlayer = {
      name: "",
      uid,
      points: 0,
      ready: false,
      signedIn: user?.uid === uid,
      role: "creator",
      guesses: [],
      guessed: false,
      wins: user?.wins || 0,
      gamesPlayed: user?.gamesPlayed || 0,
      totalPoints: user?.totalPoints || 0,
    }


    await Promise.all([
      setDoc(doc(firestore, "rooms", `${id}`), {
        id,
        maxPlayers: maxPlayers === "custom" ? customMaxPlayers : roomSelectToNumber(maxPlayers),
        started: false,
        roomType,
        answers: customWords.map((item) => item.word) || wordlist,
        players: [uid],
        round: 0,
        allowLateJoiners: allowJoinAfterStart
      }),
      setDoc(doc(firestore, "rooms", `${id}`, "players", uid), gamePlayerData),
    ])
    logEvent(analytics, "room_created", { uid: uid, date: new Date().getTime() })
    setLoading(false)
    navigate(`/join?id=${id}`)
  }





  return !loading ? (
    <>
      <Helmet>
        <title>Neo Letter | Create Room</title>
        <meta name="description" content="Create a room to play with your friends!" />
        <meta property="og:url" content="https://neo-letter.web.app/create" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Create Room | Neo Letter" />
        <meta property="og:description" content="Create a room to play with your friends!" />
        <meta property="og:image" content="/images/previews/Create.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="neo-letter.web.app" />
        <meta property="twitter:url" content="https://neo-letter.web.app/create" />
        <meta name="twitter:title" content="Create Room | Neo Letter" />
        <meta name="twitter:description" content="Create a room to play with your friends!" />
        <meta name="twitter:image" content="https://neo-letter.web.app/images/previews/Create.png" />
      </Helmet>
      <div className="flex justify-center items-center h-screen
       text-white">
        <AnimatePresence>
          {switchUi ? (
            <m.div
              className="flex   w-full max-w-sm sm:max-w-xl  main-container px-2 py-5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              layout
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            >

              <div className='flex absolute justify-start '>
                <button onClick={() => setSwitchUI(false)} className='p-2 rounded-full hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-300'>
                  <IoIosArrowBack size={35} />
                </button>
              </div>
              <div className='flex flex-col items-center w-full'>
                <h1 className="text-5xl font-logo mb-2">Custom Words</h1>
                <div className='flex gap-5 justify-center items-center mb-3 '>
                  <h1 className='text-3xl  fonts-semibold text-white/80'>Rounds:</h1>
                  <h2 className='text-2xl text-white/90'>{customWords.length}</h2>
                </div>
                <form className='flex gap-5' onSubmit={(e) => addWords(e)}>
                  <input placeholder='words' type="text" value={customWord} className='border-[3px] transition-colors  focus:border-primary rounded-xl p-3  bg-transparent focus:outline-none  placeholder:text-white/50 ' onChange={(e) => setCustomWord(e.target.value.slice(0, 5))} />
                  <button type='submit'>
                    <IoIosAddCircleOutline className='btn btn-primary btn-circle' size={35} />
                  </button>
                </form>

                <m.div className='grid grid-cols-4 w-[92.5%] border-[3px] border-primary/50 gap-3 mt-5 overflow-y-scroll scroll-lobby shadow-input h-36   rounded-xl  p-3 '>
                  <AnimatePresence>
                    {customWords.map(({ word, id }, index) => (
                      <div
                        key={index}
                        className='flex justify-center items-center'
                      >
                        <Tooltip tip='Delete'>
                          <m.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            onClick={() => setCustomWords([...customWords.filter((item) => item.id !== id)])}
                            className='bg-primary-dark hover:bg-primary-dark/70 transition-colors py-2 px-2 rounded-xl'>
                            <h1 className='text-lg font-semibold'>{index + 1}: {word.toUpperCase()}</h1>
                          </m.button>
                        </Tooltip>
                      </div>
                    ))}
                  </AnimatePresence>
                </m.div>
              </div>
            </m.div>
          ) : (
            <m.div
              className=" w-full max-w-sm sm:max-w-xl  main-container px-2 py-5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              layout
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}

            >

              <div className="flex justify-center mb-5 font-logo">
                <h1 className="text-5xl ">Create Room</h1>
              </div>
              <div className="flex flex-col gap-3 items-center">
                <select className=" bg-transparent focus:outline-none rounded-xl text-xl  shadow-input p-3 w-52" value={maxPlayers} onChange={(e) => { setMaxPlayers(e.target.value); }}>
                  <option className="bg-primary-dark text-sm text-bold" value="solo">Solo (Max 1)</option>
                  <option className='bg-primary-dark text-sm text-bold' value="versus">Versus (Max 2)</option>
                  <option className='bg-primary-dark text-sm text-bold' value="party">Party (Max 5)</option>
                  <option className='bg-primary-dark text-sm text-bold' value="mega-party">Mega Party (Max 10)</option>
                  <option className='bg-primary-dark text-sm text-bold' value="custom">Custom</option>
                </select>
                {maxPlayers === "custom" && (
                  <m.div
                    className='flex gap-3 justify-start items-center p-3 shadow-input rounded-xl w-52'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className='flex justify-start w-full'>
                      <label className='text-xl'>Players</label>
                    </div>
                    <div className='flex justify-end'>
                      <input name='num' type="number" className="text-center text-xl bg-transparent focus:outline-none p-1 shadow-input-inner rounded-xl w-12  " placeholder='20' value={customMaxPlayers} onChange={(e) => setCustomMaxPlayers(parseInt(e.target.value) <= 100 && parseInt(e.target.value) > 0 ? parseInt(e.target.value) : "")} />
                    </div>
                  </m.div>
                )}

                {!moreOptions ?
                  <div className='flex items-center p-3 shadow-input rounded-xl w-52'>
                    <div className='flex justify-start w-full'>
                      <label className='text-center text-xl'>
                        Rounds
                      </label>
                    </div>
                    <div className='flex justify-end'>
                      <input type="number"
                        placeholder='10'
                        className="text-center text-xl bg-transparent focus:outline-none p-1 shadow-sm shadow-primary rounded-xl w-12  "
                        value={wordCount}
                        onChange={(e) => {
                          setWordCount(parseInt(e.target.value) > 0 ? parseInt(e.target.value) : "");
                        }} />
                    </div>
                  </div> :
                  <button onClick={() => setSwitchUI(true)} className='gap-3  shadow-input text-xl flex p-3 rounded-3xl outline-dashed outline-primary/40 hover:bg-primary transition-colors'>
                    <BiCustomize size={25} /> Choose Custom Words
                  </button>
                }

                <div className='flex flex-col gap-3 mt-5'>
                  <div className='flex justify-center gap-3 items-center'>
                    <p className='text-xl '>Allow late joiners </p>
                    <div className='flex justify-end '>
                      <input className='checkbox checkbox-primary' type="checkbox" checked={allowJoinAfterStart} onChange={(e) => setAllowJoinAfterStart(e.target.checked)} />
                    </div>
                  </div>
                  <div className='flex justify-center gap-3 items-center'>
                    <p className='text-xl '>Custom Words</p>
                    <div className='flex justify-end '>
                      <input className='checkbox checkbox-primary' type="checkbox" checked={moreOptions} onChange={(e) => {
                        if (e.target.checked === false) setCustomWords([]); setCustomWord("")
                        setMoreOptions(e.target.checked)
                      }} />
                    </div>
                  </div>

                  <div className='flex justify-center items-center gap-3'>
                    <p className='text-xl '>Private</p>
                    <input className='checkbox checkbox-primary' type="checkbox" checked={roomType === "private"} onChange={(e) => setRoomType(e.target.checked ? "private" : "public")} />
                  </div>
                </div>



                <div className='flex flex-col items-center'>
                  <button
                    onClick={createroom}
                    className="transition-all flex items-center py-3 px-5 text-xl font-logo bg-primary hover:bg-red-400 active:bg-red-600 rounded-xl active:scale-95">
                    <p className="">
                      Create Party
                    </p>
                  </button>
                  <div className='text-lg my-0.5'>
                    or
                  </div>
                  <Link to="/join">
                    <p className='link link-secondary text-xl transition-all duration-300'>
                      Join Room
                    </p>
                  </Link>
                </div>

              </div>
            </m.div>
          )
          }
        </AnimatePresence >
      </div >
    </>
  ) : (
    <Loader />
  )

}

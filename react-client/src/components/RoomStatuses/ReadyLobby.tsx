import { doc, updateDoc } from "firebase/firestore";
import { AnimatePresence, LayoutGroup, m } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { BiArrowBack, BiLoader } from "react-icons/bi";
import { BsCheckLg } from "react-icons/bs";
import { FaCrown } from "react-icons/fa";
import { FiShare } from "react-icons/fi";
import { Link } from "react-router-dom";
import { RWebShare } from "react-web-share";
import { firestore } from "../../utils/firebase";
export default function ReadyLobby({ id, uid, players, }: { id: string, uid: string, players: Player[] }) {
  const [ready, setReady] = useState(false);
  const currentPlayer = useMemo(() => players.find(p => p.uid === uid), [players, uid]);

  useEffect(() => {
    updateDoc(doc(firestore, "rooms", id, "players", uid), { ready: ready });
  }, [ready]);

  return (
    <LayoutGroup>
      <div className="min-h-screen w-screen flex justify-center items-center">
        <m.div className="flex flex-col justify-center w-full max-w-sm  sm:max-w-xl px-5 main-container"
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1
          }}>
          <div className="grid grid-cols-8">
            <div className="mt-3">
              <Link to="/">
                <BiArrowBack size={30} className=" text-white" />
              </Link>
            </div>

            <div className="flex flex-col items-center mb-5 col-span-6">
              <h1 className="text-4xl font-logo">Ready Up</h1>
              <h2 className="mt-3 text-xl font-sans font-semibold">Room: {id}</h2>
            </div>
            <div>
              <div className="tooltip" data-tip={"Share?"}>
                <RWebShare
                  data={{
                    title: `Join room ${id}`,
                    text: `${currentPlayer?.name} sent you a request to join room ${id}`,
                    url: `${process.env.NODE_ENV === "development" ? `http://localhost:3000/join?id=${id}` : `https://neo-letter.web.app/join?id=${id}`}`,
                  }}>
                  <button className=" transition-all duration-300 flex justify-center  items-center rounded-full p-3 bg-primary text-white active:scale-90">
                    <FiShare size={25} />
                  </button>
                </RWebShare>
              </div>
            </div>
          </div>
          <div className="  overflow-y-scroll scroll-lobby shadow-input-inner h-56  rounded-xl p-5 ">
            <div className=" flex items-center -translate-x-3 h-56 absolute">
            </div>
            {players.map((player, i) =>
              <m.div key={player.uid}
                className="flex  shadow-input rounded-xl p-3 sm:p-5 items-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 50,
                  damping: 10,
                  delay: i * 0.25
                }}>
                <div className="flex justify-start items-center w-full ">
                  <p className="font-logo text-3xl">{player.name}</p>
                  {player.signedIn && (
                    <div className="flex  gap-3 ml-3">
                      <FaCrown aria-label="Crown" size={25} /> <span className="font-logo text-xl">{player.wins}</span>
                    </div>
                  )}
                </div>
                <AnimatePresence>
                  {player.ready ?
                    <m.div
                      initial={{ scale: 0, y: -20 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{
                        scale: {
                          type: "spring",
                          stiffness: 250,
                          damping: 10
                        },
                        y: {
                          type: "spring",
                          stiffness: 250,
                          damping: 10
                        },
                      }}>
                      <BsCheckLg className="text-green-500 text-4xl" />
                    </m.div> :
                    <BiLoader className="text-white text-4xl animate-spin ease-in" />
                  }
                </AnimatePresence>
              </m.div>
            )}
          </div>
          <div className="flex justify-center mt-5">
            <button className=" transition-transform duration-500 btn btn-success hover:scale-105 w-40  sm:w-80" onClick={() => setReady(!ready)}>
              Ready
            </button>
          </div>
        </m.div>
      </div>
    </LayoutGroup>
  )
}

import { addDoc, arrayUnion, collection, doc, getFirestore, serverTimestamp, updateDoc } from "firebase/firestore";
import { AnimatePresence, m, Variants } from "framer-motion";
import { FormEvent, useEffect, useRef, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { IoSend } from "react-icons/io5";
import { useParams } from "react-router-dom";
import { useWindowSize } from "react-use";
import { useUid } from "../../context/AuthContext";
import { useMessages } from "../../context/GameContext";
import useIntersection from "../../hooks/useIntersection";
import { app } from "../../utils/firebase";

export default function MessageUI({ players, room }: { players: GamePlayer[], room: Room }) {
    const firestore = getFirestore(app);
    const [messageSending, setMessageSending] = useState(false)
    const { id } = useParams()
    const uid = useUid()
    const currentPlayer = players.find(p => p.uid === uid)
    const { showMessages, setShowMessages, messages } = useMessages()
    const [userMessage, setUserMessage] = useState("")
    const { width } = useWindowSize()
    const buttonRef = useRef<HTMLButtonElement>(null)
    const lastOfMessagesRef = useRef<HTMLSpanElement>(null)
    const inView = useIntersection(lastOfMessagesRef)

    const userIsSender = (message: Message) => currentPlayer?.uid === message.messengerID
    const messageTime = (message: Message) => `${message?.createdAt?.toDate().toLocaleTimeString().split(":")[0]}:${message?.createdAt?.toDate().toLocaleTimeString().split(":")[1]} ${message?.createdAt?.toDate().toLocaleTimeString().split(" ")[1]}`



    useEffect(() => {
        lastOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, showMessages])

    useEffect(() => {
        console.log(messageSending)
    }, [messageSending])

    useEffect(() => {
        const main = async () => {
            if (!messages[messages.length - 1] || messages[messages.length - 1]?.readBy.includes(uid) || !inView) return
            try {
                await updateDoc(doc(firestore, "rooms", `${id}`, "messages", `${messages[messages.length - 1]?.id}`), { readBy: arrayUnion(uid) })
            } catch (err) {
                console.log("stop showing messages")
            }
        }
        main()
    }, [inView])

    async function sendMessage(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (userMessage === "") return
        const messageInfo: Message = {
            messengerID: uid,
            messengerUsername: currentPlayer?.name as string,
            content: room.allowProfanity ? userMessage : (await fetch(`https://www.purgomalum.com/service/json?text=${userMessage}`).then((res) => res.json())).result,
            createdAt: serverTimestamp() as Timestamp,
            reversedCreatedAt: -1 * (new Date().getTime()),
            readBy: [uid],
            id: ""
        }
        setUserMessage("")
        const docRef = await addDoc(collection(firestore, "rooms", `${id}`, "messages"), messageInfo)
        await updateDoc(doc(firestore, "rooms", `${id}`, "messages", docRef.id), { id: docRef.id })
        setMessageSending(true)
        await new Promise(res => setTimeout(res, 500))
        setMessageSending(false)
    }

    const sendVariants: Variants = {
        sending: {
            x: width - buttonRef.current?.offsetLeft! + 50,
            opacity: [1, 0],
            transition: {
                duration: .75
            }
        },
        rest: {
            x: [-50, 0],
            opacity: [0, 1],
            transition: {
                delay: 1
            }
        }
    }
    return (
        <AnimatePresence>
            {showMessages &&
                <m.div
                    className="flex flex-col itmes-center fixed backdrop-blur-lg bg-gray-500/20 z-[100]  h-screen w-screen  "
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="grid grid-cols-3  w-full h-20">
                        <div className="flex justify-start">
                            <button onClick={() => setShowMessages(false)} className=" ml-3 mt-3 p-2 rounded-full hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-300">
                                <IoIosArrowBack size={35} />
                            </button>
                        </div>
                        <div className="flex items-center text-4xl font-logo justify-center translate-y-2">
                            Messages
                        </div>
                    </div>
                    <m.div layout className="flex flex-col gap-3 mt-3 rounded-3xl mx-auto mb-5 h-full overflow-y-auto overflow-x-hidden scroll-lobby w-[95%] border border-white/20 shadow-input">
                        {messages.map((message) =>
                            <m.div
                                key={message.id}
                                className={`flex flex-col text-xl mx-3 first:mt-5
                                ${userIsSender(message) ? "items-end" : "justify-start"}`}
                                // initial={{ opacity: 0 }}
                                animate={{ x: messageSending && messages[messages.length - 1].id === message.id ? (userIsSender(message) ? [200, 0] : [-200, 0]) : 0 }}
                                transition={{
                                    x: {
                                        delay: 1
                                    }
                                }}
                            >
                                <div className={`flex flex-col w-full text-sm  text-ellipsis max-w-[90%]  ${userIsSender(message) ? "items-end" : "items-start"}`}>
                                    <div className={`font-logo text-lg ${userIsSender(message) ? "-translate-x-1.5" : " translate-x-1.5"}`}>
                                        {message.messengerUsername}
                                    </div>
                                    <div className={`bg-blue-500 py-1.5 text-lg px-3  text rounded-xl w-fit truncate max-w-[100%] text-ellipsis`}>
                                        {message.content}
                                    </div>
                                    <div className={`font-logo ${userIsSender(message) ? "-translate-x-1.5" : " translate-x-1.5"}`}>
                                        Sent At {`${message?.createdAt ? messageTime(message) : "loading..."}`}
                                    </div>
                                </div>
                            </m.div>
                        )}
                        <span className="mb-5" ref={lastOfMessagesRef}></span>
                    </m.div>
                    <div className="grid grid-cols-5 items-center justify-center h-28 sm:h-54 w-full border-t-4 sm:border-t-4 border-white/20">
                        <div />
                        <form onSubmit={(e) => sendMessage(e)} className="col-span-4 grid grid-cols-4">
                            <input placeholder="Type something" onChange={(e) => setUserMessage(e.target.value)} value={userMessage} type="text" className=" col-span-3 rounded-xl  input-focus focus:outline-none bg-primary-dark/50 backdrop-blur-3xl px-5 py-3 sm:py-4 sm:text-2xl" />
                            <div className="flex justify-center">
                                <button ref={buttonRef} type="submit" disabled={userMessage.length === 0} className="p-3 bg-primary disabled:bg-primary/40 disabled:active:scale-100 disabled:transition-none rounded-full transition-all duration-300 flex justify-center  items-center  text-white active:scale-90 ">
                                    <m.div
                                        initial={false}
                                        variants={sendVariants}
                                        animate={messageSending ? "sending" : "rest"}
                                    >
                                        <IoSend size={width > 640 ? 45 : 30} />
                                    </m.div>
                                </button>
                            </div>
                        </form>
                    </div>
                </m.div >
            }
        </AnimatePresence >
    )
}
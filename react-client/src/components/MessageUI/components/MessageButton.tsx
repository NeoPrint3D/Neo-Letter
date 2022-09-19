import { AnimatePresence, m } from "framer-motion";
import { BsFillChatFill } from "react-icons/bs";
import { useUid } from "../../../context/AuthContext";
import { useMessages } from "../../../context/GameContext";

export default function MessageButton() {
    const { allowMessages, setShowMessages, messages } = useMessages()
    const uid = useUid()
    return allowMessages ? (
        <div className={`tooltip tooltip-bottom indicator `} data-tip="Chat?" onClick={() => setShowMessages(true)}>
            <AnimatePresence>
                {messages.length > 0 && !(messages[messages.length - 1].readBy.includes(uid)) &&
                    <span className="indicator-item">
                        <m.div
                            className="badge badge-primary text-white font-semibold"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            }}
                        >
                            New
                        </m.div>
                    </span>
                }
            </AnimatePresence>
            <button className=" transition-all duration-300 flex justify-center  items-center rounded-full p-3 bg-blue-500 text-white active:scale-90">
                <BsFillChatFill size={25} />
            </button>
        </div>
    ) : <div />
}
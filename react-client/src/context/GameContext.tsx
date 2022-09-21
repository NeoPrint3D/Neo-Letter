import { createContext, memo, useContext, useState } from "react";




interface GuessesContext {
    guesses: string[]
    setGuesses: React.Dispatch<React.SetStateAction<string[]>>
}

interface KeyboardContext {
    key: string
    setKey: React.Dispatch<React.SetStateAction<string>>
}

interface MessagesContext {
    messages: Message[]
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>
    showMessages: boolean
    setShowMessages: React.Dispatch<React.SetStateAction<boolean>>
    allowMessages: boolean
    setAllowMessages: React.Dispatch<React.SetStateAction<boolean>>
}




const KeyboardContext = createContext<KeyboardContext>({ key: "", setKey: () => { } })
const GuessesContext = createContext<GuessesContext>({ guesses: [], setGuesses: () => { } })
const MessageContext = createContext<MessagesContext>({
    messages: [],
    setMessages: () => { },
    showMessages: false,
    setShowMessages: () => { },
    allowMessages: false,
    setAllowMessages: () => { },
})


export const useGuesses = () => useContext(GuessesContext)
export const useKeyboard = () => useContext(KeyboardContext)
export const useMessages = () => useContext(MessageContext)


export function GameContextProvider({ children }: { children: React.ReactNode }) {
    const [key, setKey] = useState("")
    const [guesses, setGuesses] = useState<string[]>([])
    const [showMessages, setShowMessages] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [allowMessages, setAllowMessages] = useState(false)

    //if the key has been pressed add it to the array

    return (
        <KeyboardContext.Provider value={{ key, setKey }}>
            <GuessesContext.Provider value={{ guesses, setGuesses }}>
                <MessageContext.Provider value={{ showMessages, setShowMessages, messages, setMessages, allowMessages, setAllowMessages }}>
                    {children}
                </MessageContext.Provider>
            </GuessesContext.Provider>
        </KeyboardContext.Provider>
    )
}



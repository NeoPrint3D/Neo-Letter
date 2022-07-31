import { createContext, useState } from "react";

export const KeyboardContext = createContext(undefined as any)
export const KeyBoardDispatchContext = createContext(undefined as any)

export const GuessesContext = createContext(undefined as any)
export const GuessesDispatchContext = createContext(undefined as any)

export function GameContextProvider({ children }: { children: React.ReactNode }) {
    const [key, setKey] = useState("")
    const [guesses, setGuesses] = useState<string[]>([])


    //if the key has been pressed add it to the array

    return (
        <KeyBoardDispatchContext.Provider value={setKey}>
            <KeyboardContext.Provider value={key}>
                <GuessesContext.Provider value={guesses}>
                    <GuessesDispatchContext.Provider value={setGuesses}>
                        {children}
                    </GuessesDispatchContext.Provider>
                </GuessesContext.Provider>
            </KeyboardContext.Provider>
        </KeyBoardDispatchContext.Provider>
    )
}


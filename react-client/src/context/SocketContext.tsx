import { createContext } from "react";
import { io } from "socket.io-client"
//import the io type from socket.io
import { Socket } from "socket.io-client";
import { useLocation } from "react-router-dom";

export const SocketContext = createContext(undefined as Socket | undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const location = useLocation()
    let socket

    if (location.pathname.includes("room")) {
        socket = io(process.env.NODE_ENV === "development" ? "http://localhost:8080" : "https://Neo-Letter.neoprint777.repl.co")
    }
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}
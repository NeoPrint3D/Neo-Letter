import RoomLobby from '../RoomStatuses/RoomLobby';
import { useParams } from "react-router-dom";
import Loader from "../Loader";
import { useWindowSize } from "react-use";
import { UidContext } from "../../context/AuthContext";
import { useContext, useMemo } from "react";
import { doc } from "firebase/firestore";
import { firestore } from "../../utils/firebase";
import RoomErrorScreen from '../RoomStatuses/RoomErrorScreen';
import RoomWin from '../RoomStatuses/RoomWin';

interface RoomProps {
    children: any,
    roomStatus: RoomStatuses,
    //define winner with two attributes: winner and winnerPoints
    winner: {
        name: string,
        points: number,
        uid: string
    },
    players: GamePlayer[]
}

export default function RoomStatusHandler({ children, roomStatus, winner, players }: RoomProps) {
    const { id } = useParams()
    const uid = useContext(UidContext)




    switch (roomStatus) {
        case "room_not_found":
            return (
                <RoomErrorScreen
                    description="Room not found"
                    title="Room not found"
                />
            )
        case "user_not_found":
            return (
                <RoomErrorScreen
                    description="You are not part of this room"
                    title="User not found"
                />
            );
        case "room_full":
            return (
                <RoomErrorScreen
                    title="Room full"
                    description="The room you are looking for is full"
                />
            );
        case "room_started":
            return (
                <RoomErrorScreen
                    title="Room started"
                    description="The room you are looking for has already started"
                />
            );
        case "players_not_ready":
            return (
                <RoomLobby id={id || ""} uid={uid} players={players} />
            )
        case "room_finished":
            return (
                <RoomWin winner={winner} />
            )
        case "exists":
            return children;
        default:
            return <Loader />

    }
}
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Loading } from "../Loader/Loading";

export default function CheckRoomExist({ children, roomStatus }: { children: any, roomStatus: "exists" | "room_not_found" | "user_not_found" | "room_full" | undefined }) {
    switch (roomStatus) {
        case "exists":
            return children;
        case "room_not_found":
            return (
                <RoomErrorScreen
                    description="The room you are looking for does not exist"
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
        default:
            return <Loading />
    }
}

function RoomErrorScreen({ description, title }: { description: string, title: string }) {
    return (
        <>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
            </Helmet>
            <div className="flex justify-center items-center min-h-screen">
                <div className=" flex flex-col gap-5 justify-center items-center w-full max-w-sm bg-transparent rounded p-10 shadow-2xl">
                    <h1 className="text-2xl font-bold font-logo text-center">{description}</h1>
                    <Link to="/">
                        <h1 className="text-xl font-logo link link-primary">Return home</h1>
                    </Link>
                </div>
            </div>
        </>
    )
}
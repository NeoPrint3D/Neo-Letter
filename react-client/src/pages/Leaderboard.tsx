import { collection, getFirestore, limit, orderBy, query, where } from "firebase/firestore";
import { m } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { useWindowSize } from "react-use";
import { UserContext } from "../context/AuthContext";
import { app } from "../utils/firebase";



const firestore = getFirestore(app)

export default function LeaderBoard() {
  const user = useContext(UserContext);
  const { width } = useWindowSize();
  const [userPlace, setUserPlace] = useState(20);
  const [users, setUsers] = useState([] as UserProfile[]);

  const ending = (placing: number) => {
    switch (placing) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  useEffect(() => {
    const q = query(
      collection(firestore, "users"),
      where("points", "!=", "0"),
      orderBy("points"),
      limit(10)
    );

    return () => { };
  }, []);

  return (
    <>
      <div className="hidden sm:h-24 sm:block"></div>
      <div className="flex flex-col justify-center items-center h-page gap-5">
        <div
          className={` flex flex-col  main-container max-w-sm sm:max-w-xl w-full pt-5 h-[60%] sm:h-[75%] `}
        >
          <h1 className="text-center text-3xl font-logo"> Leaderboard </h1>
          <div
            className={`overflow-y-scroll scroll-lobby m-5 h-full outline outline-primary/30 rounded-2xl row-span-5 `}
          >
            {users.map((user, index) => (
              <div>{user.username}</div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

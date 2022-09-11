import { getDocs, collection, where, limit, query, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { m } from "framer-motion";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { AiFillDelete } from "react-icons/ai";
import { CgGames } from "react-icons/cg";
import { FaCrown } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import { firestore } from "../utils/firebase";

export default function Profile() {
  const [user, setUser] = useState(undefined as unknown as UserProfile);
  const [userExists, setUserExists] = useState(undefined as unknown as boolean);
  const navigate = useNavigate()
  const { username } = useParams();


  async function deleteProfile() {
    if (window.confirm("Are you sure you want to delete your profile")) {
      await deleteDoc(doc(firestore, "users", user.uid))
      alert("Profile deleted")
      navigate("/?action=reload")
    }
  }



  useEffect(() => {
    const main = async () => {
      if (!username) return;
      const q = query(
        collection(firestore, "users"),
        where("username", "==", username),
        limit(1)
      );
      onSnapshot(q, (users) => {
        setUserExists(users.docs.length > 0);
        if (users.docs.length > 0) setUser(users.docs[0].data() as UserProfile);
      })
    };
    main();
  }, [username]);

  const formatter = new Intl.NumberFormat("en", { notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 2 })
  const statContainers = [
    {
      title: "Games Played",
      value: formatter.format(user?.gamesPlayed),
      icon: (
        <CgGames
          className="text-blue-500"
          aria-label="Games Played"
          size={35}
        />
      ),
    },
    {
      title: "Wins",
      value: formatter.format(user?.wins),
      icon: (
        <FaCrown className="text-yellow-500" aria-label="Games Won" size={35} />
      ),
    },
    {
      title: "Total Points",
      value: formatter.format(user?.totalPoints),
      icon: <h1 className=" font-logo text-green-500">Points</h1>,
    },
  ];

  if (userExists === undefined) return <Loader />;
  if (!userExists) return <div className="h-screen flex justify-center items-center text-5xl font-logo">User not found</div>;
  if (!user) return <div />;


  return (
    <>
      <Helmet>
        <title>{user.username}'s Profile </title>
        <meta name="description" content={`${user.username}'s profile`} />
        <meta property="og:title" content={`${user.username}'s profile page`} />
        <meta
          property="og:description"
          content={`${user.username}'s profile`}
        />
        <meta property="og:image" content={user.profilePic} />
        <meta
          property="og:url"
          content={`https://neo-letter.com/profile/${user.username}`}
        />
        <meta property="og:type" content="website" />
      </Helmet>
      <article>
        <div className="h-screen flex justify-center items-center">
          <m.div
            className={` flex flex-col  main-container max-w-sm sm:max-w-xl w-full pb-16`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <div className="flex w-full justify-end p-2 absolute">
              <div className="tooltip tooltip-bottom tooltip-error" data-tip="Delete Profile">
                <button onClick={deleteProfile} className="p-2 rounded-full text-red-500/60 hover:text-red-500 hover:bg-white/10 hover:scale-105 active:scale-95 duration-300">
                  <AiFillDelete size={30} />
                </button>
              </div>
            </div>
            <div className="flex justify-center absolute w-full -translate-y-[2.75rem] ">
              <m.div
                className={`avatar avatar-sm `}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  duration: 2,
                  delay: 0.5,
                }}
              >
                <div className=" rounded-3xl  border-[3px] border-white/[10%] w-20  ">
                  <figure>
                    <img
                      src={user.profilePic}
                      alt={`A picture of ${user.username} at NeoPrint3D`}
                      referrerPolicy="no-referrer"
                    />
                  </figure>
                </div>
              </m.div>
            </div>
            <h1 className="text-center text-5xl font-logo mt-14 text-white">
              {" "}
              {user.username}{" "}
            </h1>

            <div className="flex flex-col items-center mt-5 h-full gap-5">
              {statContainers.map((stat, index) => (
                <Stat
                  index={index}
                  key={index}
                  title={stat.title}
                  stat={stat.value}
                  icon={stat.icon}
                />
              ))}
            </div>
          </m.div>
        </div>
      </article>
    </>
  );
}

function Stat({
  stat,
  icon,
  title,
  index,
}: {
  stat: string | number;
  icon: React.ReactElement;
  title: string;
  index: number;
}) {
  return (
    <section className="w-[90%]">
      <m.div
        className="grid grid-cols-7 items-center shadow-input h-20 rounded-3xl px-4"
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          y: {
            type: "spring",
            stiffness: 300,
            damping: 10,
            delay: index * 0.25 + 0.7,
            duration: 1,
          },
          opacity: {
            delay: index * 0.2 + 0.7,
            duration: 0.5,
          },
        }}
      >
        <h1 className=" text-2xl text-white font-medium col-span-4">{title}</h1>
        <div className="flex justify-end w-full gap-3 items-center col-span-3">
          <h1 className="text-2xl sm:text-4xl text-white font-medium">{stat}</h1>
          {icon}
        </div>
      </m.div>
    </section>
  );
}

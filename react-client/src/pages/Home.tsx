import { useContext, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, useLocation } from "react-router-dom";
import { LayoutGroup, m } from "framer-motion";
import { useWindowSize } from "react-use";
import { toast } from "react-toastify";
import { UserContext } from "../context/AuthContext";
import MobileImage from "/images/assets/App-Mobile.webp";
import DesktopImage from "/images/assets/App-Desktop.webp";
function Home() {
  const location = useLocation();
  const { width } = useWindowSize();
  const user = useContext(UserContext);

  useEffect(() => {
    if (new URLSearchParams(location.search).get("action") === "reload") {
      window.location.href = "/"
    }
  }, []);
  useEffect(() => {
    remindToSignUp();
  }, [user]);

  async function remindToSignUp() {
    if (user?.uid || user === undefined) return;
    await new Promise((resolve) => setTimeout(resolve, 3000));
    toast.info("Create an account to save your progress", {
      theme: "dark",
      autoClose: false,
      style: {
        backgroundColor: " rgb(2 48 71 / 0.8)",
        color: "white",
        borderRadius: "0.5rem",
        padding: ".5rem",
      },
    });
  }

  return (
    <>
      <Helmet>
        <title>Neo Letter</title>
        <meta
          name="description"
          content="The new wordle party game to play with your friends. Created for easy sharing and lots fo fun."
        />

        <meta property="og:url" content="https://neo-letter.web.app/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Neo Letter" />
        <meta
          property="og:description"
          content="The new wordle party game to play with your friends"
        />
        <meta property="og:image" content="/images/previews/Home.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="neo-letter.web.app" />
        <meta property="twitter:url" content="https://neo-letter.web.app/" />
        <meta name="twitter:title" content="Neo Letter" />
        <meta
          name="twitter:description"
          content="The new wordle party game to play with your friends"
        />
        <meta
          name="twitter:image"
          content="https://neo-letter.web.app/images/previews/Home.png"
        />
      </Helmet>

      <LayoutGroup>
        <div
          className="hero min-h-screen"
          style={{
            backgroundImage: ` url(${width > 1024 ? DesktopImage : MobileImage
              })`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="hero-content text-center text-neutral-content">
            <m.div
              className="sm:max-w-xl main-container px-5 py-10"
              initial={{ rotateX: -90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                mass: 1,
                duration: 0.5,
              }}
            >
              <div className="flex justify-center">
                <div className=" bg-gray-700 text-5xl sm:text-6xl text-white font-logo px-4 -skew-x-12 rounded-2xl mb-5">
                  <div className="flex items-center">
                    <m.div
                      className="p-1  skew-x-[-12deg] rounded"
                      initial={{ scale: 2, zIndex: 100, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        delay: 1,
                        duration: 0.5,
                      }}
                    >
                      The
                    </m.div>
                    <m.button
                      className="bg-success skew-x-[-12deg] rounded"
                      initial={{ scale: 3, zIndex: 100, opacity: 0 }}
                      animate={{ scale: [1, 0.75, 1], opacity: 1 }}
                      transition={{
                        scale: {
                          type: "spring",
                          delay: 1.5,
                          duration: 0.5,
                        },
                        opacity: {
                          delay: 1.5,
                          duration: 0.25,
                        },
                        rotateX: {
                          type: "inertia",
                          velocity: 1250,
                          delay: 0,
                        },
                      }}
                      whileTap={{
                        rotateX: [0, -90, 0],
                      }}
                    >
                      Wordle
                    </m.button>
                  </div>
                  <div className="flex items-center ">
                    <m.button
                      className="bg-warning skew-x-[-12deg] rounded"
                      initial={{ scale: 4, zIndex: 100, opacity: 0 }}
                      animate={{ scale: [1, 0.7, 1], z: 0, opacity: 1 }}
                      transition={{
                        scale: {
                          type: "spring",
                          delay: 2,
                          duration: 0.5,
                        },
                        opacity: {
                          delay: 2,
                          duration: 0.25,
                        },
                        rotateX: {
                          type: "inertia",
                          velocity: 1250,
                          delay: 0,
                        },
                      }}
                      whileTap={{
                        rotateX: [0, -270, 0],
                      }}
                    >
                      Party
                    </m.button>
                    <m.div
                      className="p-1 skew-x-[-12deg] rounded"
                      initial={{ scale: 5, zIndex: 100, opacity: 0 }}
                      animate={{ scale: [1, 0.65, 1], z: 0, opacity: 1 }}
                      transition={{
                        type: "spring",
                        delay: 2.5,
                        duration: 0.5,
                      }}
                    >
                      Game
                    </m.div>
                  </div>
                </div>
              </div>
              <p className="mb-5 text-base">
                <a className="font-black text-xl">Neo Letter</a> is the new
                wordle party game to play with your friends. You can create,
                limit, and choose who can play with you. With{" "}
                <a className="font-black text-xl">Mobile</a> first,{" "}
                <a className="font-black text-xl">Everyone</a> can play.
              </p>
              <div className="flex justify-center gap-5 sm:gap-10">
                <Link to="/join">
                  <button className=" text-white transition-all flex items-center py-4 px-7 text-xl font-logo hover:bg-gray-400/25  rounded-xl active:scale-95">
                    Join
                  </button>
                </Link>
                <Link to="/create">
                  <button className="transition-all text-white flex items-center py-4 px-7 text-xl font-logo bg-primary hover:bg-red-400 active:bg-red-600 rounded-xl active:scale-95">
                    Create
                  </button>
                </Link>
              </div>
            </m.div>
          </div>
        </div>
      </LayoutGroup>
    </>
  );
}

export default Home;

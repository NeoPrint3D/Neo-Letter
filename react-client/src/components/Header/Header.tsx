import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserContext } from "../../context/AuthContext";
import GoogleSignIn from "../GoogleSignIn/GoogleSignIn";
import UserDropDown from "../UserDropDown";
import Logo from "/images/assets/logo.webp";



export default function Header() {
    const location = useLocation();
    const user = useContext(UserContext);
    const hideHeader = ['/room'].includes(`/${location.pathname.split("/")[1]}`);



    return !hideHeader ? (
        <header className={` grid grid-cols-2 h-20 items-center w-full border-b-white/40 ${["/", "/signup", "/leaderboard"].includes(location.pathname) && "absolute"}  z-50`}>
            <div className="hidden"></div>
            <div className="flex justify-start ml-5 lg:ml-0">
                <Link to="/" >
                    <img src={Logo}
                        draggable={false}
                        alt="logo"
                        height={40}
                        width={120}
                        className=" -translate-x-6 lg:translate-x-0 translate-y-1"
                    />

                </Link>

            </div>
            <div className="flex justify-end w-full gap-5 pr-5">
                {user?.uid ? <UserDropDown /> : <GoogleSignIn />}
            </div>
        </header>
    ) : null;
}
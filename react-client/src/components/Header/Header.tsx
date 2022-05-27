import { GoogleAuthProvider } from "firebase/auth";
import { Link, useLocation } from "react-router-dom";
import GoogleSignIn from "../GoogleSignIn/GoogleSignIn";
import Logo from "/images/assets/logo.webp";



export default function Header() {
    const location = useLocation();
    const hideHeader = ['/room'].includes(`/${location.pathname.split("/")[1]}`);



    return !hideHeader ? (
        <header className={` grid grid-cols-2 lg:grid-cols-3 h-20 items-center w-full border-b-white/40 ${location.pathname === "/" && "absolute"} `}>
            <div className="hidden lg:flex"></div>
            <div className="flex justify-start lg:justify-center ml-5">
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
            <div className="flex justify-end gap-5 pr-5">
                {/* <GoogleSignIn /> */}
            </div>
        </header>
    ) : null;
}
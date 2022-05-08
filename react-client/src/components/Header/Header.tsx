import { Link, useLocation } from "react-router-dom";
import { useScroll, useWindowScroll } from "react-use";
import Logo from "/images/assets/logo.webp";



export default function Header() {
    const location = useLocation();
    const hideHeader = ['/room'].includes(`/${location.pathname.split("/")[1]}`);

    return !hideHeader ? (
        <header className={` grid grid-cols-2 lg:grid-cols-3 h-20 items-center w-full border-b-white/40 ${location.pathname === "/" && "fixed"} `}>
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
            {location.pathname !== "/" &&
                <div className="flex justify-end gap-5 pr-5">

                    <Link to="/join" >
                        <button className=" text-white transition-all flex items-center py-3 px-5 text-xl font-logo hover:bg-gray-400/25  rounded-xl active:scale-95">
                            Join
                        </button>
                    </Link>

                    <Link to="/create">
                        <button className="transition-all text-white flex items-center py-3 px-5 text-xl font-logo bg-primary hover:bg-red-400 active:bg-red-600 rounded-xl active:scale-95">
                            Create
                        </button>
                    </Link>
                </div>
            }
        </header>
    ) : null;
}
import { useLocation } from "react-router-dom";
import Logo from "/images/assets/logo.webp";

export default function Footer() {
    const location = useLocation();

    return !location.pathname.includes("room") ? (
        <footer className="footer footer-center bg-primary-dark p-5">
            <div>
                <div>
                    <img src={Logo} alt="Neo Letter" className="h-20" />
                </div>
                <p className="font-semibold w-80">
                    A NeoPrint3D Company. Creating awesome web experiences since 2020.
                </p>
                <p>Copyright © {new Date().getFullYear()} <a className='font-bold'>NeoPrint3D</a></p>
            </div>
            <div>
                <p className='font-semibold'>
                    Made with ❤ by Drew Ronsman
                </p>
            </div>
        </footer>
    ) : <div />
}
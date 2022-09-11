import { BsStars } from "react-icons/bs";
import Logo from "/images/assets/logo.webp";

export default function Footer() {

    return (
        <footer className="footer footer-center bg-primary-dark p-5 text-white">
            <div>
                <div>
                    <img src={Logo} alt="Neo Letter" height={202} width={125} />
                </div>
                <p className="font-semibold w-80">
                    A NeoPrint3D Company. Creating awesome web experiences since 2020.
                </p>
                <p>Copyright © {new Date().getFullYear()} <a target={"_blank"} href="https://github.com/NeoPrint3D" className='font-bold link link-primary'>NeoPrint3D</a></p>
                <a className="flex items-center gap-5 text-2xl my-3 font-black link link-accent" href="https://github.com/NeoPrint3D/Neo-Letter">Star the Project <BsStars size={35} /></a>
                <p className='font-semibold'>
                    Made with ❤ by Drew Ronsman
                </p>
            </div>
        </footer>
    )
}
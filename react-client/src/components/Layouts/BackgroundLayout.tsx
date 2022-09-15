import { useWindowSize } from "react-use"
import MobileImage from "/images/assets/App-Mobile.webp"
import DesktopImage from "/images/assets/App-Desktop.webp"
import { Outlet } from "react-router-dom"

export default function BackgroundLayout() {
    const { width } = useWindowSize()
    return (
        <div
            style={{
                backgroundImage: ` url(${width > 1024 ? DesktopImage : MobileImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div className="bg-primary-dark/70">
                <Outlet />
            </div>
        </div>
    )
}

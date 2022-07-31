import { useWindowSize } from "react-use"
import MobileImage from "/images/assets/App-Mobile.webp"
import DesktopImage from "/images/assets/App-Desktop.webp"

export default function BgImage({ children }: { children: React.ReactNode }) {
    const { width } = useWindowSize()
    return (
        <div
            className="min-h-screen "
            style={{
                backgroundImage: ` url(${width > 1024 ? DesktopImage : MobileImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div className="bg-primary-dark/70">

                {children}
            </div>
        </div>
    )
}

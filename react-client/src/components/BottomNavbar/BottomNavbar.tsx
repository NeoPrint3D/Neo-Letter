import { LayoutGroup, m, Variants } from "framer-motion"
import { Dispatch, useEffect, useState } from "react"
import { AiFillHome } from "react-icons/ai"
import { BsPersonFill } from "react-icons/bs"
import { MdDashboard } from "react-icons/md"
import { Link, useLocation } from "react-router-dom"
import { auth } from "../../utils/firebase"


export default function BottomNavbar() {
    const location = useLocation()
    const [modal, setModal] = useState(false)
    const [navSelect, setNavSelect] = useState(location.pathname)

    useEffect(() => {
        console.log(location.pathname)

    }, [navSelect])


    return !location.pathname.includes("/room") ? (
        <div className='flex justify-center bottom-0 fixed w-screen'>
            <LayoutGroup>
                <m.div
                    className='grid grid-cols-3 items-center bg-primary-dark/30 backdrop-blur-3xl w-96 h-20 rounded-3xl shadow-input mb-5'
                >
                    {items.map((item, i) => (
                        <NavBarItem key={i} name={item.name} icon={item.icon} navSelect={navSelect} setNavSelect={setNavSelect} route={item.route} />
                    ))}

                </m.div>
            </LayoutGroup>
        </div>
    ) : null
}

const items = [
    {
        name: "Home",
        icon: < AiFillHome size={40} />,
        route: "/",
    },
    {
        name: "Profile",
        icon: <BsPersonFill size={40} />,
        route: "/profile",
    },
    {
        name: "Dashboard",
        icon: <MdDashboard size={40} />,
        route: "/dashboard",
    },
]

function NavBarItem({ name, icon, route, setNavSelect, navSelect }: { name: string, icon: JSX.Element, route: string, setNavSelect: any, navSelect: string }) {
    return (
        <Link to={route}>
            <m.div
                className="flex flex-col justify-center items-center"
                layoutId="navbar-item"
                onClick={() => setNavSelect(route)}
                initial={false}
                animate={{
                    scale: route === navSelect ? 1.15 : 1,
                    color: route === navSelect ? "white" : "gray",
                }}

            >
                {icon}
                <p className='text-xl'>{name}</p>
            </m.div>
        </Link>
    )
}

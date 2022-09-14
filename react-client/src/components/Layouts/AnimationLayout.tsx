import { useWindowSize } from "react-use"
import { Outlet } from "react-router-dom"
import { domAnimation, LazyMotion } from "framer-motion"

export default function AnimationLayout() {
    return (
        <LazyMotion features={domAnimation}>
            <Outlet />
        </LazyMotion>
    )
}

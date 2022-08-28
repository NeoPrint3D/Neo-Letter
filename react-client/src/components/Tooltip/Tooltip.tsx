import { AnimatePresence, m } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useWindowSize } from "react-use";


type Direction = "top" | "bottom" | "left" | "right"
interface TooltipProps {
    children: React.ReactNode;
    tip: string;
    direction?: Direction;
}


export default function Tooltip({ children, tip: text, direction, }: TooltipProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { height, width } = useWindowSize()
    const [childHeight, setChildHeight] = useState(0);
    const [childWidth, setChildWidth] = useState(0);
    const [hover, setHover] = useState(false);
    const [calculatedDirection, setCalculatedDirection] = useState<Direction>("bottom")



    useEffect(() => {
        if (ref.current) {
            const box = ref.current.getBoundingClientRect()
            setChildHeight(box.height)
            setChildWidth(box.width)
        }
    }, []);

    useEffect(() => {
        if (direction) { setCalculatedDirection(direction); return }
        const [x, y]: [number, number] = [ref.current?.offsetLeft!, ref.current?.offsetTop!]
        if (x === y) { setCalculatedDirection("bottom"); return }
        if (y < height / 2) { setCalculatedDirection("bottom") }
        if (y > height / 2) { setCalculatedDirection("top") }
    }, [])

    return (
        <>
            <div
                className="flex"
                ref={ref}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                {children}
            </div>
            <AnimatePresence>
                {hover && (
                    <m.div
                        className="flex justify-center items-center  font-head bg-primary/90 backdrop-blur-xl text-white rounded-lg shadow-md shadow-primary p-2"
                        style={{
                            position: "absolute",
                            translateY: `${["top", "bottom"].includes(calculatedDirection) ? `${direction === "top" ? `-${childHeight * .95}px` : `${childHeight * .95}px`}` : "0px"}`,
                            zIndex: 1,
                        }}
                        initial={{ scale: .7, opacity: .6, y: -25 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0, y: -25 }}
                        transition={{
                            opacity: {
                                type: "tween",
                                duration: 0.2
                            },
                            scale: {

                                type: "spring",
                                stiffness: 100,
                                damping: 10,
                                delay: 0.2,
                                duration: 0.2
                            },
                            y: {
                                type: "spring",
                                stiffness: 250,
                                damping: 10,
                                duration: 0.4,
                                velocity: 500
                            }
                        }}
                    >
                        {text}
                    </m.div>
                )}
            </AnimatePresence>
        </>
    )
}
import { useEffect, useState } from "react";

export default function useIntersection(ref: React.RefObject<Element>) {
    const [isIntersecting, setIsIntersecting] = useState(false);

    const observer = new IntersectionObserver(([entry]) => setIsIntersecting(entry.isIntersecting),)

    useEffect(() => {
        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        }
    }, [ref, observer]);

    return isIntersecting;
};

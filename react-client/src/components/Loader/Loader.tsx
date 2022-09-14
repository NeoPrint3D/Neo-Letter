import { domAnimation, LazyMotion, m } from 'framer-motion';
import { useWindowSize } from "react-use"
import MobileImage from "/images/assets/App-Mobile.webp"
import DesktopImage from "/images/assets/App-Desktop.webp"

function Loader() {
  const { width } = useWindowSize()
  return (
    <LazyMotion features={domAnimation}>
      <div
        style={{
          position: "fixed",
          backgroundImage: `url(${width > 640 ? DesktopImage : MobileImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >

        <m.div
          className={`flex justify-center items-center bg-primary-dark/70  w-screen h-screen`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}

        >
          <m.div
            animate={{
              scale: [1, 1.5, 1],
              rotate: 90,
              borderRadius: ["0%", "50%", "25%", "50%", "0%"],
              backgroundColor: ["#FBBD23", "#22c55e", "#6b7280", "#FBBD23"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}

            className="w-24 h-24 "
          >
          </m.div>
        </m.div>
      </div>
    </LazyMotion>
  );
}


export default Loader
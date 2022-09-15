import { domAnimation, LazyMotion, m } from 'framer-motion';
import { useWindowSize } from "react-use"
import MobileImage from "/images/assets/App-Mobile.webp"
import DesktopImage from "/images/assets/App-Desktop.webp"

function Loader() {
  const { width } = useWindowSize()
  return (



    <LazyMotion features={domAnimation}>
      <div
        className='z-50 fixed w-screen h-screen'
        style={{
          backgroundImage: ` url(${width > 1024 ? DesktopImage : MobileImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <m.div
          className={`flex justify-center items-center w-full h-full bg-primary-dark/70`}
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
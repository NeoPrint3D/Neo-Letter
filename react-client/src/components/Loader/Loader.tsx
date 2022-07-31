import { m } from 'framer-motion';

function Loader() {
  return (
    <div className="flex justify-center items-center h-screen z-10 w-screen fixed">
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
    </div>
  );
}


export default Loader
import { m } from "framer-motion";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

export default function RoomErrorScreen({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      <m.div
        className="flex justify-center items-center min-h-screen"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
      >
        <div className=" flex flex-col items-center justify-center py-10  px-10 main-container">
          <h1 className="text-4xl  font-logo text-center mb-5">
            {description}
          </h1>
          <Link to="/">
            <button className="btn btn-primary btn-lg mt-5">Return home</button>
          </Link>
        </div>
      </m.div>
    </>
  );
}

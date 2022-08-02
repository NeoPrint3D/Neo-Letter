import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <>
            <Helmet>
                <title>Not Found</title>
                <meta name="description" content="Page not found. Want to go back to the homepage?" />
                <meta property="og:url" content="https://neo-letter.web.app/notfound" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Not found | Neo Letter" />
                <meta property="og:description" content="Page not found. Want to go back to the homepage?" />
                <meta property="og:image" content="/images/previews/SignUp.png" />
            </Helmet>
            <div className="flex flex-col items-center justify-center h-page">
                <h1 className="text-5xl font-logo text-center">Are you lost?</h1>
                <Link to="/">
                    <button className="mt-5">
                        <h1 className="text-3xl font-logo link link-primary k transition-all  duration-300 ">Back to Home</h1>
                    </button>
                </Link>
            </div>
        </>
    )
}
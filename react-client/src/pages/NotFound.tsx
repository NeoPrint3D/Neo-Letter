import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <>
            <Helmet>
                <title>Not Found</title>
                <meta name="description" content="Page not found. Want to go back to the homepage?" />
                <meta property="og:url" content="https://neo-letter.web.app/404" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Not found | Neo Letter" />
                <meta property="og:description" content="Page not found. Want to go back to the homepage?" />
                <meta property="og:image" content="/images/previews/NotFound.png" />

                <meta name="twitter:card" content="summary_large_image" />
                <meta property="twitter:domain" content="neo-letter.web.app" />
                <meta property="twitter:url" content="https://neo-letter.web.app/404" />
                <meta name="twitter:title" content="Not found | Neo Letter" />
                <meta name="twitter:description" content="Page not found. Want to go back to the homepage?" />
                <meta name="twitter:image" content="https://neo-letter.web.app/images/previews/NotFound.png" />

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
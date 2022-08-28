import { Helmet } from "react-helmet";
import AuthStatusHandler from "../components/Handlers/AuthStatusHandler";

export default function SignUpPage() {
  return (
    <div>
      <Helmet>
        <title> Sign Up </title>
        <meta name="description" content="Sign up for the Neo Letter game" />
        <meta property="og:url" content="https://neo-letter.web.app/signup" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Sign Up | Neo Letter" />
        <meta
          property="og:description"
          content="Sign up for the Neo Letter game"
        />
        <meta property="og:image" content="/images/previews/SignUp.png" />
      </Helmet>
      <AuthStatusHandler />
    </div>
  );
}

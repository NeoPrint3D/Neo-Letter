import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import { AuthProvider } from "./context/AuthContext";
import { GameContextProvider } from './context/GameContext'
import Loader from './components/Loader'
import { useWindowSize } from 'react-use'
import AppToastContainer from './components/Toast/ToastContainer'
import MobileImage from "/images/assets/App-Mobile.webp"
import DesktopImage from "/images/assets/App-Desktop.webp"
import Home from './pages/Home'
import { domMax, LazyMotion } from 'framer-motion'
import BottomNavbar from './components/BottomNavbar';
const GameRoom = lazy(() => import('./pages/GameRoom'))
const CreateRoom = lazy(() => import('./pages/Create'))
const JoinRoom = lazy(() => import('./pages/Join'))
const SignUpPage = lazy(() => import('./pages/SignUp'))
const Footer = lazy(() => import('./components/Footer'))



function App() {
  const { width } = useWindowSize()
  const location = useLocation()
  return (
    <AuthProvider>
      <LazyMotion features={domMax}>
        <div id="App"
          style={{
            backgroundImage: ` url(${width > 600 ? DesktopImage : MobileImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}>
          <div className={` transition-colors duration-500 ease-in-out min-h-screen ${location.pathname === "/" ? "bg-transparent" : "bg-primary-dark/70"}`}>
            <Suspense fallback={<Loader />}>
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create" element={<CreateRoom />} />
                <Route path="/join" element={<JoinRoom />} />
                <Route path="/room/:id" element={<GameContextProvider><GameRoom /></GameContextProvider>} />
                <Route path="/signup" element={<SignUpPage />} />
              </Routes>
              <Footer />
            </Suspense>
          </div>
        </div>
      </LazyMotion>
      <AppToastContainer />
    </AuthProvider>
  )
}

export default App

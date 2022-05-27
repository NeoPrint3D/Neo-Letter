import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import { AuthProvider } from "./context/AuthContext";
import { GameContextProvider } from './context/GameContext'
import Loader from './components/Loader'
import { useWindowSize } from 'react-use'
import AppToastContainer from './components/Toast/ToastContainer'
import MobileImage from "/images/assets/App-Mobile.webp"
import DesktopImage from "/images/assets/App-Desktop.webp"
import Home from './pages/Home'
import { domAnimation, domMax, LazyMotion } from 'framer-motion'
import BottomNavbar from './components/BottomNavbar'
import Footer from './components/Footer';
const GameRoom = lazy(() => import('./pages/GameRoom'))
const CreateRoom = lazy(() => import('./pages/Create'))
const JoinRoom = lazy(() => import('./pages/Join'))



function App() {
  const { width } = useWindowSize()
  return (
    <AuthProvider>
      <div id="App"
        style={{
          backgroundImage: ` url(${width > 600 ? DesktopImage : MobileImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className={" min-h-screen bg-primary-dark/70"}>
          <Header />
          <LazyMotion features={domMax}>
            <Suspense fallback={<Loader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create" element={<CreateRoom />} />
                <Route path="/join" element={<JoinRoom />} />
                <Route path="/room/:id" element={<GameContextProvider><GameRoom /></GameContextProvider>} />
              </Routes>
            </Suspense>
          </LazyMotion>
        </div>
      </div>
      <Footer />
      <AppToastContainer />
    </AuthProvider>
  )
}

export default App

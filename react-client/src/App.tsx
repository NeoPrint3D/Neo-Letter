import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import { AuthProvider } from "./context/AuthContext";
import { GameContextProvider } from './context/GameContext'
import Loader from './components/Loader'
import { useWindowSize } from 'react-use'
import AppToastContainer from './components/Toast/ToastContainer'

import Home from './pages/Home'
import { domMax, LazyMotion } from 'framer-motion'
import LeaderBoard from './pages/Leaderboard';
import Profile from './pages/Profile';
import BgImage from './components/Wrappers/BgImage';
import BottomNavbar from './components/BottomNavbar';
const GameRoom = lazy(() => import('./pages/GameRoom'))
const CreateRoom = lazy(() => import('./pages/Create'))
const JoinRoom = lazy(() => import('./pages/Join'))
const SignUpPage = lazy(() => import('./pages/SignUp'))
const Footer = lazy(() => import('./components/Footer'))



function App() {
  return (
    <Suspense fallback={<Loader />}>
      <LazyMotion features={domMax}>
        <AuthProvider>
          <BgImage>
            <div className="min-h-screen">
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create" element={<CreateRoom />} />
                <Route path="/join" element={<JoinRoom />} />
                <Route path="/room/:id" element={
                  <GameContextProvider>
                    <GameRoom />
                  </GameContextProvider>
                } />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/profile/:username" element={<Profile />} />
                <Route path="*" element={<Home />} />
                
              </Routes>
            </div>
          </BgImage>
          <Footer />
          <AppToastContainer />
        </AuthProvider >
      </LazyMotion>
    </Suspense>
  )
}

export default App

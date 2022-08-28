import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import { AuthProvider } from "./context/AuthContext";
import { GameContextProvider } from './context/GameContext'
import Loader from './components/Loader'
import AppToastContainer from './components/Toast/ToastContainer'

import Home from './pages/Home'
import { domMax, LazyMotion } from 'framer-motion'
import Profile from './pages/Profile';
import BgImage from './components/Wrappers/BgImage';
import Footer from './components/Footer';
import NotFound from './pages/NotFound';
const GameRoom = lazy(() => import('./pages/GameRoom'))
const CreateRoom = lazy(() => import('./pages/Create'))
const JoinRoom = lazy(() => import('./pages/Join'))
const SignUpPage = lazy(() => import('./pages/SignUp'))



function App() {
  return (
    <LazyMotion features={domMax}>
      <AuthProvider>
        <BgImage>
          <div className="min-h-screen text-white">
            <Suspense fallback={<Loader />}>
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
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" />} />
              </Routes>
            </Suspense>
          </div>
        </BgImage>
        <Footer />
        <AppToastContainer />
      </AuthProvider >
    </LazyMotion>
  )
}

export default App

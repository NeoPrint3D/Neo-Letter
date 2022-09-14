import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from "./context/AuthContext";
import { GameContextProvider } from './context/GameContext'
import Loader from './components/Loader'
import BackgroundLayout from './components/Layouts/BackgroundLayout';
import { domAnimation, LazyMotion } from 'framer-motion';


import Header from './components/Header';
import Home from './pages/Home'
const GameRoom = lazy(() => import('./pages/GameRoom'))
const CreateRoom = lazy(() => import('./pages/Create'))
const JoinRoom = lazy(() => import('./pages/Join'))
const SignUpPage = lazy(() => import('./pages/SignUp'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Profile = lazy(() => import("./pages/Profile"))

const AppToastContainer = lazy(() => import('./components/Toast/ToastContainer'))
const Footer = lazy(() => import("./components/Footer"))

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <LazyMotion features={domAnimation} strict>
        <div className="min-h-screen text-white">
          <AuthProvider>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route element={<BackgroundLayout />}>
                <Route path="/room/:id" element={
                  <GameContextProvider>
                    <GameRoom />
                  </GameContextProvider>
                } />
                <Route path="/create" element={<CreateRoom />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/join" element={<JoinRoom />} />
                <Route path="/profile/:username" element={<Profile />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" />} />
              </Route>
            </Routes>
          </AuthProvider >
          <AppToastContainer />
        </div >
        <Footer />
      </LazyMotion>
    </Suspense>
  )
}

export default App

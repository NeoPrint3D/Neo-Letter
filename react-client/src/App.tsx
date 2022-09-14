import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import { AuthProvider } from "./context/AuthContext";
import { GameContextProvider } from './context/GameContext'
import Loader from './components/Loader'
import AppToastContainer from './components/Toast/ToastContainer'
import Home from './pages/Home'
import Footer from './components/Footer';
import BackgroundLayout from './components/Layouts/BackgroundLayout';
import { domAnimation, LazyMotion } from 'framer-motion';
import AnimationLayout from './components/Layouts/AnimationLayout';


const GameRoom = lazy(() => import('./pages/GameRoom'))
const CreateRoom = lazy(() => import('./pages/Create'))
const JoinRoom = lazy(() => import('./pages/Join'))
const SignUpPage = lazy(() => import('./pages/SignUp'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Profile = lazy(() => import("./pages/Profile"))




function App() {
  return (
    <>
      <div className="min-h-screen text-white">
        <Suspense fallback={<Loader />}>
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
                <Route element={<AnimationLayout />}>
                  <Route path="/signup" element={<SignUpPage />} />
                  <Route path="/join" element={<JoinRoom />} />
                  <Route path="/profile/:username" element={<Profile />} />
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" />} />
                </Route>
              </Route>
            </Routes>
          </AuthProvider >
        </Suspense>
        <AppToastContainer />
      </div >
      <Footer />
    </>
  )
}

export default App

import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom'
import Header from './components/Header'
import { AuthProvider } from './context/AuthContext'

import { GameContextProvider } from './context/GameContext'
import { Loading } from './components/Loader/Loading'
import { useWindowSize } from 'react-use'
import AppToastContainer from './components/Toast/ToastContainer'
import MobileImage from "/images/assets/App-Mobile.webp"
import DesktopImage from "/images/assets/App-Desktop.webp"
import Home from './pages/Home'
import { domAnimation, LazyMotion } from 'framer-motion'
const GameRoom = lazy(() => import('./pages/GameRoom'))
const CreateRoom = lazy(() => import('./pages/Create'))
const JoinRoom = lazy(() => import('./pages/Join'))



function App() {
  const { width } = useWindowSize()
  const location = useLocation()
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
            <LazyMotion features={domAnimation}>
              <Suspense fallback={<Loading />}>
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
        <AppToastContainer />
    </AuthProvider>
  )
}

export default App

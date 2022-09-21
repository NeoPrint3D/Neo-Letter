import { domAnimation, LazyMotion } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import BackgroundLayout from './components/Layouts/BackgroundLayout';
import Loader from './components/Loader';
import { AuthProvider } from "./context/AuthContext";
import { GameContextProvider } from './context/GameContext';


import Footer from './components/Footer';
import Header from './components/Header';
import Home from './pages/Home';

const GameRoom = lazy(() => import('./pages/GameRoom'))
const CreateRoom = lazy(() => import('./pages/Create'))
const JoinRoom = lazy(() => import('./pages/Join'))
const SignUpPage = lazy(() => import('./pages/SignUp'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Profile = lazy(() => import("./pages/Profile"))
const SettingsPage = lazy(() => import('./pages/UserSettingsPage'))
const AppToastContainer = lazy(() => import('./components/Toast/ToastContainer'))

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
                <Route path="/profile/:username/settings" element={<SettingsPage />} />
                <Route path="/404" element={<NotFound />} />
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

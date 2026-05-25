import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Homepage from './pages/Homepage'
import PlayPage from './pages/PlayPage'
import HistoryPage from './pages/HistoryPage'
import MakeGame from './pages/MakeGame'
import TrainPage from './pages/TrainPage'
import Profile from './pages/Profile'
import Deposit from './pages/Deposit'
import Auth from './pages/Auth'
import './App.css'
import AppLayout from './components/common/AppLayout'
import { GameProvider } from './contexts/GameContext'
import { SocketProvider } from './contexts/SocketContext'
import GameRules from './pages/GameRules'
import { WalletProvider } from './contexts/WalletContext'
import { ProfileProvider } from './contexts/ProfileContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <GameProvider>
          <SocketProvider>
            <WalletProvider>
              <ProfileProvider>
                <div className="App">
                  <main className="main-content">
                    <Routes>
                      <Route path="/auth" element={<Auth />} />

                      {/* Public routes — Header shows Sign Up / Log In for guests */}
                      <Route element={<AppLayout />}>
                        <Route path="/" element={<Homepage />} />
                        <Route path="/game-rules" element={<GameRules />} />
                      </Route>

                      {/* Authenticated routes */}
                      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                        <Route path="/play" element={<PlayPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="/create" element={<MakeGame />} />
                        <Route path="/train" element={<TrainPage />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/deposit" element={<Deposit />} />
                      </Route>

                    </Routes>
                  </main>
                </div>
              </ProfileProvider>
            </WalletProvider>
          </SocketProvider>
        </GameProvider>
      </Router>
    </AuthProvider>
  )
}

export default App
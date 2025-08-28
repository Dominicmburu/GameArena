import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Homepage from './pages/Homepage'
import PlayPage from './pages/PlayPage'
import MakeGame from './pages/MakeGame'
import TrainPage from './pages/TrainPage'
import Profile from './pages/Profile'
import Deposit from './pages/Deposit'
import Auth from './pages/Auth'
import './App.css'
import AppLayout from './components/common/AppLayout'
import { GameProvider } from './contexts/GameContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <GameProvider>
          <div className="App">
            <main className="main-content">
              <Routes>
                <Route path="/auth" element={<Auth />} />

                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>

                  <Route path="/" element={<Homepage />} />
                  <Route path="/play" element={<PlayPage />} />
                  <Route path="/create" element={<MakeGame />} />
                  <Route path="/train" element={<TrainPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/deposit" element={<Deposit />} />

                </Route>

              </Routes>
            </main>
          </div>
        </GameProvider>
      </Router>
    </AuthProvider>
  )
}

export default App
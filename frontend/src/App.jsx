import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/common/Header'
import Homepage from './pages/Homepage'
import PlayPage from './pages/PlayPage'
import MakeGame from './pages/MakeGame'
import TrainPage from './pages/TrainPage'
import Profile from './pages/Profile'
import Deposit from './pages/Deposit'
import './App.css'
import Footer from './components/common/Footer'

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/play" element={<PlayPage />} />
            <Route path="/create" element={<MakeGame />} />
            <Route path="/train" element={<TrainPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/deposit" element={<Deposit />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
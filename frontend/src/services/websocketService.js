// // src/services/websocketService.js
// import io from 'socket.io-client'

// class WebSocketService {
//   constructor() {
//     this.socket = null
//     this.isConnected = false
//     this.eventListeners = new Map()
//   }

//   connect(token) {
//     if (this.socket) {
//       this.disconnect()
//     }

//     this.socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000', {
//       auth: {
//         token
//       }
//     })

//     this.socket.on('connect', () => {
//       this.isConnected = true
//       console.log('Connected to WebSocket server')
//     })

//     this.socket.on('disconnect', () => {
//       this.isConnected = false
//       console.log('Disconnected from WebSocket server')
//     })

//     this.socket.on('connect_error', (error) => {
//       console.error('WebSocket connection error:', error)
//     })
//   }

//   disconnect() {
//     if (this.socket) {
//       this.socket.disconnect()
//       this.socket = null
//       this.isConnected = false
//     }
//   }

//   // Join competition room
//   joinCompetition(competitionId) {
//     if (this.socket) {
//       this.socket.emit('joinCompetition', competitionId)
//     }
//   }

//   // Leave competition room
//   leaveCompetition(competitionId) {
//     if (this.socket) {
//       this.socket.emit('leaveCompetition', competitionId)
//     }
//   }

//   // Game events
//   startGame(competitionId) {
//     if (this.socket) {
//       this.socket.emit('gameStart', { competitionId })
//     }
//   }

//   updateScore(competitionId, score) {
//     if (this.socket) {
//       this.socket.emit('scoreUpdate', { competitionId, score })
//     }
//   }

//   endGame(competitionId, finalScore, gameData) {
//     if (this.socket) {
//       this.socket.emit('gameEnd', { competitionId, finalScore, gameData })
//     }
//   }

//   // Event listeners
//   on(event, callback) {
//     if (this.socket) {
//       this.socket.on(event, callback)
      
//       // Store callback for cleanup
//       if (!this.eventListeners.has(event)) {
//         this.eventListeners.set(event, [])
//       }
//       this.eventListeners.get(event).push(callback)
//     }
//   }

//   off(event, callback) {
//     if (this.socket) {
//       this.socket.off(event, callback)
      
//       // Remove from stored callbacks
//       if (this.eventListeners.has(event)) {
//         const callbacks = this.eventListeners.get(event)
//         const index = callbacks.indexOf(callback)
//         if (index > -1) {
//           callbacks.splice(index, 1)
//         }
//       }
//     }
//   }

//   // Remove all event listeners
//   removeAllListeners() {
//     this.eventListeners.forEach((callbacks, event) => {
//       callbacks.forEach(callback => {
//         if (this.socket) {
//           this.socket.off(event, callback)
//         }
//       })
//     })
//     this.eventListeners.clear()
//   }
// }

// export default new WebSocketService()
# File Structure Documentation for Gaming System

## Frontend
The frontend is structured as a React application using Vite. Below is the detailed file structure:

```
frontend/
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── vite.config.js
├── public/
│   └── vite.svg
├── src/
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── assets/
│   │   ├── icons/
│   │   │   ├── game-icons
│   │   │   └── ui-icons
│   │   ├── images/
│   │   │   ├── avatars/
│   │   │   ├── backgrounds/
│   │   │   ├── games/
│   │   │   └── logo.png
│   │   └── sounds/
│   │       ├── effects/
│   │       └── notifications/
│   ├── components/
│   │   ├── GameCard.jsx
│   │   ├── LeaderboardTable.jsx
│   │   ├── Modal.jsx
│   │   └── common/
│   │       ├── Footer.jsx
│   │       ├── Header.jsx
│   │       └── LoadingSpinner.jsx
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   ├── GameContext.js
│   │   ├── NotificationContext.js
│   │   └── ThemeContext.js
│   ├── data/
│   │   ├── achievements.js
│   │   ├── adminMockData.jsx
│   │   ├── countries.js
│   │   ├── gameTypes.js
│   │   └── mockData.js
│   ├── hooks/
│   │   ├── index.js
│   │   ├── useApi.js
│   │   ├── useAuth.js
│   │   ├── useDebounce.js
│   │   ├── useLocalStorage.js
│   │   ├── useTheme.js
│   │   └── useWebSocket.js
│   ├── games/
│   │   └── dino/
│   │       ├── DinoGame.jsx
│   ├── pages/
│   │   ├── Deposit.jsx
│   │   ├── Help.jsx
│   │   ├── Homepage.jsx
│   │   ├── Leaderboards.jsx
│   │   ├── MakeGame.jsx
│   │   ├── PlayPage.jsx
│   │   ├── Profile.jsx
│   │   ├── Settings.jsx
│   │   ├── Tournaments.jsx
│   │   └── TrainPage.jsx
│   ├── services/
│   │   ├── authService.js
│   │   ├── competitionService.js
│   │   ├── gameService.js
│   │   ├── paymentService.js
│   │   └── userService.js
│   │   └── websocketService.js
│   ├── styles/
│   │   ├── animations.css
│   │   ├── components.css
│   │   ├── responsive.css
│   │   └── variables.css
│   └── utils/
│       ├── api.js
│       ├── auth.js
│       ├── constants.js
│       ├── formatters.js
│       ├── helpers.js
│       └── validation.js
```

## Backend
The backend directory is currently empty.

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { gameService, competitionService } from '../services/gameService';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  games: [],
  gameTypes: [],
  popularGames: [],
  myCompetitions: [],
  participatedCompetitions: [],
  publicCompetitions: [],
  selectedGame: null,
  friends: [],
  friendRequests: { received: [], sent: [] },
  gameHistory: [],
  globalLeaderboard: [],
  pendingInvites: [],
  sentInvites: [],
  loading: {
    games: false,
    gameTypes: false,
    popularGames: false,
    myCompetitions: false,
    participatedCompetitions: false,
    publicCompetitions: false,
    creatingCompetition: false,
    joiningCompetition: false,
    submittingScore: false,
    friends: false,
    friendRequests: false,
    gameHistory: false,
    globalLeaderboard: false,
    pendingInvites: false,
    sentInvites: false,
    completingCompetition: false,
    sendingInvite: false,
    acceptingInvite: false,
    decliningInvite: false,
    sendingFriendRequest: false,
    acceptingFriendRequest: false,
    leavingCompetition: false
  },
  errors: {
    games: null,
    gameTypes: null,
    popularGames: null,
    myCompetitions: null,
    participatedCompetitions: null,
    publicCompetitions: null,
    creatingCompetition: null,
    joiningCompetition: null,
    submittingScore: null,
    friends: null,
    friendRequests: null,
    gameHistory: null,
    globalLeaderboard: null,
    pendingInvites: null,
    sentInvites: null,
    completingCompetition: null,
    sendingInvite: null,
    acceptingInvite: null,
    decliningInvite: null,
    sendingFriendRequest: null,
    acceptingFriendRequest: null,
    leavingCompetition: null
  }
};

// Action types
const GAME_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_GAMES: 'SET_GAMES',
  SET_GAME_TYPES: 'SET_GAME_TYPES',
  SET_POPULAR_GAMES: 'SET_POPULAR_GAMES',
  SET_MY_COMPETITIONS: 'SET_MY_COMPETITIONS',
  SET_PARTICIPATED_COMPETITIONS: 'SET_PARTICIPATED_COMPETITIONS',
  SET_PUBLIC_COMPETITIONS: 'SET_PUBLIC_COMPETITIONS',
  SET_SELECTED_GAME: 'SET_SELECTED_GAME',
  SET_FRIENDS: 'SET_FRIENDS',
  SET_FRIEND_REQUESTS: 'SET_FRIEND_REQUESTS',
  SET_GAME_HISTORY: 'SET_GAME_HISTORY',
  SET_GLOBAL_LEADERBOARD: 'SET_GLOBAL_LEADERBOARD',
  SET_PENDING_INVITES: 'SET_PENDING_INVITES',
  SET_SENT_INVITES: 'SET_SENT_INVITES',
  ADD_COMPETITION: 'ADD_COMPETITION',
  UPDATE_COMPETITION: 'UPDATE_COMPETITION',
  REMOVE_INVITE: 'REMOVE_INVITE',
  UPDATE_FRIEND_REQUESTS: 'UPDATE_FRIEND_REQUESTS',
  CLEAR_ERRORS: 'CLEAR_ERRORS'
};

// Reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case GAME_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value
        }
      };

    case GAME_ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.value
        },
        loading: {
          ...state.loading,
          [action.payload.key]: false
        }
      };

    case GAME_ACTIONS.SET_GAMES:
      return {
        ...state,
        games: action.payload,
        loading: { ...state.loading, games: false },
        errors: { ...state.errors, games: null }
      };

    case GAME_ACTIONS.SET_GAME_TYPES:
      return {
        ...state,
        gameTypes: action.payload,
        loading: { ...state.loading, gameTypes: false },
        errors: { ...state.errors, gameTypes: null }
      };

    case GAME_ACTIONS.SET_POPULAR_GAMES:
      return {
        ...state,
        popularGames: action.payload,
        loading: { ...state.loading, popularGames: false },
        errors: { ...state.errors, popularGames: null }
      };

    case GAME_ACTIONS.SET_MY_COMPETITIONS:
      return {
        ...state,
        myCompetitions: action.payload,
        loading: { ...state.loading, myCompetitions: false },
        errors: { ...state.errors, myCompetitions: null }
      };

    case GAME_ACTIONS.SET_PARTICIPATED_COMPETITIONS:
      return {
        ...state,
        participatedCompetitions: action.payload,
        loading: { ...state.loading, participatedCompetitions: false },
        errors: { ...state.errors, participatedCompetitions: null }
      };

    case GAME_ACTIONS.SET_PUBLIC_COMPETITIONS:
      return {
        ...state,
        publicCompetitions: action.payload,
        loading: { ...state.loading, publicCompetitions: false },
        errors: { ...state.errors, publicCompetitions: null }
      };

    case GAME_ACTIONS.SET_SELECTED_GAME:
      return {
        ...state,
        selectedGame: action.payload
      };

    case GAME_ACTIONS.SET_FRIENDS:
      return {
        ...state,
        friends: action.payload,
        loading: { ...state.loading, friends: false },
        errors: { ...state.errors, friends: null }
      };

    case GAME_ACTIONS.SET_FRIEND_REQUESTS:
      return {
        ...state,
        friendRequests: action.payload,
        loading: { ...state.loading, friendRequests: false },
        errors: { ...state.errors, friendRequests: null }
      };

    case GAME_ACTIONS.SET_GAME_HISTORY:
      return {
        ...state,
        gameHistory: action.payload,
        loading: { ...state.loading, gameHistory: false },
        errors: { ...state.errors, gameHistory: null }
      };

    case GAME_ACTIONS.SET_GLOBAL_LEADERBOARD:
      return {
        ...state,
        globalLeaderboard: action.payload,
        loading: { ...state.loading, globalLeaderboard: false },
        errors: { ...state.errors, globalLeaderboard: null }
      };

    case GAME_ACTIONS.SET_PENDING_INVITES:
      return {
        ...state,
        pendingInvites: action.payload,
        loading: { ...state.loading, pendingInvites: false },
        errors: { ...state.errors, pendingInvites: null }
      };

    case GAME_ACTIONS.SET_SENT_INVITES:
      return {
        ...state,
        sentInvites: action.payload,
        loading: { ...state.loading, sentInvites: false },
        errors: { ...state.errors, sentInvites: null }
      };

    case GAME_ACTIONS.ADD_COMPETITION:
      return {
        ...state,
        myCompetitions: [action.payload, ...state.myCompetitions],
        loading: { ...state.loading, creatingCompetition: false },
        errors: { ...state.errors, creatingCompetition: null }
      };

    case GAME_ACTIONS.UPDATE_COMPETITION:
      return {
        ...state,
        myCompetitions: state.myCompetitions.map(comp =>
          comp.id === action.payload.id ? { ...comp, ...action.payload } : comp
        ),
        participatedCompetitions: state.participatedCompetitions.map(comp =>
          comp.id === action.payload.id ? { ...comp, ...action.payload } : comp
        ),
        publicCompetitions: state.publicCompetitions.map(comp =>
          comp.id === action.payload.id ? { ...comp, ...action.payload } : comp
        )
      };

    case GAME_ACTIONS.REMOVE_INVITE:
      return {
        ...state,
        pendingInvites: state.pendingInvites.filter(invite => invite.id !== action.payload),
        sentInvites: state.sentInvites.filter(invite => invite.id !== action.payload)
      };

    case GAME_ACTIONS.UPDATE_FRIEND_REQUESTS:
      return {
        ...state,
        friendRequests: {
          ...state.friendRequests,
          received: state.friendRequests.received.filter(req => req.id !== action.payload)
        }
      };

    case GAME_ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        errors: action.payload ? { ...state.errors, [action.payload]: null } : initialState.errors
      };

    default:
      return state;
  }
};

// Create context
const GameContext = createContext();

// Context provider component
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // Helper functions
  const setLoading = useCallback((key, value) => {
    dispatch({
      type: GAME_ACTIONS.SET_LOADING,
      payload: { key, value }
    });
  }, []);

  const setError = useCallback((key, value) => {
    dispatch({
      type: GAME_ACTIONS.SET_ERROR,
      payload: { key, value }
    });
  }, []);

  const clearErrors = useCallback((key = null) => {
    dispatch({
      type: GAME_ACTIONS.CLEAR_ERRORS,
      payload: key
    });
  }, []);

  // Game Actions
  const fetchGames = useCallback(async (params = {}) => {
    try {
      setLoading('games', true);
      clearErrors('games');
      const games = await gameService.getAllGames(params);
      dispatch({
        type: GAME_ACTIONS.SET_GAMES,
        payload: games
      });
      return games;
    } catch (error) {
      setError('games', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError]);

  const fetchGameTypes = useCallback(async () => {
    try {
      setLoading('gameTypes', true);
      clearErrors('gameTypes');
      const gameTypes = await gameService.getGameTypes();
      dispatch({
        type: GAME_ACTIONS.SET_GAME_TYPES,
        payload: gameTypes
      });
      return gameTypes;
    } catch (error) {
      setError('gameTypes', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError]);

  const fetchPopularGames = useCallback(async (limit = 10) => {
    try {
      setLoading('popularGames', true);
      clearErrors('popularGames');
      const popularGames = await gameService.getPopularGames(limit);
      dispatch({
        type: GAME_ACTIONS.SET_POPULAR_GAMES,
        payload: popularGames
      });
      return popularGames;
    } catch (error) {
      setError('popularGames', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError]);

  const getGameById = useCallback(async (gameId) => {
    try {
      return await gameService.getGameById(gameId);
    } catch (error) {
      throw error;
    }
  }, []);

  const getGameCompetitions = useCallback(async (gameId, params = {}) => {
    try {
      return await gameService.getGameCompetitions(gameId, params);
    } catch (error) {
      throw error;
    }
  }, []);

  const getGameStats = useCallback(async (gameId) => {
    try {
      return await gameService.getGameStats(gameId);
    } catch (error) {
      throw error;
    }
  }, []);

  const setSelectedGame = useCallback((game) => {
    dispatch({
      type: GAME_ACTIONS.SET_SELECTED_GAME,
      payload: game
    });
  }, []);

  // Competition Actions
  const fetchMyCompetitions = useCallback(async () => {
    try {
      setLoading('myCompetitions', true);
      clearErrors('myCompetitions');
      const competitions = await competitionService.getMyCompetitions();
      dispatch({
        type: GAME_ACTIONS.SET_MY_COMPETITIONS,
        payload: competitions
      });
      return competitions;
    } catch (error) {
      setError('myCompetitions', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError]);

  const fetchParticipatedCompetitions = useCallback(async () => {
    try {
      setLoading('participatedCompetitions', true);
      clearErrors('participatedCompetitions');
      const competitions = await competitionService.getParticipatedCompetitions();
      dispatch({
        type: GAME_ACTIONS.SET_PARTICIPATED_COMPETITIONS,
        payload: competitions
      });
      return competitions;
    } catch (error) {
      setError('participatedCompetitions', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError]);

  const fetchPublicCompetitions = useCallback(async (params = {}) => {
    try {
      setLoading('publicCompetitions', true);
      clearErrors('publicCompetitions');
      const competitions = await competitionService.getPublicCompetitions(params);
      dispatch({
        type: GAME_ACTIONS.SET_PUBLIC_COMPETITIONS,
        payload: competitions
      });
      return competitions;
    } catch (error) {
      setError('publicCompetitions', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError]);

  const fetchGlobalLeaderboard = useCallback(async (limit = 10) => {
    try {
      setLoading('globalLeaderboard', true);
      clearErrors('globalLeaderboard');
      const leaderboard = await competitionService.getGlobalLeaderboard(limit);
      dispatch({
        type: GAME_ACTIONS.SET_GLOBAL_LEADERBOARD,
        payload: leaderboard
      });
      return leaderboard;
    } catch (error) {
      setError('globalLeaderboard', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError]);

  const createCompetition = useCallback(async (competitionData) => {
    try {
      setLoading('creatingCompetition', true);
      clearErrors('creatingCompetition');
      const newCompetition = await competitionService.createCompetition(competitionData);
      dispatch({
        type: GAME_ACTIONS.ADD_COMPETITION,
        payload: newCompetition
      });
      return newCompetition;
    } catch (error) {
      setError('creatingCompetition', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError]);

  const joinCompetitionByCode = useCallback(async (code) => {
    try {
      setLoading('joiningCompetition', true);
      clearErrors('joiningCompetition');
      const result = await competitionService.joinCompetitionByCode(code);
      setLoading('joiningCompetition', false);
      return result;
    } catch (error) {
      setError('joiningCompetition', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError]);

  const getCompetitionByCode = useCallback(async (code) => {
    try {
      return await competitionService.getCompetitionByCode(code);
    } catch (error) {
      throw error;
    }

  }, []);

  const submitScore = useCallback(async (competitionCode, scoreData) => {
    try {
      setLoading('submittingScore', true);
      clearErrors('submittingScore');
      const result = await competitionService.submitScore(competitionCode, scoreData);
      setLoading('submittingScore', false);
      return result;
    } catch (error) {
      setError('submittingScore', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError]);

  const completeCompetition = useCallback(async (code) => {
    try {
      setLoading('completingCompetition', true);
      clearErrors('completingCompetition');
      const result = await competitionService.completeCompetition(code);
      setLoading('completingCompetition', false);
      return result;
    } catch (error) {
      setError('completingCompetition', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError]);

  // Invite Actions
  const fetchPendingInvites = useCallback(async () => {
    try {
      setLoading('pendingInvites', true);
      clearErrors('pendingInvites');
      const invites = await competitionService.getPendingInvites();
      dispatch({
        type: GAME_ACTIONS.SET_PENDING_INVITES,
        payload: invites
      });
      return invites;
    } catch (error) {
      setError('pendingInvites', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError]);

  const fetchSentInvites = useCallback(async () => {
    try {
      setLoading('sentInvites', true);
      clearErrors('sentInvites');
      const invites = await competitionService.getSentInvites();
      dispatch({
        type: GAME_ACTIONS.SET_SENT_INVITES,
        payload: invites
      });
      return invites;
    } catch (error) {
      setError('sentInvites', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError]);

  const invitePlayerByUsername = useCallback(async (inviteData) => {
    try {
      setLoading('sendingInvite', true);
      clearErrors('sendingInvite');
      const result = await competitionService.invitePlayerByUsername(inviteData);
      setLoading('sendingInvite', false);
      // Refresh sent invites
      fetchSentInvites().catch(console.warn);
      return result;
    } catch (error) {
      setError('sendingInvite', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError, fetchSentInvites]);

  const acceptInvite = useCallback(async (inviteId) => {
    try {
      setLoading('acceptingInvite', true);
      clearErrors('acceptingInvite');
      const result = await competitionService.acceptInvite(inviteId);
      setLoading('acceptingInvite', false);

      // Remove from pending invites
      dispatch({
        type: GAME_ACTIONS.REMOVE_INVITE,
        payload: inviteId
      });

      // Refresh competitions
      fetchParticipatedCompetitions().catch(console.warn);
      return result;
    } catch (error) {
      setError('acceptingInvite', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError, fetchParticipatedCompetitions]);

  const declineInvite = useCallback(async (inviteId) => {
    try {
      setLoading('decliningInvite', true);
      clearErrors('decliningInvite');
      const result = await competitionService.declineInvite(inviteId);
      setLoading('decliningInvite', false);

      // Remove from pending invites
      dispatch({
        type: GAME_ACTIONS.REMOVE_INVITE,
        payload: inviteId
      });

      return result;
    } catch (error) {
      setError('decliningInvite', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError]);

  // Friends Actions
  const fetchFriends = useCallback(async () => {
    try {
      setLoading('friends', true);
      clearErrors('friends');
      const friends = await competitionService.getFriends();
      dispatch({
        type: GAME_ACTIONS.SET_FRIENDS,
        payload: friends
      });
      return friends;
    } catch (error) {
      setError('friends', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError]);

  const fetchFriendRequests = useCallback(async () => {
    try {
      setLoading('friendRequests', true);
      clearErrors('friendRequests');
      const requests = await competitionService.getFriendRequests();
      dispatch({
        type: GAME_ACTIONS.SET_FRIEND_REQUESTS,
        payload: requests
      });
      return requests;
    } catch (error) {
      setError('friendRequests', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError]);

  const sendFriendRequest = useCallback(async (requestData) => {
    try {
      setLoading('sendingFriendRequest', true);
      clearErrors('sendingFriendRequest');
      const result = await competitionService.sendFriendRequest(requestData);
      setLoading('sendingFriendRequest', false);
      // Refresh friend requests
      fetchFriendRequests().catch(console.warn);
      return result;
    } catch (error) {
      setError('sendingFriendRequest', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError, fetchFriendRequests]);

  const acceptFriendRequest = useCallback(async (requestId) => {
    try {
      setLoading('acceptingFriendRequest', true);
      clearErrors('acceptingFriendRequest');
      const result = await competitionService.acceptFriendRequest(requestId);
      setLoading('acceptingFriendRequest', false);

      // Remove from friend requests
      dispatch({
        type: GAME_ACTIONS.UPDATE_FRIEND_REQUESTS,
        payload: requestId
      });

      // Refresh friends list
      fetchFriends().catch(console.warn);
      return result;
    } catch (error) {
      setError('acceptingFriendRequest', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError, fetchFriends]);

  const declineFriendRequest = useCallback(async (requestId) => {
    try {
      setLoading('decliningFriendRequest', true);
      clearErrors('decliningFriendRequest');
      const result = await competitionService.declineFriendRequest(requestId);
      setLoading('decliningFriendRequest', false);

      // Remove from friend requests
      dispatch({
        type: GAME_ACTIONS.UPDATE_FRIEND_REQUESTS,
        payload: requestId
      });

      return result;
    } catch (error) {
      setError('decliningFriendRequest', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError]);

  // Game History
  const fetchGameHistory = useCallback(async () => {
    try {
      setLoading('gameHistory', true);
      clearErrors('gameHistory');
      const history = await competitionService.getGameHistory();
      dispatch({
        type: GAME_ACTIONS.SET_GAME_HISTORY,
        payload: history
      });
      return history;
    } catch (error) {
      setError('gameHistory', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError]);

  // Update competition in state (for real-time updates)
  const updateCompetition = useCallback((updatedCompetition) => {
    dispatch({
      type: GAME_ACTIONS.UPDATE_COMPETITION,
      payload: updatedCompetition
    });
  }, []);

  // Socket event handlers for real-time updates
  const handleSocketEvents = useCallback((socket) => {
    if (!socket) return;

    // Competition updates
    socket.on('leaderboard:update', (data) => {
      // You can dispatch an action to update specific competition leaderboard
      // console.log('Leaderboard updated:', data);
    });

    socket.on('competition_joined', (data) => {
      // console.log('Someone joined competition:', data);
      // Refresh competitions if needed
    });

    socket.on('score_submitted', (data) => {
      // console.log('Score submitted:', data);
      // Could trigger a leaderboard refresh or show notification
    });

    // Invite events
    socket.on('new_invite', (data) => {
      // console.log('New invite received:', data);
      fetchPendingInvites().catch(console.warn);
    });

    socket.on('invite_accepted', (data) => {
      // console.log('Invite accepted:', data);
      fetchSentInvites().catch(console.warn);
    });

    socket.on('invite_declined', (data) => {
      // console.log('Invite declined:', data);
      fetchSentInvites().catch(console.warn);
    });

    // Friend events
    socket.on('new_friend_request', (data) => {
      // console.log('New friend request:', data);
      fetchFriendRequests().catch(console.warn);
    });

    socket.on('friend_request_accepted', (data) => {
      // console.log('Friend request accepted:', data);
      fetchFriends().catch(console.warn);
    });

    return () => {
      // Cleanup listeners
      socket.off('leaderboard:update');
      socket.off('competition_joined');
      socket.off('score_submitted');
      socket.off('new_invite');
      socket.off('invite_accepted');
      socket.off('invite_declined');
      socket.off('new_friend_request');
      socket.off('friend_request_accepted');
    };
  }, [fetchPendingInvites, fetchSentInvites, fetchFriendRequests, fetchFriends]);

  // NEW: Leave competition
  const leaveCompetition = useCallback(async (code) => {
    try {
      setLoading('leavingCompetition', true);
      clearErrors('leavingCompetition');
      const result = await competitionService.leaveCompetition(code);
      setLoading('leavingCompetition', false);

      // Refresh competitions after leaving
      await Promise.all([
        fetchMyCompetitions().catch(console.warn),
        fetchParticipatedCompetitions().catch(console.warn)
      ]);

      return result;
    } catch (error) {
      setError('leavingCompetition', error.message);
      throw error;
    }
  }, [setLoading, clearErrors, setError, fetchMyCompetitions, fetchParticipatedCompetitions]);

  // NEW: Get time remaining
  const getTimeRemaining = useCallback(async (code) => {
    try {
      return await competitionService.getTimeRemaining(code);
    } catch (error) {
      throw error;
    }
  }, []);


  // Context value
  const value = {
    // State
    ...state,

    // Game Actions
    fetchGames,
    fetchGameTypes,
    fetchPopularGames,
    getGameById,
    getGameCompetitions,
    getGameStats,
    setSelectedGame,

    // Competition Actions
    fetchMyCompetitions,
    fetchParticipatedCompetitions,
    fetchPublicCompetitions,
    fetchGlobalLeaderboard,
    createCompetition,
    joinCompetitionByCode,
    getCompetitionByCode,
    submitScore,
    completeCompetition,
    updateCompetition,

    // Invite Actions
    fetchPendingInvites,
    fetchSentInvites,
    invitePlayerByUsername,
    acceptInvite,
    declineInvite,

    // Friends & Social Actions
    fetchFriends,
    fetchFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    fetchGameHistory,

    // Socket handler
    handleSocketEvents,

    // Utility Actions
    clearErrors,

    // Deprecated methods for backward compatibility
    fetchUserCompetitions: fetchParticipatedCompetitions,
    fetchCompetitions: fetchPublicCompetitions,
    joinCompetition: joinCompetitionByCode,

    leaveCompetition,      // ADD THIS
    getTimeRemaining
  };

  // Load initial data
useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      if (!mounted) return;

      try {
        // Load core data first (no auth required)
        await Promise.all([
          fetchGames().catch(err => console.warn('Could not load games:', err)),
          fetchGameTypes().catch(err => console.warn('Could not load game types:', err)),
          fetchPopularGames().catch(err => console.warn('Could not load popular games:', err)),
          fetchPublicCompetitions().catch(err => console.warn('Could not load public competitions:', err))
        ]);

        if (isAuthenticated && !authLoading) {
          await Promise.all([
            fetchMyCompetitions().catch(err => console.warn('Could not load my competitions:', err)),
            fetchParticipatedCompetitions().catch(err => console.warn('Could not load participated competitions:', err)),
            fetchGlobalLeaderboard().catch(err => console.warn('Could not load global leaderboard:', err)),
            fetchFriends().catch(err => console.warn('Could not load friends:', err)),
            fetchFriendRequests().catch(err => console.warn('Could not load friend requests:', err)),
            fetchGameHistory().catch(err => console.warn('Could not load game history:', err)),
            fetchPendingInvites().catch(err => console.warn('Could not load pending invites:', err)),
            fetchSentInvites().catch(err => console.warn('Could not load sent invites:', err))
          ])
        }

      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - runs only once

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export default GameContext;
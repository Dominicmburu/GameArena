import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { gameService, competitionService } from '../services/gameService';

// Initial state
const initialState = {
  games: [],
  gameTypes: [],
  popularGames: [],
  myCompetitions: [],
  participatedCompetitions: [],
  selectedGame: null,
  loading: {
    games: false,
    gameTypes: false,
    popularGames: false,
    myCompetitions: false,
    participatedCompetitions: false,
    creatingCompetition: false
  },
  errors: {
    games: null,
    gameTypes: null,
    popularGames: null,
    myCompetitions: null,
    participatedCompetitions: null,
    creatingCompetition: null
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
  SET_SELECTED_GAME: 'SET_SELECTED_GAME',
  ADD_COMPETITION: 'ADD_COMPETITION',
  UPDATE_COMPETITION: 'UPDATE_COMPETITION',
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

    case GAME_ACTIONS.SET_SELECTED_GAME:
      return {
        ...state,
        selectedGame: action.payload
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
        )
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

  // Helper function to set loading state
  const setLoading = useCallback((key, value) => {
    dispatch({
      type: GAME_ACTIONS.SET_LOADING,
      payload: { key, value }
    });
  }, []);

  // Helper function to set error state
  const setError = useCallback((key, value) => {
    dispatch({
      type: GAME_ACTIONS.SET_ERROR,
      payload: { key, value }
    });
  }, []);

  // Clear errors
  const clearErrors = useCallback((key = null) => {
    dispatch({
      type: GAME_ACTIONS.CLEAR_ERRORS,
      payload: key
    });
  }, []);

  // Fetch all games
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

  // Fetch game types
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

  // Fetch popular games
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

  // Fetch my competitions
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

  // Fetch participated competitions
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

  // Get game by ID
  const getGameById = useCallback(async (gameId) => {
    try {
      return await gameService.getGameById(gameId);
    } catch (error) {
      throw error;
    }
  }, []);

  // Get game competitions
  const getGameCompetitions = useCallback(async (gameId, params = {}) => {
    try {
      return await gameService.getGameCompetitions(gameId, params);
    } catch (error) {
      throw error;
    }
  }, []);

  // Get game statistics
  const getGameStats = useCallback(async (gameId) => {
    try {
      return await gameService.getGameStats(gameId);
    } catch (error) {
      throw error;
    }
  }, []);

  // Create competition
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

  // Join competition
  const joinCompetition = useCallback(async (code) => {
    try {
      const result = await competitionService.joinCompetition(code);
      // Optionally refresh competitions
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  // Mark player ready
  const markPlayerReady = useCallback(async (code) => {
    try {
      return await competitionService.markPlayerReady(code);
    } catch (error) {
      throw error;
    }
  }, []);

  // Submit score
  const submitScore = useCallback(async (code, score) => {
    try {
      return await competitionService.submitScore(code, score);
    } catch (error) {
      throw error;
    }
  }, []);

  // Complete competition
  const completeCompetition = useCallback(async (code) => {
    try {
      return await competitionService.completeCompetition(code);
    } catch (error) {
      throw error;
    }
  }, []);

  // Get competition by code
  const getCompetitionByCode = useCallback(async (code) => {
    try {
      return await competitionService.getCompetitionByCode(code);
    } catch (error) {
      throw error;
    }
  }, []);

  // Set selected game
  const setSelectedGame = useCallback((game) => {
    dispatch({
      type: GAME_ACTIONS.SET_SELECTED_GAME,
      payload: game
    });
  }, []);

  // Update competition in state
  const updateCompetition = useCallback((updatedCompetition) => {
    dispatch({
      type: GAME_ACTIONS.UPDATE_COMPETITION,
      payload: updatedCompetition
    });
  }, []);

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    fetchGames,
    fetchGameTypes,
    fetchPopularGames,
    fetchMyCompetitions,
    fetchParticipatedCompetitions,
    getGameById,
    getGameCompetitions,
    getGameStats,
    createCompetition,
    joinCompetition,
    markPlayerReady,
    submitScore,
    completeCompetition,
    getCompetitionByCode,
    setSelectedGame,
    updateCompetition,
    clearErrors
  };

  // Load initial data - use a separate effect with no dependencies to run only once
  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      try {
        await Promise.all([
          fetchGames(),
          fetchGameTypes(),
          fetchPopularGames()
        ]);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    if (mounted) {
      loadInitialData();
    }

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
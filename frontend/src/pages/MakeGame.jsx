import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Badge, Modal, Alert, ProgressBar } from 'react-bootstrap'
import { Plus, Gamepad2, Users, Clock, DollarSign, Lock, Globe, Calendar, Trophy, Settings, CheckCircle, AlertTriangle, Play } from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import { useAuth } from '../contexts/AuthContext'

const MakeGame = () => {
  const {
    games,
    myCompetitions,
    publicCompetitions,
    loading,
    errors,
    fetchMyCompetitions,
    createCompetition,
    setSelectedGame,
    clearErrors
  } = useGame()

  const { user } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [selectedGameState, setSelectedGameState] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [createdCompetitionTitle, setCreatedCompetitionTitle] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    gameId: '',
    minutesToPlay: '',
    maxPlayers: '',
    entryFee: ''
  })

  // Load my competitions on mount
  useEffect(() => {
    if (user) {
      fetchMyCompetitions()
    }
  }, [user, fetchMyCompetitions])

  // Map game difficulty levels
  const getDifficultyColor = (difficulty) => {
    const level = typeof difficulty === 'string' ? difficulty.toLowerCase() : ''
    switch (level) {
      case 'beginner': return '#00FF85'
      case 'intermediate': return '#00F0FF'
      case 'advanced': return '#9B00FF'
      case 'expert': return '#FF003C'
      default: return '#B0B0B0'
    }
  }

  // Convert API game data to display format
  const formatGameForDisplay = (game) => ({
    id: game.id,
    name: game.name,
    description: game.description,
    category: game.gameType || 'Action',
    difficulty: game.level || 'Intermediate',
    icon: game.imageUrl,
    players: game.playerRange || 0,
    avgDuration: game.playTimeRange,
    popular: game.isPopular || false,
    thumbnail: game.imageUrl,
    features: ['Competitive gameplay', 'Real-time scoring', 'Multiplayer support'],
    minPlayers: game.minPlayers,
    maxPlayersLimit: game.maxPlayers,
    minEntryFee: game.minEntryFee || 0
  })

  // Extract max time from duration string (e.g., "5-15 min" -> 15)
  const extractMaxTime = (duration) => {
    if (!duration || typeof duration !== 'string') return 10
    
    // Match patterns like "5-15 min", "10 min", "5-15", etc.
    const match = duration.match(/(\d+)-(\d+)/)
    if (match) {
      return parseInt(match[2]) // Return the max value
    }
    
    // If no range found, try to extract single number
    const singleMatch = duration.match(/(\d+)/)
    if (singleMatch) {
      return parseInt(singleMatch[1])
    }
    
    return 10 // Default fallback
  }

  // Handle game selection
  const handleGameSelect = (game) => {
    const formattedGame = formatGameForDisplay(game)
    const maxTime = extractMaxTime(formattedGame.avgDuration)
    
    setSelectedGameState(formattedGame)
    setSelectedGame(formattedGame)
    setFormData(prev => ({
      ...prev,
      gameId: game.id,
      minutesToPlay: maxTime.toString(),
      maxPlayers: formattedGame.maxPlayersLimit || '4',
      entryFee: formattedGame.minEntryFee || '0'
    }))
    setShowCreateModal(true)
  }

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear field-specific errors
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  // Form validation
  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Tournament title is required'
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }

    if (!formData.gameId) {
      newErrors.gameId = 'Game selection is required'
    }

    if (!formData.maxPlayers || formData.maxPlayers < 2) {
      newErrors.maxPlayers = 'Must allow at least 2 players'
    }

    if (selectedGameState && formData.maxPlayers > selectedGameState.maxPlayersLimit) {
      newErrors.maxPlayers = `Maximum ${selectedGameState.maxPlayersLimit} players for this game`
    }

    if (formData.entryFee && parseFloat(formData.entryFee) < 0) {
      newErrors.entryFee = 'Entry fee cannot be negative'
    }

    if (!formData.minutesToPlay || formData.minutesToPlay < 1) {
      newErrors.minutesToPlay = 'Game duration must be at least 1 minute'
    }

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateCompetition = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const competitionData = {
        title: formData.title,
        gameId: formData.gameId,
        minutesToPlay: parseInt(formData.minutesToPlay),
        maxPlayers: parseInt(formData.maxPlayers),
        entryFee: parseFloat(formData.entryFee) || 0
      }

      await createCompetition(competitionData)

      setCreatedCompetitionTitle(formData.title)
      setShowCreateModal(false)
      resetForm()
      setShowSuccessModal(true)

    } catch (error) {
      console.error('Failed to create competition:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      gameId: '',
      minutesToPlay: '',
      maxPlayers: '',
      entryFee: ''
    })
    setSelectedGameState(null)
    setSelectedGame(null)
    setFormErrors({})
  }

  const calculateEstimatedPrize = () => {
    const entryFee = parseFloat(formData.entryFee) || 0
    const maxPlayers = parseInt(formData.maxPlayers) || 0
    return entryFee * maxPlayers * 0.9 // 10% platform fee
  }

  return (
    <div className="makegame-page animated-bg">
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="page-header cyber-card p-4">
              <h1 className="cyber-text text-neon mb-2">
                <Plus size={32} className="me-3" />
                Create Competition
              </h1>
              <p className="text-white mb-0">Choose a game and set up your own tournament</p>
            </div>
          </Col>
        </Row>

        {/* Game Selection Grid */}
        <Row className="mb-4">
          <Col>
            <h3 className="cyber-text text-white mb-3">Select a Game</h3>
          </Col>
        </Row>

        {loading.games ? (
          <Row>
            <Col>
              <div className="text-center text-white">
                Loading games...
              </div>
            </Col>
          </Row>
        ) : errors.games ? (
          <Row>
            <Col>
              <Alert variant="danger">
                <AlertTriangle size={16} className="me-2" />
                Failed to load games: {errors.games}
              </Alert>
            </Col>
          </Row>
        ) : (
          <Row>
            {games.map(game => {
              const formattedGame = formatGameForDisplay(game)
              return (
                <Col lg={4} md={6} key={game.id} className="mb-4">
                  <Card
                    className="cyber-card h-100 game-card cursor-pointer"
                    onClick={() => handleGameSelect(game)}
                    style={{
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    {formattedGame.popular && (
                      <div
                        className="popular-badge position-absolute"
                        style={{
                          top: '15px',
                          right: '15px',
                          background: 'linear-gradient(45deg, #00FF85, #00F0FF)',
                          color: '#0E0E10',
                          padding: '4px 12px',
                          borderRadius: '15px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          zIndex: 10
                        }}
                      >
                        POPULAR
                      </div>
                    )}

                    <Card.Body className="text-center p-4">
                      <div className="game-icon mb-3" style={{ height: '4rem' }}>
                        <img
                          src={formattedGame.thumbnail}
                          alt={`${formattedGame.name || 'Game'} icon`}
                          className="img-fluid"
                          style={{ maxHeight: '4rem', objectFit: 'contain' }}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://placehold.co/64x64?text=Game';
                          }}
                        />
                      </div>

                      <h4 className="text-white mb-2">{game.name}</h4>
                      <p className="text-white mb-3">{game.description}</p>

                      <div className="game-details mb-3">
                        <Badge
                          className="me-2 mb-2"
                          style={{
                            background: getDifficultyColor(game.level),
                            color: '#0E0E10'
                          }}
                        >
                          {game.level || 'Intermediate'}
                        </Badge>
                        <Badge className="me-2 mb-2" style={{ background: '#9B00FF' }}>
                          {game.gameType || 'Action'}
                        </Badge>
                      </div>

                      <div className="game-stats">
                        <Row className="g-2 text-center">
                          <Col xs={4}>
                            <div className="stat-item">
                              <Users size={16} color="#00F0FF" className="mb-1" />
                              <div className="stat-value text-neon small">{formattedGame.players}</div>
                            </div>
                          </Col>
                          <Col xs={8}>
                            <div className="stat-item">
                              <Clock size={16} color="#9B00FF" className="mb-1" />
                              <div className="stat-value text-purple small">{formattedGame.avgDuration}</div>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Card.Body>

                    <Card.Footer
                      className="text-center"
                      style={{ background: 'rgba(0, 240, 255, 0.1)' }}
                    >
                      <Button className="btn-cyber w-100">
                        <Plus size={18} className="me-2" />
                        Create Tournament
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              )
            })}
          </Row>
        )}

        {/* Quick Stats */}
        <Row className="mt-5">
          <Col>
            <h3 className="cyber-text text-white mb-3">Tournament Statistics</h3>
          </Col>
        </Row>

        <Row>
          <Col md={3} sm={6} className="mb-3">
            <div className="stat-card cyber-card p-3 text-center h-100">
              <Trophy size={30} color="#00F0FF" className="mb-2" />
              <h4 className="text-neon fw-bold">{myCompetitions.length}</h4>
              <small className="text-white">Tournaments Created</small>
            </div>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <div className="stat-card cyber-card p-3 text-center h-100">
              <Users size={30} color="#9B00FF" className="mb-2" />
              <h4 className="text-purple fw-bold">
                {myCompetitions.reduce((total, comp) => total + (comp.participants?.length || 0), 0)}
              </h4>
              <small className="text-white">Total Participants</small>
            </div>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <div className="stat-card cyber-card p-3 text-center h-100">
              <DollarSign size={30} color="#00FF85" className="mb-2" />
              <h4 className="text-energy-green fw-bold">
                ${myCompetitions.reduce((total, comp) =>
                  total + (comp.entryFee * (comp.participants?.length || 0) * 0.9), 0
                ).toFixed(0)}
              </h4>
              <small className="text-white">Prize Money Distributed</small>
            </div>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <div className="stat-card cyber-card p-3 text-center h-100">
              <Gamepad2 size={30} color="#FF003C" className="mb-2" />
              <h4 className="text-cyber-red fw-bold">{games.length}</h4>
              <small className="text-white">Available Games</small>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Create Competition Modal - SIMPLIFIED */}
      <Modal
        show={showCreateModal}
        onHide={() => {
          setShowCreateModal(false)
          resetForm()
        }}
        size="lg"
        className="cyber-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <Settings size={24} className="me-2 text-neon" />
            Create {selectedGameState?.name} Tournament
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {errors.creatingCompetition && (
            <Alert variant="danger" className="mb-3">
              <AlertTriangle size={16} className="me-2" />
              {errors.creatingCompetition}
            </Alert>
          )}

          <Form onSubmit={handleCreateCompetition}>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Tournament Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    className='text-white'
                    value={formData.title ?? ''}
                    onChange={handleInputChange}
                    placeholder="Enter tournament name"
                    isInvalid={!!formErrors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.title}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Game Duration (minutes) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="minutesToPlay"
                    value={formData.minutesToPlay ?? ''}
                    onChange={handleInputChange}
                    placeholder="10"
                    min="1"
                    max="180"
                    isInvalid={!!formErrors.minutesToPlay}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.minutesToPlay}
                  </Form.Control.Feedback>
                  {selectedGameState && selectedGameState.avgDuration && (
                    <Form.Text className="text-white">
                      Game time limit: {selectedGameState.avgDuration}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Max Players *</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxPlayers"
                    value={formData.maxPlayers ?? ''}
                    onChange={handleInputChange}
                    placeholder="4"
                    min="2"
                    max={selectedGameState?.maxPlayersLimit || 1000}
                    isInvalid={!!formErrors.maxPlayers}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.maxPlayers}
                  </Form.Control.Feedback>
                  {selectedGameState && (
                    <Form.Text className="text-white">
                      Max {selectedGameState.maxPlayersLimit} for {selectedGameState.name}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Entry Fee ($) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="entryFee"
                    value={formData.entryFee ?? ''}
                    onChange={handleInputChange}
                    placeholder="100"
                    min="0"
                    step="0.01"
                    isInvalid={!!formErrors.entryFee}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.entryFee}
                  </Form.Control.Feedback>
                  {selectedGameState?.minEntryFee > 0 && (
                    <Form.Text className="text-white">
                      Minimum ${selectedGameState.minEntryFee} for this game
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <div className="prize-preview cyber-card p-3 h-100 d-flex flex-column justify-content-center">
                  <div className="text-center">
                    <Trophy size={24} color="#00FF85" className="mb-2" />
                    <div className="text-white small">Estimated Prize Pool</div>
                    <div className="text-energy-green fw-bold h5 mb-0">
                      ${calculateEstimatedPrize().toFixed(2)}
                    </div>
                    <small className="text-muted">After platform fee</small>
                  </div>
                </div>
              </Col>
            </Row>

            {Object.keys(formErrors).length > 0 && (
              <Alert variant="danger" className="mt-3">
                <AlertTriangle size={16} className="me-2" />
                Please fix the errors above before creating the tournament.
              </Alert>
            )}
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setShowCreateModal(false)
              resetForm()
            }}
            disabled={loading.creatingCompetition}
          >
            Cancel
          </Button>

          <Button
            className="btn-cyber"
            onClick={handleCreateCompetition}
            disabled={loading.creatingCompetition || Object.keys(formErrors).length > 0}
          >
            {loading.creatingCompetition ? (
              <>
                <div className="loading-spinner me-2" style={{ width: '16px', height: '16px' }} />
                Creating...
              </>
            ) : (
              <>
                <Trophy size={18} className="me-2" />
                Create Tournament
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Success Modal - Gaming Style */}
      <Modal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        centered
      >
        <Modal.Body className="text-center p-5">
          <div className="success-animation mb-4">
            <CheckCircle size={80} color="#00FF85" className="success-icon" />
          </div>
          
          <h2 className="text-energy-green mb-3 cyber-text">
            TOURNAMENT CREATED
          </h2>
          
          <div className="success-message mb-4">
            <h4 className="mb-2" style={{
                  fontSize: '1.8rem',
                  background: 'linear-gradient(45deg, #00F0FF, #9B00FF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>"{createdCompetitionTitle}"</h4>
            <p className="text-white mb-3">
              Your tournament is now <span className="text-energy-green fw-bold">LIVE</span> and ready for action!
            </p>
            
            <div className="cyber-divider my-4"></div>
          </div>
          
          <div className="action-buttons d-flex gap-3 justify-content-center">
            <Button
              className="btn"
              onClick={() => {
                setShowSuccessModal(false)
                window.location.href = '/play'
              }}
            >
              <Play size={20} className="me-2" />
              LET'S PLAY!
            </Button>
            
            <Button
              variant="outline-secondary"
              onClick={() => setShowSuccessModal(false)}
              className="btn-outline-cyber"
            >
              Stay Here
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <style jsx>{`
        .game-card {
          transition: all 0.3s ease;
        }

        .game-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 40px rgba(0, 240, 255, 0.2);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .cyber-modal .modal-content {
          background: rgba(31, 31, 35, 0.95) !important;
          border: 1px solid rgba(0, 240, 255, 0.3) !important;
          backdrop-filter: blur(10px);
        }

        .cyber-modal .modal-header {
          border-bottom: 1px solid rgba(0, 240, 255, 0.3) !important;
        }

        .cyber-modal .modal-footer {
          border-top: 1px solid rgba(0, 240, 255, 0.3) !important;
        }

        .cyber-modal .form-control::placeholder {
          color: #6c757d !important;
          opacity: 1 !important;
        }

        .cyber-modal .form-control::-webkit-input-placeholder {
          color: #6c757d !important;
        }

        .cyber-modal .form-control::-moz-placeholder {
          color: #6c757d !important;
        }

        .cyber-modal .form-control:-ms-input-placeholder {
          color: #6c757d !important;
        }

        .success-modal .modal-content {
          background: rgba(20, 30, 25, 0.95) !important;
          border: 2px solid rgba(0, 255, 133, 0.5) !important;
        }

        .success-animation {
          animation: successPulse 2s ease-in-out infinite;
        }

        @keyframes successPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .success-icon {
          filter: drop-shadow(0 0 20px rgba(0, 255, 133, 0.5));
        }

        .cyber-divider {
          height: 2px;
          background: linear-gradient(90deg, transparent, #00FF85, transparent);
          width: 100%;
        }

        .btn-cyber-success {
          background: linear-gradient(45deg, #00FF85, #00F0FF) !important;
          border: none !important;
          color: #0E0E10 !important;
          font-weight: bold !important;
          padding: 12px 30px !important;
          border-radius: 8px !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 0 20px rgba(0, 255, 133, 0.3) !important;
        }

        .btn-cyber-success:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 5px 25px rgba(0, 255, 133, 0.5) !important;
        }

        .btn-outline-cyber {
          border: 2px solid rgba(0, 240, 255, 0.5) !important;
          color: #00F0FF !important;
          background: transparent !important;
          transition: all 0.3s ease !important;
        }

        .btn-outline-cyber:hover {
          background: rgba(0, 240, 255, 0.1) !important;
          border-color: #00F0FF !important;
          color: #00F0FF !important;
        }

        .prize-preview {
          background: rgba(0, 255, 133, 0.05) !important;
          border: 1px solid rgba(0, 255, 133, 0.2) !important;
        }

        .stat-card {
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-3px);
        }

        .loading-spinner {
          border: 2px solid transparent;
          border-top: 2px solid #00F0FF;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default MakeGame
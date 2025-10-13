import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Badge, Modal, Alert, ProgressBar } from 'react-bootstrap'
import { Plus, Gamepad2, Users, Clock, DollarSign, Lock, Globe, Calendar, Trophy, Settings, CheckCircle, AlertTriangle, Play, Info } from 'lucide-react'
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

  console.log('Games:', games)

  const { user } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [selectedGameState, setSelectedGameState] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [createdCompetitionTitle, setCreatedCompetitionTitle] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    gameId: '',
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
    players: game.playerRange,
    popular: game.isPopular || false,
    thumbnail: game.imageUrl,
    features: ['Competitive gameplay', 'Real-time scoring', 'Multiplayer support'],
    minPlayers: game.minPlayers,
    maxPlayersLimit: game.maxPlayers,
    minEntryFee: game.minEntryFee || 0
  })

  // Handle game selection
  const handleGameSelect = (game) => {
    const formattedGame = formatGameForDisplay(game)
    
    setSelectedGameState(formattedGame)
    setSelectedGame(formattedGame)
    setFormData(prev => ({
      ...prev,
      gameId: game.id,
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

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProceedToConfirm = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Show confirmation modal
    setShowCreateModal(false)
    setShowConfirmModal(true)
  }

  const handleCreateCompetition = async () => {
    try {
      const competitionData = {
        title: formData.title,
        gameId: formData.gameId,
        maxPlayers: parseInt(formData.maxPlayers),
        entryFee: parseFloat(formData.entryFee) || 0
      }

      await createCompetition(competitionData)

      setCreatedCompetitionTitle(formData.title)
      setShowConfirmModal(false)
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
    return entryFee * maxPlayers * 0.85 // 15% platform fee, 85% goes to prize pool
  }

  const calculateTotalDeduction = () => {
    const entryFee = parseFloat(formData.entryFee) || 0
    return entryFee // Entry fee deducted from creator's account
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
                          <Col xs={6}>
                            <div className="stat-item">
                              <Users size={16} color="#00F0FF" className="mb-1" />
                              <div className="stat-value text-neon small">{formattedGame.players}</div>
                            </div>
                          </Col>
                          <Col xs={6}>
                            <div className="stat-item">
                              <Gamepad2 size={16} color="#9B00FF" className="mb-1" />
                              <div className="stat-value text-purple small">{formattedGame.category}</div>
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
                {myCompetitions.reduce((total, comp) => total + (comp.totalPlayers || 0), 0)}
              </h4>
              <small className="text-white">Total Participants</small>
            </div>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <div className="stat-card cyber-card p-3 text-center h-100">
              <DollarSign size={30} color="#00FF85" className="mb-2" />
              <h4 className="text-energy-green fw-bold">
                ${myCompetitions.reduce((total, comp) =>
                  total + comp.totalPrizePool, 0
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

      {/* Create Competition Modal - Setup Form */}
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

          <Form onSubmit={handleProceedToConfirm}>
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
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Entry Fee ($) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="entryFee"
                    value={formData.entryFee ?? ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
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
            </Row>

            {Object.keys(formErrors).length > 0 && (
              <Alert variant="danger" className="mt-3">
                <AlertTriangle size={16} className="me-2" />
                Please fix the errors above before proceeding.
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
          >
            Cancel
          </Button>

          <Button
            className="btn-cyber"
            onClick={handleProceedToConfirm}
            disabled={Object.keys(formErrors).length > 0}
          >
            <Trophy size={18} className="me-2" />
            Next: Review & Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirmation Modal - Review & Confirm */}
      <Modal
        show={showConfirmModal}
        onHide={() => {
          setShowConfirmModal(false)
          setShowCreateModal(true)
        }}
        size="lg"
        className="cyber-modal confirm-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <Info size={24} className="me-2 text-energy-green" />
            Confirm Tournament Creation
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="confirmation-content">
            {/* Tournament Details */}
            <div className="mb-4 p-3 cyber-card" style={{ background: 'rgba(0, 240, 255, 0.08)' }}>
              <h5 className="text-neon mb-3">
                <Trophy size={20} className="me-2 mb-1" style={{ display: 'inline' }} />
                Tournament Details
              </h5>
              <Row className="g-3">
                <Col md={6}>
                  <div className="detail-item">
                    <small className="text-white-50">Tournament Name</small>
                    <div className="text-white fw-bold">{formData.title}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-item">
                    <small className="text-white-50">Game</small>
                    <div className="text-white fw-bold">{selectedGameState?.name}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-item">
                    <small className="text-white-50">Max Players</small>
                    <div className="text-white fw-bold">{formData.maxPlayers}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-item">
                    <small className="text-white-50">Game Type</small>
                    <div className="text-white fw-bold">{selectedGameState?.category}</div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Game Rules */}
            <div className="mb-4 p-3 cyber-card" style={{ background: 'rgba(155, 0, 255, 0.08)' }}>
              <h5 className="text-purple mb-3">
                <AlertTriangle size={20} className="me-2 mb-1" style={{ display: 'inline' }} />
                Game Rules & Information
              </h5>
              <div className="rules-content text-white">
                <p className="mb-2"><strong>Game Name:</strong> {selectedGameState?.name}</p>
                <p className="mb-2"><strong>Difficulty:</strong> {selectedGameState?.difficulty}</p>
                <p className="mb-2"><strong>Category:</strong> {selectedGameState?.category}</p>
                <p className="mb-2"><strong>Player Range:</strong> {selectedGameState?.players}</p>
                <p className="mb-3"><strong>Description:</strong> {selectedGameState?.description}</p>
                
                <div className="alert alert-info p-2" style={{ background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
                  <small className="text-white">
                    <strong>Competition Format:</strong> Players will compete in this tournament with real-time scoring. 
                    The winner is determined by the highest score. Prizes are distributed according to the placement ranking.
                  </small>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="mb-4 p-3 cyber-card" style={{ background: 'rgba(0, 255, 133, 0.08)' }}>
              <h5 className="text-energy-green mb-3">
                <DollarSign size={20} className="me-2 mb-1" style={{ display: 'inline' }} />
                Financial Summary
              </h5>
              <Row className="g-3">
                <Col md={6}>
                  <div className="financial-item">
                    <small className="text-white-50">Entry Fee (per player)</small>
                    <div className="text-white fw-bold">${parseFloat(formData.entryFee).toFixed(2)}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="financial-item">
                    <small className="text-white-50">Your Deduction</small>
                    <div className="text-cyber-red fw-bold">${calculateTotalDeduction().toFixed(2)}</div>
                  </div>
                </Col>
                <Col md={12}>
                  <hr style={{ borderColor: 'rgba(0, 255, 133, 0.3)' }} className="my-2" />
                </Col>
                <Col md={6}>
                  <div className="financial-item">
                    <small className="text-white-50">Prize Pool Contribution</small>
                    <div className="text-neon fw-bold">85% of total entry fees</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="financial-item">
                    <small className="text-white-50">Platform Fee</small>
                    <div className="text-white-50 fw-bold">15% of each entry</div>
                  </div>
                </Col>
              </Row>

              <div className="alert alert-warning p-2 mt-3" style={{ background: 'rgba(255, 0, 60, 0.1)', border: '1px solid rgba(255, 0, 60, 0.3)' }}>
                <small className="text-white">
                  <strong>Important:</strong> ${calculateTotalDeduction().toFixed(2)} will be deducted from your wallet immediately upon creation. 
                  This covers your entry as the tournament creator.
                </small>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="p-3 cyber-card" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="agreeTerms" />
                <label className="form-check-label text-white-50 small" htmlFor="agreeTerms">
                  I understand the rules, fees, and terms. I confirm that I have sufficient funds and wish to create this tournament.
                </label>
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setShowConfirmModal(false)
              setShowCreateModal(true)
            }}
            disabled={loading.creatingCompetition}
          >
            Edit Details
          </Button>

          <Button
            className="btn-cyber"
            onClick={handleCreateCompetition}
            disabled={loading.creatingCompetition}
          >
            {loading.creatingCompetition ? (
              <>
                <div className="loading-spinner me-2" style={{ width: '16px', height: '16px' }} />
                Creating...
              </>
            ) : (
              <>
                <Trophy size={18} className="me-2" />
                Create Tournament Now
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

        .cyber-modal .form-control {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(0, 240, 255, 0.2) !important;
          color: #fff !important;
        }

        .cyber-modal .form-control::placeholder {
          color: #6c757d !important;
          opacity: 1 !important;
        }

        .detail-item {
          padding: 8px 0;
        }

        .financial-item {
          padding: 8px 0;
        }

        .confirmation-content {
          max-height: 600px;
          overflow-y: auto;
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

        .btn-cyber {
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

        .btn-cyber:hover {
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
          display: inline-block;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .confirm-modal .modal-body {
          background: rgba(14, 14, 16, 0.8);
        }

        .cyber-card {
          background: rgba(31, 31, 35, 0.5);
          border: 1px solid rgba(0, 240, 255, 0.2);
          border-radius: 8px;
        }

        .text-neon {
          color: #00FF85;
        }

        .text-purple {
          color: #9B00FF;
        }

        .text-energy-green {
          color: #00FF85;
        }

        .text-cyber-red {
          color: #FF003C;
        }

        .text-white-50 {
          color: rgba(255, 255, 255, 0.5);
        }

        .form-check-input {
          border: 1px solid rgba(0, 240, 255, 0.3);
          background: rgba(0, 240, 255, 0.05);
          cursor: pointer;
        }

        .form-check-input:checked {
          background: #00FF85;
          border-color: #00FF85;
        }

        .alert-info {
          background: rgba(0, 240, 255, 0.1) !important;
          border: 1px solid rgba(0, 240, 255, 0.3) !important;
          color: #00F0FF !important;
        }

        .alert-warning {
          background: rgba(255, 0, 60, 0.1) !important;
          border: 1px solid rgba(255, 0, 60, 0.3) !important;
          color: #FF003C !important;
        }
      `}</style>
    </div>
  )
}

export default MakeGame
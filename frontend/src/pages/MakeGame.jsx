import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Badge, Modal, Alert, ProgressBar, Toast, ToastContainer } from 'react-bootstrap'
import { Plus, Gamepad2, Users, Clock, DollarSign, Lock, Globe, Calendar, Trophy, Settings, CheckCircle, AlertTriangle, Play, Info, Link, AlertCircle, ChevronsLeft } from 'lucide-react'
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
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [selectedGameState, setSelectedGameState] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [createdCompetitionTitle, setCreatedCompetitionTitle] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState('success')

  const [formData, setFormData] = useState({
    title: '',
    gameId: '',
    privacy: 'PRIVATE',
    maxPlayers: '',
    entryFee: '',
    startsAt: '',
    endsAt: ''
  })

  // Helper function to format currency in KES
  const formatKES = (cents) => {
    return `KES ${(cents).toFixed(2)}`
  }

  const showToastMessage = (message, variant = 'success') => {
    setToastMessage(message)
    setToastVariant(variant)
    setShowToast(true)
  }

  // Load my competitions on mount
  useEffect(() => {
    if (user) {
      fetchMyCompetitions()
    }
  }, [user, fetchMyCompetitions])

  // Set default start and end times when modal opens
  useEffect(() => {
    if (showCreateModal && !formData.startsAt) {
      const now = new Date()
      const startTime = new Date(now.getTime() + 30 * 60000) // 30 minutes from now
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60000) // 2 hours after start
      
      setFormData(prev => ({
        ...prev,
        startsAt: startTime.toISOString().slice(0, 16),
        endsAt: endTime.toISOString().slice(0, 16)
      }))
    }
  }, [showCreateModal])

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
    
    const now = new Date()
    const startTime = new Date(now.getTime() + 30 * 60000) // 30 minutes from now
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60000) // 2 hours after start
    
    setFormData(prev => ({
      ...prev,
      gameId: game.id,
      maxPlayers: formattedGame.maxPlayersLimit || '4',
      entryFee: formattedGame.minEntryFee || '0',
      startsAt: startTime.toISOString().slice(0, 16),
      endsAt: endTime.toISOString().slice(0, 16)
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

    if (!formData.startsAt) {
      newErrors.startsAt = 'Start time is required'
    } else {
      const startTime = new Date(formData.startsAt)
      const now = new Date()
      if (startTime <= now) {
        newErrors.startsAt = 'Start time must be in the future'
      }
    }

    if (!formData.endsAt) {
      newErrors.endsAt = 'End time is required'
    } else if (formData.startsAt) {
      const startTime = new Date(formData.startsAt)
      const endTime = new Date(formData.endsAt)
      if (endTime <= startTime) {
        newErrors.endsAt = 'End time must be after start time'
      }
      
      // Check minimum duration (at least 15 minutes)
      const duration = (endTime - startTime) / (1000 * 60) // in minutes
      if (duration < 15) {
        newErrors.endsAt = 'Tournament must last at least 15 minutes'
      }
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
      const entryFeeCents = Math.round(parseFloat(formData.entryFee));
      console.log('entryFeeCents', entryFeeCents)
      
      // Check wallet balance before creating
      if (user?.wallet?.balance < entryFeeCents) {
        showToastMessage(
          `Insufficient wallet balance. You need ${formatKES(entryFeeCents)} but have ${formatKES(user?.wallet?.balance || 0)}`,
          'error'
        );
        setShowConfirmModal(false);
        return;
      }

      const competitionData = {
        title: formData.title,
        gameId: formData.gameId,
        privacy: formData.privacy,
        maxPlayers: parseInt(formData.maxPlayers),
        entryFee: entryFeeCents,
        startsAt: new Date(formData.startsAt).toISOString(),
        endsAt: new Date(formData.endsAt).toISOString()
      }

      await createCompetition(competitionData)

      setCreatedCompetitionTitle(formData.title)
      setShowConfirmModal(false)
      resetForm()
      setShowSuccessModal(true)
      showToastMessage('Tournament created successfully!', 'success')

    } catch (error) {
      console.error('Failed to create competition:', error)
      showToastMessage(error.message || 'Failed to create tournament', 'error')
      setShowConfirmModal(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      gameId: '',
      privacy: 'PRIVATE',
      maxPlayers: '',
      entryFee: '',
      startsAt: '',
      endsAt: ''
    })
    setSelectedGameState(null)
    setSelectedGame(null)
    setFormErrors({})
  }

  const calculateEstimatedPrize = () => {
    const entryFee = parseFloat(formData.entryFee) || 0
    const maxPlayers = parseInt(formData.maxPlayers) || 0
    const isPrivate = formData.privacy === 'PRIVATE'
    const platformFeePercent = isPrivate ? 0.15 : 0.20
    return entryFee * maxPlayers * (1 - platformFeePercent)
  }

  const calculateTotalDeduction = () => {
    const entryFee = parseFloat(formData.entryFee) || 0
    return entryFee // Entry fee deducted from creator's account
  }

  const getPlatformFeePercent = () => {
    return formData.privacy === 'PRIVATE' ? 15 : 20
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Nairobi'
    })
  }

  const getTournamentDuration = () => {
    if (!formData.startsAt || !formData.endsAt) return ''
    const start = new Date(formData.startsAt)
    const end = new Date(formData.endsAt)
    const durationMs = end - start
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="makegame-page animated-bg">
      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={4000}
          autohide
          style={{
            background: toastVariant === 'success' ? '#1a3a2a' : '#3a1a1a',
            border: `2px solid ${toastVariant === 'success' ? '#00FF85' : '#FF003C'}`,
            minWidth: '300px'
          }}
        >
          <Toast.Header style={{ background: 'rgba(31, 31, 35, 0.95)', borderBottom: `1px solid ${toastVariant === 'success' ? '#00FF85' : '#FF003C'}` }}>
            {toastVariant === 'success' ? (
              <CheckCircle size={16} color="#00FF85" className="me-2" />
            ) : (
              <AlertCircle size={16} color="#FF003C" className="me-2" />
            )}
            <strong className="me-auto text-white">
              {toastVariant === 'success' ? 'Success' : 'Error'}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white" style={{ fontSize: '14px' }}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>

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
              <h4 className="text-energy-green fw-bold">
                {formatKES(myCompetitions.reduce((total, comp) =>
                  total + comp.totalPrizePool, 0
                ))}
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
                  <Form.Label className="text-white">Privacy *</Form.Label>
                  <Form.Select
                    name="privacy"
                    value={formData.privacy}
                    onChange={handleInputChange}
                    className="text-white"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(0, 240, 255, 0.2)',
                      color: '#fff'
                    }}
                  >
                    <option value="PRIVATE">Private (15% fee)</option>
                    <option value="PUBLIC">Public (20% fee)</option>
                  </Form.Select>
                  <Form.Text className="text-white-50">
                    {formData.privacy === 'PRIVATE' 
                      ? 'Only invited players can join' 
                      : 'Anyone can join this tournament'}
                  </Form.Text>
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
                    <Form.Text className="text-white-50">
                      Max {selectedGameState.maxPlayersLimit} for {selectedGameState.name}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Entry Fee (KES) *</Form.Label>
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
                    <Form.Text className="text-white-50">
                      Minimum {formatKES(selectedGameState.minEntryFee)} for this game
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white d-flex align-items-center">
                    <Calendar size={16} className="me-2" />
                    Start Time *
                  </Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="startsAt"
                    value={formData.startsAt}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.startsAt}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.startsAt}
                  </Form.Control.Feedback>
                  <Form.Text className="text-white-50">
                    When players can start joining
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white d-flex align-items-center">
                    <Clock size={16} className="me-2" />
                    End Time *
                  </Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="endsAt"
                    value={formData.endsAt}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.endsAt}
                    min={formData.startsAt || new Date().toISOString().slice(0, 16)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.endsAt}
                  </Form.Control.Feedback>
                  <Form.Text className="text-white-50">
                    Tournament automatically ends
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {formData.startsAt && formData.endsAt && (
              <Alert variant="info" className="mb-3">
                <Clock size={16} className="me-2" />
                Tournament Duration: <strong>{getTournamentDuration()}</strong>
              </Alert>
            )}

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
            <div className="mb-4 p-4 cyber-card" style={{ background: 'rgba(0, 240, 255, 0.08)' }}>
              <h5 className="text-neon mb-3 d-flex align-items-center">
                <Trophy size={24} className="me-2" />
                Tournament Details
              </h5>
              
              <div className="detail-item d-flex justify-content-between mb-2">
                <span className="text-white-50">Title:</span>
                <span className="text-white fw-bold">{formData.title}</span>
              </div>
              <div className="detail-item d-flex justify-content-between mb-2">
                <span className="text-white-50">Game:</span>
                <span className="text-white fw-bold">{selectedGameState?.name}</span>
              </div>
              <div className="detail-item d-flex justify-content-between mb-2">
                <span className="text-white-50">Privacy:</span>
                <Badge bg={formData.privacy === 'PRIVATE' ? 'secondary' : 'primary'}>
                  {formData.privacy === 'PRIVATE' ? (
                    <><Lock size={14} className="me-1" /> Private</>
                  ) : (
                    <><Globe size={14} className="me-1" /> Public</>
                  )}
                </Badge>
              </div>
              <div className="detail-item d-flex justify-content-between mb-2">
                <span className="text-white-50">Max Players:</span>
                <span className="text-white fw-bold">{formData.maxPlayers}</span>
              </div>
              <div className="detail-item d-flex justify-content-between mb-2">
                <span className="text-white-50">Start Time:</span>
                <span className="text-white fw-bold">{formatDateTime(formData.startsAt)}</span>
              </div>
              <div className="detail-item d-flex justify-content-between mb-2">
                <span className="text-white-50">End Time:</span>
                <span className="text-white fw-bold">{formatDateTime(formData.endsAt)}</span>
              </div>
              <div className="detail-item d-flex justify-content-between">
                <span className="text-white-50">Duration:</span>
                <span className="text-white fw-bold">{getTournamentDuration()}</span>
              </div>
            </div>

            {/* Financial Deduction Notice */}
            <div className="mb-4 p-4 cyber-card" style={{ background: 'rgba(0, 255, 133, 0.08)' }}>
              <h5 className="text-energy-green mb-3 d-flex align-items-center">
                <DollarSign size={24} className="me-2" />
                Financial Information
              </h5>
              
              <div className="deduction-info mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2 p-3" style={{ background: 'rgba(0, 240, 255, 0.05)', borderRadius: '6px' }}>
                  <span className="text-white">Entry Fee Amount:</span>
                  <span className="text-neon fw-bold fs-5">KES {parseFloat(formData.entryFee).toFixed(2)}</span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center mb-2 p-3" style={{ background: 'rgba(155, 0, 255, 0.05)', borderRadius: '6px' }}>
                  <span className="text-white">Platform Fee ({getPlatformFeePercent()}%):</span>
                  <span className="text-purple fw-bold">KES {(parseFloat(formData.entryFee) * getPlatformFeePercent() / 100).toFixed(2)}</span>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2 p-3" style={{ background: 'rgba(0, 255, 133, 0.05)', borderRadius: '6px' }}>
                  <span className="text-white">Max Prize Pool:</span>
                  <span className="text-energy-green fw-bold fs-5">KES {calculateEstimatedPrize().toFixed(2)}</span>
                </div>
              </div>

              <div className="alert alert-warning p-3 mb-0" style={{ background: 'rgba(255, 0, 60, 0.15)', border: '1px solid rgba(255, 0, 60, 0.4)', borderRadius: '6px' }}>
                <div className="d-flex align-items-start">
                  <AlertTriangle size={20} className="text-cyber-red me-2 mt-1" style={{ flexShrink: 0 }} />
                  <div>
                    <strong className="text-cyber-red d-block mb-2">Important Payment Notice</strong>
                    <p className="text-white mb-2">
                      <strong>KES {calculateTotalDeduction().toFixed(2)}</strong> will be deducted from your wallet immediately upon tournament creation. 
                      This amount covers your entry fee as the tournament creator.
                    </p>
                    <p className="text-white-50 mb-0 small">
                      {formData.privacy === 'PRIVATE' 
                        ? '15% platform fee will be deducted from each entry (Private tournament)'
                        : '20% platform fee will be deducted from each entry (Public tournament)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Rules Link */}
            <div className="p-4 cyber-card" style={{ background: 'rgba(155, 0, 255, 0.08)' }}>
              <h5 className="text-purple mb-3 d-flex align-items-center">
                <Info size={24} className="me-2" />
                Game Rules & Regulations
              </h5>
              
              <p className="text-white mb-3">
                Before creating this tournament, please review the official game rules and regulations for <strong>{selectedGameState?.name}</strong>.
              </p>

              <Button
                variant="outline-light"
                className="w-100 d-flex align-items-center justify-content-center rules-link-btn"
                style={{
                  border: '2px solid rgba(155, 0, 255, 0.5)',
                  color: '#9B00FF',
                  background: 'rgba(155, 0, 255, 0.1)',
                  padding: '12px',
                  borderRadius: '6px',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none'
                }}
                onClick={() => window.open('/game-rules', '_blank')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(155, 0, 255, 0.2)'
                  e.currentTarget.style.borderColor = '#9B00FF'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(155, 0, 255, 0.1)'
                  e.currentTarget.style.borderColor = 'rgba(155, 0, 255, 0.5)'
                }}
              >
                <Gamepad2 size={20} className="me-2" />
                Read Game Rules & Regulations
              </Button>
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

        .cyber-modal .form-select {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(0, 240, 255, 0.2) !important;
          color: #fff !important;
        }

        .cyber-modal .form-select option {
          background: #1f1f23 !important;
          color: #fff !important;
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

        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

export default MakeGame
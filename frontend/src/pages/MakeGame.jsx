import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Badge, Modal, Alert, ProgressBar } from 'react-bootstrap'
import { Plus, Gamepad2, Users, Clock, DollarSign, Lock, Globe, Calendar, Trophy, Settings, CheckCircle, AlertTriangle } from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import { useAuth } from '../contexts/AuthContext'

const MakeGame = () => {
  const {
    games,
    myCompetitions,
    loading,
    errors,
    fetchMyCompetitions,
    createCompetition,
    setSelectedGame,
    clearErrors
  } = useGame()

  const { user } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedGameState, setSelectedGameState] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [formErrors, setFormErrors] = useState({})

  const [formData, setFormData] = useState({
    title: '',
    gameId: '',
    minutesToPlay: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    entryFee: '',
    maxPlayers: '',
    privacy: 'private',
    description: '',
    prizePool: '',
    difficulty: 'intermediate',
    rules: [''],
    eligibility: 'all',
    autoStart: true,
    allowSpectators: true,
    streamingAllowed: true
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
    // defaultDuration: Math.round((game.minPlayTime + game.maxPlayTime) / 2),
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
      minutesToPlay: formattedGame.avgDuration,
      maxPlayers: formattedGame.maxPlayersLimit,
      entryFee: formattedGame.minEntryFee
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

  // Handle rule changes
  const handleRuleChange = (index, value) => {
    const newRules = [...formData.rules]
    newRules[index] = value
    setFormData(prev => ({ ...prev, rules: newRules }))
  }

  // Add new rule
  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, '']
    }))
  }

  // Remove rule
  const removeRule = (index) => {
    if (formData.rules.length > 1) {
      const newRules = formData.rules.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, rules: newRules }))
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

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required'
    }

    if (formData.startDate && formData.endDate && formData.startTime && formData.endTime) {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)
      const now = new Date()

      if (startDateTime <= now) {
        newErrors.startDate = 'Start time must be in the future'
      }

      if (endDateTime <= startDateTime) {
        newErrors.endDate = 'End time must be after start time'
      }
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

  const nextStep = () => {
    if (currentStep === 1 && !validateBasicInfo()) return
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const validateBasicInfo = () => {
    const basicErrors = {}

    if (!formData.title.trim()) basicErrors.title = 'Title is required'
    if (!formData.startDate) basicErrors.startDate = 'Start date is required'
    if (!formData.startTime) basicErrors.startTime = 'Start time is required'
    if (!formData.endDate) basicErrors.endDate = 'End date is required'
    if (!formData.endTime) basicErrors.endTime = 'End time is required'
    if (!formData.maxPlayers) basicErrors.maxPlayers = 'Max players is required'
    if (!formData.minutesToPlay) basicErrors.minutesToPlay = 'Game duration is required'

    setFormErrors(basicErrors)
    return Object.keys(basicErrors).length === 0
  }

  const handleCreateCompetition = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)

      const competitionData = {
        title: formData.title,
        gameId: formData.gameId,
        minutesToPlay: parseInt(formData.minutesToPlay),
        maxPlayers: parseInt(formData.maxPlayers),
        entryFee: parseFloat(formData.entryFee) || 0,
        startsAt: startDateTime.toISOString(),
        endsAt: endDateTime.toISOString(),
        description: formData.description,
        rules: formData.rules.filter(rule => rule.trim()),
        privacy: formData.privacy,
        allowSpectators: formData.allowSpectators,
        streamingAllowed: formData.streamingAllowed
      }

      await createCompetition(competitionData)

      setShowCreateModal(false)
      setCurrentStep(1)
      resetForm()

      // Success message - you can replace with a toast notification
      alert('Competition created successfully!')

    } catch (error) {
      console.error('Failed to create competition:', error)
      // Error is already handled by the context
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      gameId: '',
      minutesToPlay: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      entryFee: '',
      maxPlayers: '',
      privacy: 'public',
      description: '',
      prizePool: '',
      difficulty: 'intermediate',
      rules: [''],
      eligibility: 'all',
      autoStart: true,
      allowSpectators: true,
      streamingAllowed: true
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

      {/* Create Competition Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => {
          setShowCreateModal(false)
          resetForm()
          setCurrentStep(1)
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
          <div className="creation-progress">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-white">Step {currentStep} of 3</span>
              <span className="text-white">{Math.round((currentStep / 3) * 100)}%</span>
            </div>
            <ProgressBar
              now={(currentStep / 3) * 100}
              style={{ height: '6px' }}
              className="creation-progress-bar"
            />
          </div>

          {errors.creatingCompetition && (
            <Alert variant="danger" className="mb-3">
              <AlertTriangle size={16} className="me-2" />
              {errors.creatingCompetition}
            </Alert>
          )}

          <Form onSubmit={handleCreateCompetition}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="step-content">
                <h5 className="text-neon mb-3">Basic Information</h5>

                <Row>
                  <Col md={8}>
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
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-white">Game Duration (minutes) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="minutesToPlay"
                        value={formData.minutesToPlay ?? ''}
                        onChange={handleInputChange}
                        placeholder="15"
                        min="1"
                        max="180"
                        isInvalid={!!formErrors.minutesToPlay}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.minutesToPlay}
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
                        placeholder="100"
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
                      <Form.Label className="text-white">Entry Fee ($)</Form.Label>
                      <Form.Control
                        type="number"
                        name="entryFee"
                        value={formData.entryFee ?? ''}
                        onChange={handleInputChange}
                        placeholder="0"
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
              </div>
            )}

            {/* Step 2: Rules & Settings */}
            {currentStep === 2 && (
              <div className="step-content">
                <h5 className="text-purple mb-3">Rules & Settings</h5>

                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Privacy Setting</Form.Label>
                  <div className="d-flex gap-3 mb-3">
                    <Form.Check
                      type="radio"
                      id="public"
                      name="privacy"
                      value="public"
                      checked={formData.privacy === 'public'}
                      onChange={handleInputChange}
                      label={
                        <span className="text-white">
                          <Globe size={16} className="me-2" />
                          Public
                        </span>
                      }
                    />
                    <Form.Check
                      type="radio"
                      id="private"
                      name="privacy"
                      value="private"
                      checked={formData.privacy === 'private'}
                      onChange={handleInputChange}
                      label={
                        <span className="text-white">
                          <Lock size={16} className="me-2" />
                          Private (Invite Only)
                        </span>
                      }
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your tournament rules and objectives..."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Competition Rules</Form.Label>
                  {formData.rules.map((rule, index) => (
                    <div key={index} className="d-flex gap-2 mb-2">
                      <Form.Control
                        type="text"
                        value={rule}
                        onChange={(e) => handleRuleChange(index, e.target.value)}
                        placeholder={`Rule ${index + 1}`}
                      />
                      {formData.rules.length > 1 && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeRule(index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={addRule}
                    className="mt-2"
                  >
                    Add Rule
                  </Button>
                </Form.Group>

                <div className="settings-checkboxes">
                  <Form.Check
                    type="checkbox"
                    id="allow-spectators"
                    name="allowSpectators"
                    checked={formData.allowSpectators}
                    onChange={handleInputChange}
                    label="Allow spectators"
                    className="text-white mb-2"
                  />
                  <Form.Check
                    type="checkbox"
                    id="streaming-allowed"
                    name="streamingAllowed"
                    checked={formData.streamingAllowed}
                    onChange={handleInputChange}
                    label="Allow streaming/recording"
                    className="text-white mb-2"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Review & Create */}
            {currentStep === 3 && (
              <div className="step-content">
                <h5 className="text-energy-green mb-3">Review & Confirm</h5>

                <div className="tournament-review cyber-card p-3 mb-3">
                  <h6 className="text-neon mb-3">Tournament Summary</h6>

                  <Row>
                    <Col md={6}>
                      <div className="review-section mb-3">
                        <strong className="text-white">Basic Info:</strong>
                        <div className="text-white">
                          <div>Title: {formData.title}</div>
                          <div>Game: {selectedGameState?.name}</div>
                          <div>Duration: {formData.minutesToPlay} minutes</div>
                          <div>Privacy: {formData.privacy}</div>
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="review-section mb-3">
                        <strong className="text-white">Schedule:</strong>
                        <div className="text-white">
                          <div>Start: {formData.startDate} at {formData.startTime}</div>
                          <div>End: {formData.endDate} at {formData.endTime}</div>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <div className="review-section mb-3">
                        <strong className="text-white">Players & Fees:</strong>
                        <div className="text-white">
                          <div>Max Players: {formData.maxPlayers}</div>
                          <div>Entry Fee: ${formData.entryFee || '0'}</div>
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="review-section mb-3">
                        <strong className="text-white">Estimated Total Prize:</strong>
                        <div className="text-energy-green fw-bold h5">
                          ${calculateEstimatedPrize().toFixed(2)}
                        </div>
                        <small className="text-white">
                          Entry fees minus 10% platform fee
                        </small>
                      </div>
                    </Col>
                  </Row>
                </div>

                {Object.keys(formErrors).length > 0 && (
                  <Alert variant="danger">
                    <AlertTriangle size={16} className="me-2" />
                    Please fix the following errors before creating:
                    <ul className="mb-0 mt-2">
                      {Object.values(formErrors).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </Alert>
                )}
              </div>
            )}
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <div className="d-flex justify-content-between w-100">
            <Button
              variant="outline-secondary"
              onClick={() => {
                if (currentStep === 1) {
                  setShowCreateModal(false)
                  resetForm()
                } else {
                  prevStep()
                }
              }}
              disabled={loading.creatingCompetition}
            >
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </Button>

            {currentStep < 3 ? (
              <Button
                className="btn-cyber"
                onClick={nextStep}
                disabled={loading.creatingCompetition}
              >
                Next Step
              </Button>
            ) : (
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
            )}
          </div>
        </Modal.Footer>
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

        .tournament-review {
          background: rgba(0, 240, 255, 0.05) !important;
          border: 1px solid rgba(0, 240, 255, 0.2) !important;
        }

        .stat-card {
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-3px);
        }

        .creation-progress-bar .progress-bar {
          background: linear-gradient(90deg, #00F0FF, #9B00FF) !important;
        }

        .step-content {
          min-height: 400px;
        }

        .review-section {
          border-bottom: 1px solid rgba(0, 240, 255, 0.1);
          padding-bottom: 10px;
        }

        .review-section:last-child {
          border-bottom: none;
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
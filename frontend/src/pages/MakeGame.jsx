import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Badge, Modal, Alert, ProgressBar } from 'react-bootstrap'
import { Plus, Gamepad2, Users, Clock, DollarSign, Lock, Globe, Calendar, Trophy, Settings, CheckCircle, AlertTriangle } from 'lucide-react'

const MakeGame = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const [createdCompetitions, setCreatedCompetitions] = useState([])
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    title: '',
    gameType: '',
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

  // Load created competitions on mount
  useEffect(() => {
    const saved = localStorage.getItem('createdCompetitions')
    if (saved) {
      setCreatedCompetitions(JSON.parse(saved))
    }
  }, [])

  // Save to localStorage
  const saveCreatedCompetitions = (competitions) => {
    localStorage.setItem('createdCompetitions', JSON.stringify(competitions))
    setCreatedCompetitions(competitions)
  }

  // Mock available games with enhanced data
  const availableGames = [
    {
      id: 1,
      name: "Battle Royale",
      description: "Last player standing wins in this intense survival game",
      category: "Action",
      difficulty: "Expert",
      icon: "🎯",
      players: "1-100",
      avgDuration: "15-30 min",
      popular: true
    },
    {
      id: 2,
      name: "Speed Racing",
      description: "Fast-paced racing with power-ups and obstacles",
      category: "Racing",
      difficulty: "Intermediate",
      icon: "🏎️",
      players: "1-20",
      avgDuration: "5-10 min",
      popular: true
    },
    {
      id: 3,
      name: "Brain Puzzle",
      description: "Mind-bending puzzles that test your logic and creativity",
      category: "Puzzle",
      difficulty: "Advanced",
      icon: "🧩",
      players: "1-50",
      avgDuration: "10-20 min",
      popular: false
    },
    {
      id: 4,
      name: "Strategy Wars",
      description: "Build your empire and dominate the battlefield",
      category: "Strategy",
      difficulty: "Expert",
      icon: "⚔️",
      players: "2-8",
      avgDuration: "30-60 min",
      popular: true
    },
    {
      id: 5,
      name: "Card Duel",
      description: "Strategic card battles with deck building elements",
      category: "Card Game",
      difficulty: "Intermediate",
      icon: "🃏",
      players: "2-4",
      avgDuration: "15-25 min",
      popular: false
    },
    {
      id: 6,
      name: "Memory Match",
      description: "Test your memory with increasingly complex patterns",
      category: "Memory",
      difficulty: "Beginner",
      icon: "🧠",
      players: "1-10",
      avgDuration: "5-15 min",
      popular: false,
      thumbnail: '/images/memory-match.jpg',
      features: ['Pattern recognition', 'Memory training', 'Progressive difficulty', 'Time challenges'],
      minPlayers: 1,
      maxPlayersLimit: 50,
      defaultDuration: 15
    }
  ]

  // Form validation
  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Tournament title is required'
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
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

    if (formData.startDate && formData.endDate) {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)

      if (startDateTime <= new Date()) {
        newErrors.startDate = 'Start time must be in the future'
      }

      if (endDateTime <= startDateTime) {
        newErrors.endDate = 'End time must be after start time'
      }
    }

    if (!formData.maxPlayers || formData.maxPlayers < 2) {
      newErrors.maxPlayers = 'Must allow at least 2 players'
    }

    if (selectedGame && formData.maxPlayers > selectedGame.maxPlayersLimit) {
      newErrors.maxPlayers = `Maximum ${selectedGame.maxPlayersLimit} players for this game`
    }

    if (formData.entryFee && parseFloat(formData.entryFee) < 0) {
      newErrors.entryFee = 'Entry fee cannot be negative'
    }

    if (formData.prizePool && parseFloat(formData.prizePool) < 0) {
      newErrors.prizePool = 'Prize pool cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#00FF85'
      case 'Intermediate': return '#00F0FF'
      case 'Advanced': return '#9B00FF'
      case 'Expert': return '#FF003C'
      default: return '#B0B0B0'
    }
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

    setErrors(basicErrors)
    return Object.keys(basicErrors).length === 0
  }

  const handleCreateCompetition = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsCreating(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      const newCompetition = {
        id: `comp_${Date.now()}`,
        ...formData,
        game: selectedGame.name,
        gameIcon: selectedGame.icon,
        organizer: 'You',
        status: 'upcoming',
        players: 0,
        createdAt: new Date().toISOString(),
        featured: false
      }

      const updated = [...createdCompetitions, newCompetition]
      saveCreatedCompetitions(updated)

      setShowCreateModal(false)
      setCurrentStep(1)
      resetForm()

      alert('Competition created successfully!')

    } catch (error) {
      alert('Failed to create competition. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleInputChange = (e) => {
  }

  const resetForm = () => {
    setFormData({
      title: '',
      gameType: '',
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
    setSelectedGame(null)
    setErrors({})
  }

  const calculateEstimatedPrize = () => {
    const entryFee = parseFloat(formData.entryFee) || 0
    const maxPlayers = parseInt(formData.maxPlayers) || 0
    const additionalPrize = parseFloat(formData.prizePool) || 0

    return (entryFee * maxPlayers * 0.9) + additionalPrize // 10% platform fee
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

        {/* Created Competitions Section */}
        {createdCompetitions.length > 0 && (
          <>
            <Row className="mb-4">
              <Col>
                <h3 className="cyber-text text-white mb-3">Your Created Competitions</h3>
              </Col>
            </Row>

            <Row className="mb-5">
              {createdCompetitions.slice(-3).map(comp => (
                <Col lg={4} md={6} key={comp.id} className="mb-4">
                  <Card className="cyber-card h-100">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <Badge
                        style={{
                          background: comp.status === 'upcoming' ? '#00F0FF' : '#00FF85',
                          color: '#0E0E10'
                        }}
                      >
                        {comp.status.toUpperCase()}
                      </Badge>
                      <small className="text-white">
                        {new Date(comp.createdAt).toLocaleDateString()}
                      </small>
                    </Card.Header>
                    <Card.Body>
                      <h5 className="text-white mb-2">{comp.title}</h5>
                      <p className="text-white small mb-3">{comp.game}</p>

                      <div className="competition-stats">
                        <Row className="g-2 mb-3">
                          <Col xs={6}>
                            <div className="stat-item text-center">
                              <Users size={16} color="#9B00FF" className="mb-1" />
                              <div className="text-purple small">{comp.players}/{comp.maxPlayers}</div>
                            </div>
                          </Col>
                          <Col xs={6}>
                            <div className="stat-item text-center">
                              <Trophy size={16} color="#00FF85" className="mb-1" />
                              <div className="text-energy-green small">${parseFloat(comp.prizePool || 0).toLocaleString()}</div>
                            </div>
                          </Col>
                        </Row>
                      </div>

                      <Button className="btn-outline-cyber w-100" size="sm">
                        Manage Competition
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}

        {/* Game Selection Grid */}
        <Row className="mb-4">
          <Col>
            <h3 className="cyber-text text-white mb-3">Select a Game</h3>
          </Col>
        </Row>

        <Row>
          {availableGames.map(game => (
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
                {game.popular && (
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
                  <div className="game-icon mb-3" style={{ fontSize: '4rem' }}>
                    {game.icon}
                  </div>

                  <h4 className="text-white mb-2">{game.name}</h4>
                  <p className="text-white mb-3">{game.description}</p>

                  <div className="game-details mb-3">
                    <Badge
                      className="me-2 mb-2"
                      style={{
                        background: getDifficultyColor(game.difficulty),
                        color: '#0E0E10'
                      }}
                    >
                      {game.difficulty}
                    </Badge>
                    <Badge className="me-2 mb-2" style={{ background: '#9B00FF' }}>
                      {game.category}
                    </Badge>
                  </div>

                  <div className="game-stats">
                    <Row className="g-2 text-center">
                      <Col xs={4}>
                        <div className="stat-item">
                          <Users size={16} color="#00F0FF" className="mb-1" />
                          <div className="stat-value text-neon small">{game.players}</div>
                        </div>
                      </Col>
                      <Col xs={8}>
                        <div className="stat-item">
                          <Clock size={16} color="#9B00FF" className="mb-1" />
                          <div className="stat-value text-purple small">{game.avgDuration}</div>
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
          ))}
        </Row>

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
              <h4 className="text-neon fw-bold">156</h4>
              <small className="text-white">Tournaments Created</small>
            </div>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <div className="stat-card cyber-card p-3 text-center h-100">
              <Users size={30} color="#9B00FF" className="mb-2" />
              <h4 className="text-purple fw-bold">8.4K</h4>
              <small className="text-white">Total Participants</small>
            </div>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <div className="stat-card cyber-card p-3 text-center h-100">
              <DollarSign size={30} color="#00FF85" className="mb-2" />
              <h4 className="text-energy-green fw-bold">$45K</h4>
              <small className="text-white">Prize Money Awarded</small>
            </div>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <div className="stat-card cyber-card p-3 text-center h-100">
              <Gamepad2 size={30} color="#FF003C" className="mb-2" />
              <h4 className="text-cyber-red fw-bold">24</h4>
              <small className="text-white">Active Tournaments</small>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Create Competition Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        size="lg"
        className="cyber-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <Settings size={24} className="me-2 text-neon" />
            Create {selectedGame?.name} Tournament
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="creation-progress mb-4">
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
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter tournament name"
                        isInvalid={!!errors.title}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.title}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-white">Difficulty Level</Form.Label>
                      <Form.Select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleInputChange}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-white">Start Date & Time *</Form.Label>
                      <Row>
                        <Col xs={7}>
                          <Form.Control
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            isInvalid={!!errors.startDate}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </Col>
                        <Col xs={5}>
                          <Form.Control
                            type="time"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleInputChange}
                            isInvalid={!!errors.startTime}
                          />
                        </Col>
                      </Row>
                      {(errors.startDate || errors.startTime) && (
                        <div className="text-danger small mt-1">
                          {errors.startDate || errors.startTime}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-white">End Date & Time *</Form.Label>
                      <Row>
                        <Col xs={7}>
                          <Form.Control
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            isInvalid={!!errors.endDate}
                            min={formData.startDate || new Date().toISOString().split('T')[0]}
                          />
                        </Col>
                        <Col xs={5}>
                          <Form.Control
                            type="time"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleInputChange}
                            isInvalid={!!errors.endTime}
                          />
                        </Col>
                      </Row>
                      {(errors.endDate || errors.endTime) && (
                        <div className="text-danger small mt-1">
                          {errors.endDate || errors.endTime}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-white">Max Players *</Form.Label>
                      <Form.Control
                        type="number"
                        name="maxPlayers"
                        value={formData.maxPlayers}
                        onChange={handleInputChange}
                        placeholder="100"
                        min="2"
                        max={selectedGame?.maxPlayersLimit || 1000}
                        isInvalid={!!errors.maxPlayers}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.maxPlayers}
                      </Form.Control.Feedback>
                      {selectedGame && (
                        <Form.Text className="text-white">
                          Max {selectedGame.maxPlayersLimit} for {selectedGame.name}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-white">Entry Fee ($)</Form.Label>
                      <Form.Control
                        type="number"
                        name="entryFee"
                        value={formData.entryFee}
                        onChange={handleInputChange}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        isInvalid={!!errors.entryFee}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.entryFee}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-white">Additional Prize Pool ($)</Form.Label>
                      <Form.Control
                        type="number"
                        name="prizePool"
                        value={formData.prizePool}
                        onChange={handleInputChange}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        isInvalid={!!errors.prizePool}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.prizePool}
                      </Form.Control.Feedback>
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

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-white">Eligibility</Form.Label>
                      <Form.Select
                        name="eligibility"
                        value={formData.eligibility}
                        onChange={handleInputChange}
                      >
                        <option value="all">All Players</option>
                        <option value="premium">Premium Members Only</option>
                        <option value="verified">Verified Players Only</option>
                        <option value="rank-restricted">Rank Restricted</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="settings-checkboxes">
                  <Form.Check
                    type="checkbox"
                    id="auto-start"
                    name="autoStart"
                    checked={formData.autoStart}
                    onChange={handleInputChange}
                    label="Auto-start when full"
                    className="text-white mb-2"
                  />
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
                          <div>Game: {selectedGame?.name}</div>
                          <div>Difficulty: {formData.difficulty}</div>
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
                          <div>Additional Prize: ${formData.prizePool || '0'}</div>
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
                          Includes entry fees (minus 10% platform fee) + additional prize pool
                        </small>
                      </div>
                    </Col>
                  </Row>
                </div>

                {Object.keys(errors).length > 0 && (
                  <Alert variant="danger">
                    <AlertTriangle size={16} className="me-2" />
                    Please fix the following errors before creating:
                    <ul className="mb-0 mt-2">
                      {Object.values(errors).map((error, index) => (
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
            >
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </Button>

            {currentStep < 3 ? (
              <Button
                className="btn-cyber"
                onClick={nextStep}
              >
                Next Step
              </Button>
            ) : (
              <Button
                className="btn-cyber"
                onClick={handleCreateCompetition}
                disabled={isCreating || Object.keys(errors).length > 0}
              >
                {isCreating ? (
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

        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Tournament Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter tournament name"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Difficulty Level</Form.Label>
                  <Form.Select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Start Date & Time</Form.Label>
                  <Row>
                    <Col xs={6}>
                      <Form.Control
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                      />
                    </Col>
                    <Col xs={6}>
                      <Form.Control
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        required
                      />
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">End Date & Time</Form.Label>
                  <Row>
                    <Col xs={6}>
                      <Form.Control
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                      />
                    </Col>
                    <Col xs={6}>
                      <Form.Control
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        required
                      />
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Entry Fee ($)</Form.Label>
                  <Form.Control
                    type="number"
                    name="entryFee"
                    value={formData.entryFee}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Max Players</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxPlayers"
                    value={formData.maxPlayers}
                    onChange={handleInputChange}
                    placeholder="100"
                    min="2"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Prize Pool ($)</Form.Label>
                  <Form.Control
                    type="number"
                    name="prizePool"
                    value={formData.prizePool}
                    onChange={handleInputChange}
                    placeholder="1000"
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="text-white">Privacy Setting</Form.Label>
              <div className="d-flex gap-3">
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

            {/* Tournament Preview */}
            <div className="tournament-preview cyber-card p-3 mb-3">
              <h6 className="text-neon mb-2">Tournament Preview</h6>
              <div className="preview-content">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-white fw-bold">
                    {formData.title || 'Tournament Title'}
                  </span>
                  <Badge style={{ background: getDifficultyColor(formData.difficulty) }}>
                    {formData.difficulty.toUpperCase()}
                  </Badge>
                </div>
                <div className="preview-stats">
                  <small className="text-muted">
                    Game: {selectedGame?.name} |
                    Players: {formData.maxPlayers || 'N/A'} |
                    Entry: ${formData.entryFee || '0'} |
                    Prize: ${formData.prizePool || '0'}
                  </small>
                </div>
              </div>
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowCreateModal(false)}
          >
            Cancel
          </Button>
          <Button
            className="btn-cyber"
            onClick={handleCreateCompetition}
          >
            <Trophy size={18} className="me-2" />
            Create Tournament
          </Button>
        </Modal.Footer>
      </Modal >

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

        .tournament-preview {
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

        .tournament-review {
          background: rgba(0, 240, 255, 0.05) !important;
          border: 1px solid rgba(0, 240, 255, 0.2) !important;
        }

        .review-section {
          border-bottom: 1px solid rgba(0, 240, 255, 0.1);
          padding-bottom: 10px;
        }

        .review-section:last-child {
          border-bottom: none;
        }
      `}</style>
    </div >
  )
}

export default MakeGame
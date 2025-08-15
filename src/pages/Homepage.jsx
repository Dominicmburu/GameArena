import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Badge, Button, Form, InputGroup, Modal, Alert } from 'react-bootstrap'
import { Search, Calendar, Trophy, Users, Clock, Zap, Star, Filter, Play, Info, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const Homepage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showCompetitionModal, setShowCompetitionModal] = useState(false)
  const [selectedCompetition, setSelectedCompetition] = useState(null)
  const [joinedCompetitions, setJoinedCompetitions] = useState([])
  const [loading, setLoading] = useState(false)

  // Mock data for competitions
  const competitions = [
    {
      id: 1,
      title: "Cyber Clash Championship",
      game: "Battle Royale",
      prizePool: 50000,
      players: 2847,
      maxPlayers: 5000,
      startTime: "2024-08-20T18:00:00",
      endTime: "2024-08-22T20:00:00",
      status: "ongoing",
      difficulty: "Beginner",
      entryFee: 15,
      featured: false
    }
  ]

  // Load user's joined competitions on mount
  useEffect(() => {
    const savedJoined = localStorage.getItem('joinedCompetitions')
    if (savedJoined) {
      setJoinedCompetitions(JSON.parse(savedJoined))
    }
  }, [])

  // Save joined competitions to localStorage
  const saveJoinedCompetitions = (joined) => {
    localStorage.setItem('joinedCompetitions', JSON.stringify(joined))
    setJoinedCompetitions(joined)
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'ongoing': return '#00FF85'
      case 'upcoming': return '#00F0FF'
      case 'ended': return '#B0B0B0'
      default: return '#B0B0B0'
    }
  }

  const formatTimeLeft = (startTime, status) => {
    const now = new Date()
    const start = new Date(startTime)
    const diff = start - now

    if (status === 'ongoing') return 'Live Now'
    if (diff < 0) return 'Started'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0)     return `${days}d ${hours % 24}h`
    return `${hours}h`
  }

  // Handle competition join
  const handleJoinCompetition = async (competition) => {
    if (joinedCompetitions.includes(competition.id)) {
      alert('You have already joined this competition!')
      return
    }

    if (competition.players >= competition.maxPlayers) {
      alert('This competition is full!')
      return
    }

    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const newJoined = [...joinedCompetitions, competition.id]
      saveJoinedCompetitions(newJoined)
      
      // Update competition player count
      const updatedCompetitions = competitions.map(comp => 
        comp.id === competition.id 
          ? { ...comp, players: comp.players + 1 }
          : comp
      )
      
      setLoading(false)
      setShowCompetitionModal(false)
      alert(`Successfully joined ${competition.title}!`)
    }, 1000)
  }

  // Show competition details
  const showCompetitionDetails = (competition) => {
    setSelectedCompetition(competition)
    setShowCompetitionModal(true)
  }

  // Navigate to competition page
  const navigateToCompetition = (competitionId) => {
    // In a real app, this would navigate to the specific competition page
    window.location.href = `/competition/${competitionId}`
  }

  const filteredCompetitions = competitions.filter(comp => {
    const matchesSearch = comp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comp.game.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || 
                         comp.status === selectedFilter ||
                         (selectedFilter === 'featured' && comp.featured)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="homepage animated-bg">
      <Container fluid className="py-4">
        {/* Hero Section */}
        <Row className="mb-5">
          <Col lg={12}>
            <div 
              className="hero-section text-center py-5 px-4"
              style={{
                background: 'linear-gradient(135deg, rgba(155, 0, 255, 0.1) 0%, rgba(0, 240, 255, 0.1) 100%)',
                borderRadius: '20px',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div className="hero-content position-relative">
                <h1 
                  className="cyber-text display-3 fw-bold mb-4"
                  style={{
                    background: 'linear-gradient(45deg, #00F0FF, #9B00FF, #FF003C)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Welcome to GameArena
                </h1>
                <p className="lead mb-4 text-silver-gray">
                  The ultimate gaming platform where legends are born. Compete, win, and claim your place in the cyber elite.
                </p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <Button className="btn-cyber px-4 py-2">
                    <Zap size={20} className="me-2" />
                    Start Competing
                  </Button>
                  <Button className="btn-outline-cyber px-4 py-2">
                    <Trophy size={20} className="me-2" />
                    View Rankings
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Search and Filter Section */}
        <Row className="mb-4">
          <Col lg={8}>
            <InputGroup className="search-bar">
              <InputGroup.Text 
                style={{ 
                  background: 'rgba(31, 31, 35, 0.8)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  borderRight: 'none'
                }}
              >
                <Search size={20} color="#00F0FF" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search competitions, games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'rgba(31, 31, 35, 0.8)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  borderLeft: 'none'
                }}
              />
            </InputGroup>
          </Col>
          <Col lg={4}>
            <Form.Select 
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              style={{
                background: 'rgba(31, 31, 35, 0.8)',
                border: '1px solid rgba(0, 240, 255, 0.3)'
              }}
            >
              <option value="all">All Competitions</option>
              <option value="ongoing">Live Now</option>
              <option value="upcoming">Upcoming</option>
              <option value="featured">Featured</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Competition Stats */}
        <Row className="mb-4">
          <Col md={3} sm={6} className="mb-3">
            <div className="stat-card cyber-card p-3 text-center h-100">
              <Trophy size={30} color="#00F0FF" className="mb-2" />
              <h4 className="text-neon fw-bold">248</h4>
              <small className="text-muted">Active Competitions</small>
            </div>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <div className="stat-card cyber-card p-3 text-center h-100">
              <Users size={30} color="#9B00FF" className="mb-2" />
              <h4 className="text-purple fw-bold">45.2K</h4>
              <small className="text-muted">Active Players</small>
            </div>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <div className="stat-card cyber-card p-3 text-center h-100">
              <Zap size={30} color="#00FF85" className="mb-2" />
              <h4 className="text-energy-green fw-bold">$2.4M</h4>
              <small className="text-muted">Total Prize Pool</small>
            </div>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <div className="stat-card cyber-card p-3 text-center h-100">
              <Star size={30} color="#FF003C" className="mb-2" />
              <h4 className="text-cyber-red fw-bold">15</h4>
              <small className="text-muted">Game Categories</small>
            </div>
          </Col>
        </Row>

        {/* Featured Competitions */}
        <Row className="mb-4">
          <Col>
            <h2 className="cyber-text text-neon mb-3">
              <Star size={24} className="me-2" />
              Featured Competitions
            </h2>
          </Col>
        </Row>

        <Row>
          {filteredCompetitions.map(comp => (
            <Col lg={6} xl={4} key={comp.id} className="mb-4">
              <Card 
                className="cyber-card h-100 competition-card"
                style={{ position: 'relative' }}
              >
                {comp.featured && (
                  <div 
                    className="featured-badge position-absolute"
                    style={{
                      top: '15px',
                      right: '15px',
                      background: 'linear-gradient(45deg, #FF003C, #9B00FF)',
                      color: '#F5F5F5',
                      padding: '4px 12px',
                      borderRadius: '15px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      zIndex: 10
                    }}
                  >
                    <Star size={12} className="me-1" />
                    FEATURED
                  </div>
                )}

                <Card.Header 
                  className="d-flex justify-content-between align-items-center"
                  style={{ background: 'rgba(0, 240, 255, 0.1)' }}
                >
                  <div className="d-flex align-items-center">
                    <Badge 
                      style={{ 
                        background: getStatusColor(comp.status),
                        color: '#0E0E10',
                        marginRight: '10px'
                      }}
                    >
                      {comp.status.toUpperCase()}
                    </Badge>
                    <small className="text-muted">{comp.game}</small>
                  </div>
                  <Badge 
                    style={{ 
                      background: getDifficultyColor(comp.difficulty),
                      color: '#0E0E10'
                    }}
                  >
                    {comp.difficulty}
                  </Badge>
                </Card.Header>

                <Card.Body>
                  <Card.Title className="h5 mb-3 text-white">{comp.title}</Card.Title>
                  
                  <div className="competition-stats mb-3">
                    <Row className="g-2">
                      <Col xs={6}>
                        <div className="stat-item">
                          <Trophy size={16} color="#00F0FF" className="me-2" />
                          <span className="text-neon fw-bold">${comp.prizePool.toLocaleString()}</span>
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className="stat-item">
                          <Users size={16} color="#9B00FF" className="me-2" />
                          <span className="text-purple fw-bold">{comp.players}/{comp.maxPlayers}</span>
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className="stat-item">
                          <Clock size={16} color="#00FF85" className="me-2" />
                          <span className="text-energy-green fw-bold">{formatTimeLeft(comp.startTime, comp.status)}</span>
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className="stat-item">
                          <span className="text-muted">Entry: </span>
                          <span className="text-white fw-bold">${comp.entryFee}</span>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  <div className="progress mb-3" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar"
                      style={{
                        width: `${(comp.players / comp.maxPlayers) * 100}%`,
                        background: 'linear-gradient(90deg, #00F0FF, #9B00FF)'
                      }}
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <Button 
                      className="btn-cyber flex-fill"
                      disabled={comp.players >= comp.maxPlayers || loading}
                      onClick={() => {
                        if (joinedCompetitions.includes(comp.id)) {
                          navigateToCompetition(comp.id)
                        } else {
                          handleJoinCompetition(comp)
                        }
                      }}
                    >
                      {loading ? (
                        <div className="loading-spinner me-2" style={{ width: '16px', height: '16px' }} />
                      ) : joinedCompetitions.includes(comp.id) ? (
                        <>
                          <Play size={18} className="me-2" />
                          Play Now
                        </>
                      ) : comp.players >= comp.maxPlayers ? (
                        'Full'
                      ) : (
                        'Join Now'
                      )}
                    </Button>
                    <Button 
                      className="btn-outline-cyber" 
                      style={{ minWidth: '50px' }}
                      onClick={() => showCompetitionDetails(comp)}
                    >
                      <Info size={18} />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {filteredCompetitions.length === 0 && (
          <Row>
            <Col className="text-center py-5">
              <div className="no-results">
                <Search size={64} color="#B0B0B0" className="mb-3" />
                <h4 className="text-muted">No competitions found</h4>
                <p className="text-muted">Try adjusting your search or filter criteria</p>
              </div>
            </Col>
          </Row>
        )}
      </Container>

      {/* Competition Details Modal */}
      <Modal 
        show={showCompetitionModal} 
        onHide={() => setShowCompetitionModal(false)}
        size="lg"
        className="cyber-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <Trophy size={24} className="me-2 text-neon" />
            {selectedCompetition?.title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedCompetition && (
            <div className="competition-details">
              <Row className="mb-4">
                <Col md={8}>
                  <div className="competition-info">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <Badge 
                        style={{ 
                          background: getStatusColor(selectedCompetition.status),
                          color: '#0E0E10',
                          padding: '6px 12px'
                        }}
                      >
                        {selectedCompetition.status.toUpperCase()}
                      </Badge>
                      <Badge 
                        style={{ 
                          background: getDifficultyColor(selectedCompetition.difficulty),
                          color: '#0E0E10',
                          padding: '6px 12px'
                        }}
                      >
                        {selectedCompetition.difficulty}
                      </Badge>
                      <Badge style={{ background: '#9B00FF', padding: '6px 12px' }}>
                        {selectedCompetition.game}
                      </Badge>
                    </div>
                    
                    <p className="text-muted mb-3">{selectedCompetition.description}</p>
                    
                    <div className="competition-meta">
                      <Row>
                        <Col sm={6} className="mb-2">
                          <strong className="text-white">Organizer:</strong>
                          <div className="text-muted">{selectedCompetition.organizer}</div>
                        </Col>
                        <Col sm={6} className="mb-2">
                          <strong className="text-white">Category:</strong>
                          <div className="text-muted">{selectedCompetition.category}</div>
                        </Col>
                        <Col sm={6} className="mb-2">
                          <strong className="text-white">Start Time:</strong>
                          <div className="text-muted">
                            {new Date(selectedCompetition.startTime).toLocaleString()}
                          </div>
                        </Col>
                        <Col sm={6} className="mb-2">
                          <strong className="text-white">End Time:</strong>
                          <div className="text-muted">
                            {new Date(selectedCompetition.endTime).toLocaleString()}
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </Col>
                
                <Col md={4}>
                  <div className="competition-stats cyber-card p-3">
                    <h6 className="text-neon mb-3">Competition Stats</h6>
                    <div className="stat-row d-flex justify-content-between mb-2">
                      <span className="text-muted">Prize Pool:</span>
                      <span className="text-energy-green fw-bold">${selectedCompetition.prizePool.toLocaleString()}</span>
                    </div>
                    <div className="stat-row d-flex justify-content-between mb-2">
                      <span className="text-muted">Entry Fee:</span>
                      <span className="text-white fw-bold">${selectedCompetition.entryFee}</span>
                    </div>
                    <div className="stat-row d-flex justify-content-between mb-2">
                      <span className="text-muted">Players:</span>
                      <span className="text-purple fw-bold">{selectedCompetition.players}/{selectedCompetition.maxPlayers}</span>
                    </div>
                    <div className="stat-row d-flex justify-content-between mb-3">
                      <span className="text-muted">Time Left:</span>
                      <span className="text-cyber-red fw-bold">
                        {formatTimeLeft(selectedCompetition.startTime, selectedCompetition.status)}
                      </span>
                    </div>
                    
                    <div className="progress mb-2" style={{ height: '6px' }}>
                      <div 
                        className="progress-bar"
                        style={{
                          width: `${(selectedCompetition.players / selectedCompetition.maxPlayers) * 100}%`,
                          background: 'linear-gradient(90deg, #00F0FF, #9B00FF)'
                        }}
                      />
                    </div>
                    <small className="text-muted">
                      {((selectedCompetition.players / selectedCompetition.maxPlayers) * 100).toFixed(1)}% Full
                    </small>
                  </div>
                </Col>
              </Row>
              
              {selectedCompetition.rules && selectedCompetition.rules.length > 0 && (
                <div className="competition-rules">
                  <h6 className="text-white mb-3">Competition Rules</h6>
                  <ul className="text-muted">
                    {selectedCompetition.rules.map((rule, index) => (
                      <li key={index} className="mb-1">{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowCompetitionModal(false)}
          >
            Close
          </Button>
          {selectedCompetition && (
            <Button 
              className="btn-cyber"
              disabled={selectedCompetition.players >= selectedCompetition.maxPlayers || loading}
              onClick={() => handleJoinCompetition(selectedCompetition)}
            >
              {loading ? (
                <div className="loading-spinner me-2" style={{ width: '16px', height: '16px' }} />
              ) : joinedCompetitions.includes(selectedCompetition.id) ? (
                <>
                  <Play size={18} className="me-2" />
                  Go to Competition
                </>
              ) : selectedCompetition.players >= selectedCompetition.maxPlayers ? (
                'Competition Full'
              ) : (
                <>
                  <Trophy size={18} className="me-2" />
                  Join Competition
                </>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .competition-card {
          transition: all 0.3s ease;
        }

        .competition-card:hover {
          transform: translateY(-5px);
        }

        .stat-item {
          display: flex;
          align-items: center;
          font-size: 0.9rem;
          margin-bottom: 5px;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 20%, rgba(155, 0, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(0, 240, 255, 0.1) 0%, transparent 50%);
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .stat-card {
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-3px);
        }
      `}</style>
    </div>
  )
}

export default Homepage;
import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Badge, Button, Form, InputGroup, Modal } from 'react-bootstrap'
import { Search, Trophy, Users, Clock, Zap, Star, Play, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { useAuth } from '../contexts/AuthContext'

const Homepage = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { 
    publicCompetitions, 
    games,
    participatedCompetitions,
    loading, 
    joinCompetitionByCode,
    fetchPublicCompetitions,
    fetchParticipatedCompetitions
  } = useGame()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showCompetitionModal, setShowCompetitionModal] = useState(false)
  const [selectedCompetition, setSelectedCompetition] = useState(null)
  const [joiningCompetition, setJoiningCompetition] = useState(false)

  // Helper function to format currency in KES
  const formatKES = (cents) => {
    return `KES ${(cents).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Load competitions on mount
  useEffect(() => {
    fetchPublicCompetitions()
    if (isAuthenticated) {
      fetchParticipatedCompetitions()
    }
  }, [isAuthenticated])

  // Check if user has joined a competition
  const hasJoinedCompetition = (competitionId) => {
    return participatedCompetitions.some(comp => comp.id === competitionId)
  }

  const getDifficultyColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'BEGINNER': return '#00FF85'
      case 'INTERMEDIATE': return '#00F0FF'
      case 'ADVANCED': return '#9B00FF'
      case 'EXPERT': return '#FF003C'
      default: return '#B0B0B0'
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ONGOING': return '#00FF85'
      case 'UPCOMING': return '#00F0FF'
      case 'COMPLETED': return '#B0B0B0'
      case 'CANCELED': return '#FF003C'
      default: return '#B0B0B0'
    }
  }

  const formatTimeLeft = (expiresAt, status) => {
    if (status === 'ONGOING' || status === 'UPCOMING') {
      const now = new Date()
      const expires = new Date(expiresAt)
      const diff = expires - now

      if (diff < 0) return 'Expired'

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const days = Math.floor(hours / 24)

      if (days > 0) return `${days}d ${hours % 24}h`
      if (hours > 0) return `${hours}h ${minutes}m`
      return `${minutes}m`
    }
    return status === 'COMPLETED' ? 'Ended' : 'Canceled'
  }

  // Handle competition join
  const handleJoinCompetition = async (competition) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (hasJoinedCompetition(competition.id)) {
      navigate(`/competition/${competition.code}`)
      return
    }

    if (competition.currentPlayers >= competition.maxPlayers) {
      alert('This competition is full!')
      return
    }

    setJoiningCompetition(true)
    
    try {
      await joinCompetitionByCode(competition.code)
      alert(`Successfully joined ${competition.title}!`)
      setShowCompetitionModal(false)
      
      // Refresh competitions
      await Promise.all([
        fetchPublicCompetitions(),
        fetchParticipatedCompetitions()
      ])
      
      // Navigate to competition page
      navigate(`/competition/${competition.code}`)
    } catch (error) {
      alert(error.message || 'Failed to join competition')
    } finally {
      setJoiningCompetition(false)
    }
  }

  // Show competition details
  const showCompetitionDetails = (competition) => {
    setSelectedCompetition(competition)
    setShowCompetitionModal(true)
  }

  // Filter competitions
  const filteredCompetitions = publicCompetitions.filter(comp => {
    const matchesSearch = comp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comp.Game?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || 
                         comp.status?.toUpperCase() === selectedFilter.toUpperCase() ||
                         (selectedFilter === 'ongoing' && comp.status?.toUpperCase() === 'ONGOING')
    return matchesSearch && matchesFilter
  })

  console.log('publicCompetitions', publicCompetitions)
  console.log('filteredCompetitions', filteredCompetitions)

  // Calculate stats from public competitions
  const stats = {
    activeCompetitions: publicCompetitions.filter(c => c.status === 'ONGOING' || c.status === 'UPCOMING').length,
    totalPrizePool: publicCompetitions.reduce((sum, c) => sum + (c.totalPrizePool || 0), 0),
    gameCategories: games.length || 0
  }

  console.log('stats', stats)

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
                <p className="lead mb-4 text-white">
                  The ultimate gaming platform where legends are born. Compete, win, and claim your place in the cyber elite.
                </p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <Button className="btn-cyber px-4 py-2" onClick={() => navigate('/create')}>
                    <Zap size={20} className="me-2" />
                    Start Competing
                  </Button>
                  <Button className="btn-outline-cyber px-4 py-2" onClick={() => navigate('/play')}>
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
                  borderLeft: 'none',
                  color: '#fff'
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
                border: '1px solid rgba(0, 240, 255, 0.3)',
                color: '#fff'
              }}
            >
              <option value="all">All Competitions</option>
              <option value="ongoing">Live Now</option>
              <option value="upcoming">Upcoming</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Competition Stats */}
        <Row className="mb-4">
          <Col md={4} sm={6} className="mb-3">
            <div className="stat-card cyber-card p-3 text-center h-100">
              <Trophy size={30} color="#00F0FF" className="mb-2" />
              <h4 className="text-neon fw-bold">{stats.activeCompetitions}</h4>
              <small className="text-white">Active Competitions</small>
            </div>
          </Col>
          <Col md={4} sm={6} className="mb-3">
            <div className="stat-card cyber-card p-3 text-center h-100">
              <Zap size={30} color="#00FF85" className="mb-2" />
              <h4 className="text-energy-green fw-bold">
                {formatKES(stats.totalPrizePool)}
              </h4>
              <small className="text-white">Total Prize Pool</small>
            </div>
          </Col>
          <Col md={4} sm={6} className="mb-3">
            <div className="stat-card cyber-card p-3 text-center h-100">
              <Star size={30} color="#FF003C" className="mb-2" />
              <h4 className="text-cyber-red fw-bold">{stats.gameCategories}</h4>
              <small className="text-white">Game Categories</small>
            </div>
          </Col>
        </Row>

        {/* Public Competitions */}
        <Row className="mb-4">
          <Col>
            <h2 className="cyber-text text-neon mb-3">
              <Star size={24} className="me-2" />
              Public Competitions
            </h2>
          </Col>
        </Row>

        {loading.publicCompetitions ? (
          <Row>
            <Col className="text-center py-5">
              <div className="spinner-border text-info" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-white mt-3">Loading competitions...</p>
            </Col>
          </Row>
        ) : (
          <Row>
            {filteredCompetitions.map(comp => (
              <Col lg={6} xl={4} key={comp.id} className="mb-4">
                <Card 
                  className="cyber-card h-100 competition-card"
                  style={{ position: 'relative' }}
                >
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
                        {comp.status?.toUpperCase()}
                      </Badge>
                      <small className="text-white">{comp.Game?.name || 'Unknown Game'}</small>
                    </div>
                    <Badge 
                      style={{ 
                        background: getDifficultyColor(comp.gameLevel || comp.Game?.level),
                        color: '#0E0E10'
                      }}
                    >
                      {(comp.gameLevel || comp.Game?.level || 'N/A').toUpperCase()}
                    </Badge>
                  </Card.Header>

                  <Card.Body>
                    <Card.Title className="h5 mb-3 text-white">{comp.title}</Card.Title>
                    
                    <div className="competition-stats mb-3">
                      <Row className="g-2">
                        <Col xs={6}>
                          <div className="stat-item">
                            <Trophy size={16} color="#00F0FF" className="me-2" />
                            <span className="text-neon fw-bold">
                              {formatKES(comp.totalPrizePool || 0)}
                            </span>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="stat-item">
                            <Users size={16} color="#9B00FF" className="me-2" />
                            <span className="text-purple fw-bold">
                              {comp.currentPlayers || 0}/{comp.maxPlayers}
                            </span>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="stat-item">
                            <Clock size={16} color="#00FF85" className="me-2" />
                            <span className="text-energy-green fw-bold">
                              {formatTimeLeft(comp.endsAt, comp.status)}
                            </span>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="stat-item">
                            <span className="text-white">Entry: </span>
                            <span className="text-white fw-bold">
                              {formatKES(comp.entryFee || 0)}
                            </span>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    <div className="progress mb-3" style={{ height: '6px' }}>
                      <div 
                        className="progress-bar"
                        style={{
                          width: `${((comp.currentPlayers || 0) / comp.maxPlayers) * 100}%`,
                          background: 'linear-gradient(90deg, #00F0FF, #9B00FF)'
                        }}
                      />
                    </div>

                    <div className="d-flex gap-2">
                      <Button 
                        className="btn-cyber flex-fill"
                        disabled={
                          comp.currentPlayers >= comp.maxPlayers || 
                          joiningCompetition ||
                          comp.status === 'COMPLETED' ||
                          comp.status === 'CANCELED'
                        }
                        onClick={() => {
                          if (hasJoinedCompetition(comp.id)) {
                            navigate(`/competition/${comp.code}`)
                          } else {
                            handleJoinCompetition(comp)
                          }
                        }}
                      >
                        {joiningCompetition ? (
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        ) : hasJoinedCompetition(comp.id) ? (
                          <>
                            <Play size={18} className="me-2" />
                            View
                          </>
                        ) : comp.currentPlayers >= comp.maxPlayers ? (
                          'Full'
                        ) : comp.status === 'COMPLETED' ? (
                          'Ended'
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
        )}

        {filteredCompetitions.length === 0 && !loading.publicCompetitions && (
          <Row>
            <Col className="text-center py-5">
              <div className="no-results">
                <Search size={64} color="#B0B0B0" className="mb-3" />
                <h4 className="text-white">No competitions found</h4>
                <p className="text-white">Try adjusting your search or filter criteria</p>
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
                        {selectedCompetition.status?.toUpperCase()}
                      </Badge>
                      <Badge 
                        style={{ 
                          background: getDifficultyColor(selectedCompetition.gameLevel || selectedCompetition.Game?.level),
                          color: '#0E0E10',
                          padding: '6px 12px'
                        }}
                      >
                        {(selectedCompetition.gameLevel || selectedCompetition.Game?.level || 'N/A').toUpperCase()}
                      </Badge>
                      <Badge style={{ background: '#9B00FF', padding: '6px 12px' }}>
                        {selectedCompetition.Game?.name || 'Unknown Game'}
                      </Badge>
                    </div>
                    
                    <p className="text-white mb-3">
                      {selectedCompetition.Game?.description || 'No description available'}
                    </p>
                    
                    <div className="competition-meta">
                      <Row>
                        <Col sm={6} className="mb-2">
                          <strong className="text-white">Creator:</strong>
                          <div className="text-white">{selectedCompetition.creator?.username || selectedCompetition.creator || 'Unknown'}</div>
                        </Col>
                        <Col sm={6} className="mb-2">
                          <strong className="text-white">Game Type:</strong>
                          <div className="text-white">{selectedCompetition.Game?.gameType || 'N/A'}</div>
                        </Col>
                        <Col sm={6} className="mb-2">
                          <strong className="text-white">Created:</strong>
                          <div className="text-white">
                            {new Date(selectedCompetition.createdAt).toLocaleString()}
                          </div>
                        </Col>
                        <Col sm={6} className="mb-2">
                          <strong className="text-white">Expires:</strong>
                          <div className="text-white">
                            {new Date(selectedCompetition.expiresAt).toLocaleString()}
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
                      <span className="text-white">Prize Pool:</span>
                      <span className="text-energy-green fw-bold">
                        {formatKES(selectedCompetition.totalPrizePool || 0)}
                      </span>
                    </div>
                    <div className="stat-row d-flex justify-content-between mb-2">
                      <span className="text-white">Entry Fee:</span>
                      <span className="text-white fw-bold">
                        {formatKES(selectedCompetition.entryFee || 0)}
                      </span>
                    </div>
                    <div className="stat-row d-flex justify-content-between mb-2">
                      <span className="text-white">Players:</span>
                      <span className="text-purple fw-bold">
                        {selectedCompetition.currentPlayers || 0}/{selectedCompetition.maxPlayers}
                      </span>
                    </div>
                    <div className="stat-row d-flex justify-content-between mb-3">
                      <span className="text-white">Time Left:</span>
                      <span className="text-cyber-red fw-bold">
                        {formatTimeLeft(selectedCompetition.expiresAt, selectedCompetition.status)}
                      </span>
                    </div>
                    
                    <div className="progress mb-2" style={{ height: '6px' }}>
                      <div 
                        className="progress-bar"
                        style={{
                          width: `${((selectedCompetition.currentPlayers || 0) / selectedCompetition.maxPlayers) * 100}%`,
                          background: 'linear-gradient(90deg, #00F0FF, #9B00FF)'
                        }}
                      />
                    </div>
                    <small className="text-white">
                      {(((selectedCompetition.currentPlayers || 0) / selectedCompetition.maxPlayers) * 100).toFixed(1)}% Full
                    </small>
                  </div>
                </Col>
              </Row>
              
              {selectedCompetition.code && (
                <div className="competition-code mb-3">
                  <h6 className="text-white mb-2">Competition Code</h6>
                  <div className="d-flex align-items-center gap-2">
                    <code className="text-neon bg-dark p-2 rounded flex-grow-1">
                      {selectedCompetition.code}
                    </code>
                    <Button 
                      variant="outline-info" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedCompetition.code)
                        alert('Code copied to clipboard!')
                      }}
                    >
                      Copy
                    </Button>
                  </div>
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
              disabled={
                selectedCompetition.currentPlayers >= selectedCompetition.maxPlayers || 
                joiningCompetition ||
                selectedCompetition.status === 'COMPLETED' ||
                selectedCompetition.status === 'CANCELED'
              }
              onClick={() => handleJoinCompetition(selectedCompetition)}
            >
              {joiningCompetition ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Joining...
                </>
              ) : hasJoinedCompetition(selectedCompetition.id) ? (
                <>
                  <Play size={18} className="me-2" />
                  Go to Competition
                </>
              ) : selectedCompetition.currentPlayers >= selectedCompetition.maxPlayers ? (
                'Competition Full'
              ) : selectedCompetition.status === 'COMPLETED' ? (
                'Competition Ended'
              ) : selectedCompetition.status === 'CANCELED' ? (
                'Competition Canceled'
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

export default Homepage
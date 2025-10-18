import React, { memo, useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, ProgressBar } from 'react-bootstrap';
import { Trophy, Clock, Users, Zap, Send, Play, Check, Copy, LogOut, AlertCircle } from 'lucide-react';

const CompetitionCard = memo(({ 
  competition, 
  onPlay, 
  onInvite, 
  onCopyCode, 
  onLeave,
  copiedCode, 
  isActive 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  // Calculate time remaining with real-time countdown
  useEffect(() => {
    if (!isActive || !competition.expiresAt) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const expires = new Date(competition.expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expires - now) / 1000));
      
      setTimeRemaining(diff);
      setIsExpired(diff === 0);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [competition.expiresAt, isActive]);

  const formatTime = (seconds) => {
    if (seconds <= 0) return 'EXPIRED';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'UPCOMING': '#00F0FF',
      'ONGOING': '#00FF85',
      'COMPLETED': '#9B00FF',
      'CANCELED': '#FF003C'
    };
    return colors[status] || '#B0B0B0';
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    if (rank <= 10) return '#00F0FF';
    if (rank <= 25) return '#9B00FF';
    return '#B0B0B0';
  };

  // Determine if user can play
  const canPlay = isActive && 
                  !competition.hasPlayed && 
                  !isExpired &&
                  competition.status === 'ONGOING';

  // Check if user can leave (only before anyone has played)
  const canLeave = isActive && 
                   !competition.hasPlayed && 
                   competition.playedCount === 0 &&
                   !isExpired;

  // Progress calculations
  const progress = competition.maxPlayers > 0 
    ? (competition.currentPlayers / competition.maxPlayers) * 100 
    : 0;

  const playedProgress = competition.currentPlayers > 0
    ? (competition.playedCount / competition.currentPlayers) * 100
    : 0;

  return (
    <Card 
      className={`cyber-card mb-3 competition-card ${isExpired ? 'opacity-75' : ''}`}
      style={{ 
        transition: 'all 0.3s ease',
        borderLeft: `4px solid ${getStatusColor(competition.status)}`
      }}
    >
      <Card.Body>
        <Row className="align-items-start">
          <Col md={8}>
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="flex-grow-1">
                <h5 className="text-white mb-1">{competition.title}</h5>
                
                {/* Status Badges - NOW WITH CORRECT COLORS */}
                <div className="d-flex gap-2 flex-wrap mb-2">
                  <Badge style={{ background: '#9B00FF' }}>
                    {competition.Game?.name || 'Unknown Game'}
                  </Badge>
                  <Badge 
                    style={{ 
                      background: getStatusColor(competition.status),
                      transition: 'background 0.3s ease'
                    }}
                  >
                    {competition.status}
                  </Badge>
                  {competition.playedCount > 0 && (
                    <Badge style={{ background: '#00FF85' }}>
                      {competition.playedCount}/{competition.currentPlayers} played
                    </Badge>
                  )}
                  {isExpired && (
                    <Badge style={{ background: '#FF003C' }}>
                      <AlertCircle size={12} className="me-1" />
                      EXPIRED
                    </Badge>
                  )}
                </div>

                {/* Competition Code */}
                <div className="competition-code d-flex align-items-center mb-2">
                  <span className="text-grey me-2">Code:</span>
                  <code
                    className="text-neon bg-dark px-2 py-1 rounded cursor-pointer"
                    onClick={() => onCopyCode(competition.code)}
                    style={{ cursor: 'pointer' }}
                  >
                    {competition.code}
                  </code>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 ms-2"
                    onClick={() => onCopyCode(competition.code)}
                  >
                    {copiedCode === competition.code ? (
                      <Check size={14} color="#00FF85" />
                    ) : (
                      <Copy size={14} color="#B0B0B0" />
                    )}
                  </Button>
                </div>

                {/* TIME REMAINING - NEW FEATURE */}
                {isActive && competition.expiresAt && (
                  <div className="mb-2">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <small className="text-grey">
                        <Clock size={12} className="me-1" />
                        Time Remaining
                      </small>
                      <small 
                        className={`fw-bold ${isExpired ? 'text-danger' : timeRemaining < 300 ? 'text-warning' : 'text-neon'}`}
                      >
                        {formatTime(timeRemaining)}
                      </small>
                    </div>
                    <ProgressBar 
                      now={timeRemaining > 0 ? (timeRemaining / 3600) * 100 : 0}
                      variant={isExpired ? 'danger' : timeRemaining < 300 ? 'warning' : 'info'}
                      style={{ height: '4px' }}
                    />
                  </div>
                )}
              </div>

              {/* Rank Display - CORRECTED DATA MAPPING */}
              <div className="rank-display text-center ms-3">
                {isActive ? (
                  <>
                    <div 
                      className="rank-number fw-bold h3"
                      style={{ 
                        color: competition.currentRank ? getRankColor(competition.currentRank) : '#B0B0B0',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      #{competition.currentRank || '-'}
                    </div>
                    <small className="text-white">
                      of {competition.currentPlayers}
                    </small>
                  </>
                ) : (
                  <>
                    <div
                      className="rank-number fw-bold h3"
                      style={{ 
                        color: getRankColor(competition.finalRank || 999),
                        transition: 'color 0.3s ease'
                      }}
                    >
                      #{competition.finalRank || '-'}
                    </div>
                    <small className="text-white">Final</small>
                  </>
                )}
              </div>
            </div>

            {/* Stats Section - CORRECTED FIELD MAPPINGS */}
            <div className="competition-stats mb-3">
              <Row className="g-2">
                <Col xs={6} sm={3}>
                  <div className="d-flex align-items-center">
                    <Trophy size={16} color="#00F0FF" className="me-2" />
                    <span className="text-neon small">
                      {isActive 
                        ? `KSh ${competition.totalPrizePool || 0}` 
                        : `${competition.finalScore || 0} pts`
                      }
                    </span>
                  </div>
                </Col>
                <Col xs={6} sm={3}>
                  <div className="d-flex align-items-center">
                    <Zap size={16} color="#FF003C" className="me-2" />
                    <span className="text-cyber-red small">
                      KSh {competition.entryFee || 0}
                    </span>
                  </div>
                </Col>
                <Col xs={6} sm={3}>
                  <div className="d-flex align-items-center">
                    <Users size={16} color="#9B00FF" className="me-2" />
                    <span className="text-purple small">
                      {competition.currentPlayers || 0}/{competition.maxPlayers}
                    </span>
                  </div>
                </Col>
                <Col xs={6} sm={3}>
                  <div className="d-flex align-items-center">
                    <Trophy size={16} color="#00FF85" className="me-2" />
                    <span className="text-energy-green small">
                      {competition.Game?.level || 'N/A'}
                    </span>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Player Progress Bars - NEW */}
            {/* {isActive && competition.currentPlayers > 0 && (
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <small className="text-grey">Players Joined</small>
                  <small className="text-white">
                    {competition.currentPlayers}/{competition.maxPlayers}
                  </small>
                </div>
                <ProgressBar 
                  now={progress} 
                  variant="info"
                  style={{ height: '6px' }}
                />
                
                {competition.playedCount > 0 && (
                  <>
                    <div className="d-flex justify-content-between mb-1 mt-2">
                      <small className="text-grey">Completion Progress</small>
                      <small className="text-white">
                        {competition.playedCount}/{competition.currentPlayers}
                      </small>
                    </div>
                    <ProgressBar 
                      now={playedProgress} 
                      variant="success"
                      style={{ height: '6px' }}
                    />
                  </>
                )}
              </div>
            )} */}

            {/* Players List - IMPROVED DISPLAY */}
            {competition.players && competition.players.length > 0 && (
              <div className="players-status">
                <small className="text-grey d-block mb-2">Players:</small>
                <div className="d-flex flex-wrap gap-1">
                  {competition.players.slice(0, 6).map((player, index) => (
                    <Badge
                      key={player.id || index}
                      style={{
                        background: player.hasPlayed ? '#00FF85' : '#4A4A4A',
                        fontSize: '0.7rem',
                        transition: 'background 0.3s ease'
                      }}
                    >
                      {player.username} {player.hasPlayed && '✓'}
                      {player.score > 0 && ` (${player.score})`}
                    </Badge>
                  ))}
                  {competition.players.length > 6 && (
                    <Badge style={{ background: '#B0B0B0', fontSize: '0.7rem' }}>
                      +{competition.players.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </Col>

          {/* Action Buttons - ALL LOGIC IMPLEMENTED */}
          <Col md={4} className="text-end">
            {isActive && (
              <div className="d-flex flex-column gap-2">
                {/* Invite Button */}
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => onInvite(competition)}
                  className="w-100"
                  disabled={competition.currentPlayers >= competition.maxPlayers || isExpired}
                >
                  <Send size={16} className="me-2" />
                  Invite Players
                </Button>

                {/* Play Button - HANDLES EXPIRATION */}
                <Button
                  className="btn-cyber w-100"
                  onClick={() => onPlay(competition)}
                  disabled={!canPlay || isExpired}
                >
                  {competition.hasPlayed ? (
                    <>
                      <Check size={20} className="me-2" />
                      Completed
                    </>
                  ) : isExpired ? (
                    <>
                      <AlertCircle size={20} className="me-2" />
                      Expired
                    </>
                  ) : (
                    <>
                      <Play size={20} className="me-2" />
                      Play Now
                    </>
                  )}
                </Button>

                {/* Leave Button - NEW FEATURE */}
                {canLeave && onLeave && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onLeave(competition)}
                    className="w-100"
                  >
                    <LogOut size={16} className="me-2" />
                    Leave Competition
                  </Button>
                )}

                {/* Warning Messages */}
                {isExpired && (
                  <small className="text-danger text-center">
                    Competition has expired
                  </small>
                )}
                {!canPlay && !competition.hasPlayed && !isExpired && (
                  <small className="text-warning text-center">
                    Waiting for competition to start
                  </small>
                )}
              </div>
            )}

            {/* Completed Competition Info */}
            {!isActive && competition.status === 'COMPLETED' && (
              <div className="text-center">
                <Badge 
                  style={{ 
                    background: getRankColor(competition.finalRank),
                    fontSize: '0.9rem',
                    padding: '8px 16px'
                  }}
                  className="mb-2"
                >
                  Rank #{competition.finalRank}
                </Badge>
                <div className="text-white small">
                  Score: {competition.finalScore || 0}
                </div>
                {competition.earnings > 0 && (
                  <div className="text-energy-green small fw-bold mt-1">
                    Won: KSh {competition.earnings}
                  </div>
                )}
              </div>
            )}

            {/* Canceled Competition Info */}
            {!isActive && competition.status === 'CANCELED' && (
              <div className="text-center">
                <Badge style={{ background: '#FF003C' }}>
                  Canceled
                </Badge>
                <div className="text-grey small mt-2">
                  Refund processed
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.competition.id === nextProps.competition.id &&
    prevProps.competition.status === nextProps.competition.status &&
    prevProps.competition.currentPlayers === nextProps.competition.currentPlayers &&
    prevProps.competition.playedCount === nextProps.competition.playedCount &&
    prevProps.competition.currentRank === nextProps.competition.currentRank &&
    prevProps.competition.totalPrizePool === nextProps.competition.totalPrizePool &&
    prevProps.competition.hasPlayed === nextProps.competition.hasPlayed &&
    prevProps.competition.expiresAt === nextProps.competition.expiresAt &&
    prevProps.copiedCode === nextProps.copiedCode &&
    prevProps.isActive === nextProps.isActive &&
    JSON.stringify(prevProps.competition.players) === JSON.stringify(nextProps.competition.players)
  );
});

CompetitionCard.displayName = 'CompetitionCard';

export default CompetitionCard;
import React from 'react';
import { Modal, ListGroup, Button, Badge } from 'react-bootstrap';
import { History } from 'lucide-react';

const GameHistoryModal = ({ show, onHide, gameHistory, onInviteAgain }) => {
  return (
    <Modal show={show} onHide={onHide} className="cyber-modal" size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <History size={24} className="me-2 text-neon" />
          Game History
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {(!gameHistory || gameHistory.length === 0) ? (
          <div className="text-center py-4">
            <History size={48} className="text-grey mb-3" />
            <p className="text-grey">No game history available</p>
          </div>
        ) : (
          <ListGroup>
            {gameHistory.map(player => (
              <ListGroup.Item key={player.playerId || player.id} className="cyber-card mb-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong className="text-white">{player.username}</strong>
                    <div className="text-grey small">
                      {player.gamesPlayed} games played • Last: {new Date(player.lastPlayed).toLocaleDateString()}
                    </div>
                    <div className="mt-1">
                      {player.gameTypes?.map(type => (
                        <Badge key={type} className="me-1" style={{ background: '#9B00FF' }}>
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline-light"
                    size="sm"
                    onClick={() => onInviteAgain(player.username)}
                  >
                    Invite Again
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default GameHistoryModal;
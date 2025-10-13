import React from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { Send } from 'lucide-react';

const InvitePlayerModal = ({
  show,
  onHide,
  selectedCompetition,
  inviteUsername,
  onUsernameChange,
  onInvite,
  friends,
  loading
}) => {
  return (
    <Modal show={show} onHide={onHide} className="cyber-modal" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <Send size={24} className="me-2 text-neon" />
          Invite Player
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <h6 className="text-white">Competition: {selectedCompetition?.title}</h6>
          <small className="text-grey">Code: {selectedCompetition?.code}</small>
        </div>

        <Form.Group className="mb-3">
          <Form.Label className="text-white">Username</Form.Label>
          <Form.Control
            type="text"
            className="cyber-input"
            placeholder="Enter player's username"
            value={inviteUsername}
            onChange={(e) => onUsernameChange(e.target.value)}
          />
        </Form.Group>

        {friends && friends.length > 0 && (
          <div className="mb-3">
            <Form.Label className="text-white">Or select from friends:</Form.Label>
            <div className="friends-list">
              {friends.slice(0, 5).map(friend => (
                <Button
                  key={friend.id}
                  variant="outline-light"
                  size="sm"
                  className="me-2 mb-2"
                  onClick={() => onUsernameChange(friend.username)}
                >
                  {friend.username}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          className="btn-cyber"
          onClick={onInvite}
          disabled={!inviteUsername.trim() || loading}
        >
          {loading ? (
            <Spinner animation="border" size="sm" className="me-2" />
          ) : (
            <Send size={18} className="me-2" />
          )}
          Send Invitation
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InvitePlayerModal;
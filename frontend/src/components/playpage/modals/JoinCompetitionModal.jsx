import React from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { UserPlus } from 'lucide-react';

const JoinCompetitionModal = ({ show, onHide, joinCode, onJoinCodeChange, onJoin, loading }) => {
  return (
    <Modal show={show} onHide={onHide} className="cyber-modal" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <UserPlus size={24} className="me-2 text-neon" />
          Join Competition
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label className="text-white">Competition Code</Form.Label>
          <Form.Control
            type="text"
            className="cyber-input"
            placeholder="Enter competition code (e.g., ABC123)"
            value={joinCode}
            onChange={(e) => onJoinCodeChange(e.target.value.toUpperCase())}
            maxLength={8}
          />
          <Form.Text className="text-grey">Enter the 6-8 character competition code</Form.Text>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          className="btn-cyber"
          onClick={onJoin}
          disabled={!joinCode.trim() || loading}
        >
          {loading ? (
            <Spinner animation="border" size="sm" className="me-2" />
          ) : (
            <UserPlus size={18} className="me-2" />
          )}
          Join Competition
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default JoinCompetitionModal;
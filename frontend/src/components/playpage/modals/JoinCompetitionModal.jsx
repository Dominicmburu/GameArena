import React from 'react'
import { Modal, Spinner } from 'react-bootstrap'
import { KeyRound, ChevronRight } from 'lucide-react'

const JoinCompetitionModal = ({ show, onHide, joinCode, onJoinCodeChange, onJoin, loading }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    if (joinCode.trim() && !loading) onJoin()
  }

  return (
    <Modal show={show} onHide={onHide} className="pp-modal" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <span className="pp-modal-title-icon"><KeyRound size={16} /></span>
          Join by Code
        </Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <p className="pp-modal-helper" style={{ marginBottom: 14 }}>
            Enter the competition code shared by the host to join the game.
          </p>

          <input
            type="text"
            className="pp-modal-input pp-modal-input--code"
            placeholder="ABC123"
            value={joinCode}
            onChange={(e) => onJoinCodeChange(e.target.value.toUpperCase())}
            maxLength={10}
            autoFocus
          />
          <p className="pp-modal-helper" style={{ marginTop: 10, textAlign: 'center' }}>
            Competition codes are typically 6 characters
          </p>
        </Modal.Body>

        <Modal.Footer>
          <button type="button" className="pp-modal-btn pp-modal-btn--ghost" onClick={onHide}>
            Cancel
          </button>
          <button
            type="submit"
            className="pp-modal-btn pp-modal-btn--primary"
            disabled={!joinCode.trim() || loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : <ChevronRight size={15} />}
            {loading ? 'Finding...' : 'Continue'}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default JoinCompetitionModal

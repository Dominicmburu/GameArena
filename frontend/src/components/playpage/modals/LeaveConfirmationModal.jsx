import React from 'react';
import { Modal, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { LogOut, AlertCircle, Info } from 'lucide-react';

const LeaveConfirmationModal = ({
  show,
  onHide,
  onConfirm,
  competition,
  loading
}) => {
  if (!competition) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className="cyber-modal"
    >
      <Modal.Header closeButton className="border-bottom border-dark">
        <Modal.Title className="text-white">
          <LogOut size={24} className="me-2" />
          Leave Competition
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white">
        <Alert variant="warning" className="mb-3">
          <AlertCircle size={18} className="me-2" />
          Are you sure you want to leave this competition?
        </Alert>

        <div className="mb-3">
          <h6 className="text-neon">{competition.title}</h6>
          <small className="text-grey">Code: {competition.code}</small>
        </div>

        <div className="bg-dark-secondary p-3 rounded mb-3">
          <Row>
            <Col xs={6}>
              <small className="text-grey d-block">Entry Fee</small>
              <strong className="text-white">KSh {competition.entryFee}</strong>
            </Col>
            <Col xs={6}>
              <small className="text-grey d-block">Refund Amount</small>
              <strong className="text-energy-green">KSh {competition.entryFee}</strong>
            </Col>
          </Row>
        </div>

        <Alert variant="info" className="mb-0">
          <Info size={18} className="me-2" />
          You will receive a full refund since no one has started playing yet.
        </Alert>
      </Modal.Body>
      <Modal.Footer className="border-top border-dark">
        <Button
          variant="outline-light"
          onClick={onHide}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Leaving...
            </>
          ) : (
            <>
              <LogOut size={18} className="me-2" />
              Leave Competition
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LeaveConfirmationModal;
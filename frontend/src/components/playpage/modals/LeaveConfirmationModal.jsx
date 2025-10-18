// ADD THIS MODAL (requires imports: Modal, Button, Alert, Row, Col, Spinner from react-bootstrap)
// Also import: LogOut, AlertCircle, Info from lucide-react

<Modal
  show={showLeaveConfirmModal}
  onHide={() => setShowLeaveConfirmModal(false)}
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
    {pendingLeaveCompetition && (
      <>
        <Alert variant="warning" className="mb-3">
          <AlertCircle size={18} className="me-2" />
          Are you sure you want to leave this competition?
        </Alert>

        <div className="mb-3">
          <h6 className="text-neon">{pendingLeaveCompetition.title}</h6>
          <small className="text-grey">Code: {pendingLeaveCompetition.code}</small>
        </div>

        <div className="bg-dark-secondary p-3 rounded mb-3">
          <Row>
            <Col xs={6}>
              <small className="text-grey d-block">Entry Fee</small>
              <strong className="text-white">KSh {pendingLeaveCompetition.entryFee}</strong>
            </Col>
            <Col xs={6}>
              <small className="text-grey d-block">Refund Amount</small>
              <strong className="text-energy-green">KSh {pendingLeaveCompetition.entryFee}</strong>
            </Col>
          </Row>
        </div>

        <Alert variant="info" className="mb-0">
          <Info size={18} className="me-2" />
          You will receive a full refund since no one has started playing yet.
        </Alert>
      </>
    )}
  </Modal.Body>
  <Modal.Footer className="border-top border-dark">
    <Button
      variant="outline-light"
      onClick={() => setShowLeaveConfirmModal(false)}
      disabled={loadingStates.leaving}
    >
      Cancel
    </Button>
    <Button
      variant="danger"
      onClick={confirmLeaveCompetition}
      disabled={loadingStates.leaving}
    >
      {loadingStates.leaving ? (
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
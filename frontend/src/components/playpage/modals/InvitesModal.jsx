import React from 'react';
import { Modal, Tabs, Tab, ListGroup, Button, Badge, Spinner } from 'react-bootstrap';
import { Mail, Send, UserCheck, UserX } from 'lucide-react';

const InvitesModal = ({
  show,
  onHide,
  pendingInvites,
  sentInvites,
  onAcceptInvite,
  onDeclineInvite,
  loadingStates
}) => {

  return (
    <Modal show={show} onHide={onHide} className="cyber-modal" size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <Mail size={24} className="me-2 text-neon" />
          Game Invitations
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs defaultActiveKey="pending" className="mb-3">
          <Tab eventKey="pending" title={`Pending Invites (${pendingInvites?.length || 0})`}>
            {(!pendingInvites || pendingInvites.length === 0) ? (
              <div className="text-center py-4">
                <Mail size={48} className="text-grey mb-3" />
                <p className="text-grey">No pending game invitations</p>
              </div>
            ) : (
              <ListGroup>
                {pendingInvites.map(invite => (
                  <ListGroup.Item key={invite.id} className="cyber-card mb-2">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          <div className="me-3" style={{ fontSize: '2rem' }}>
                            {invite.Competition?.game?.imageUrl ? (
                              <img
                                src={invite.Competition.game.imageUrl}
                                alt="Game"
                                style={{ width: '40px', height: '40px', borderRadius: '8px' }}
                              />
                            ) : '🎮'}
                          </div>
                          <div>
                            <strong className="text-white">{invite.Competition?.title}</strong>
                            <div className="text-grey small">
                              from <strong>{invite.inviter?.username}</strong>
                            </div>
                            <div className="text-grey small">
                              {invite.Competition?.game?.name} • Entry: KSh {invite.Competition?.entryFee}
                            </div>
                          </div>
                        </div>
                        <small className="text-grey">
                          Received {new Date(invite.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => onAcceptInvite(invite)}
                          disabled={loadingStates[`acceptingInvite_${invite.id}`]}
                        >
                          {loadingStates[`acceptingInvite_${invite.id}`] ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <UserCheck size={16} />
                          )}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => onDeclineInvite(invite.id)}
                          disabled={loadingStates[`decliningInvite_${invite.id}`]}
                        >
                          {loadingStates[`decliningInvite_${invite.id}`] ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <UserX size={16} />
                          )}
                        </Button>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Tab>

          <Tab eventKey="sent" title={`Sent Invites (${sentInvites?.length || 0})`}>
            {(!sentInvites || sentInvites.length === 0) ? (
              <div className="text-center py-4">
                <Send size={48} className="text-grey mb-3" />
                <p className="text-grey">No sent invitations</p>
              </div>
            ) : (
              <ListGroup>
                {sentInvites.map(invite => (
                  <ListGroup.Item key={invite.id} className="cyber-card mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong className="text-white">{invite.Competition?.title}</strong>
                        <div className="text-grey small">
                          to <strong>{invite.inviteeUsername}</strong>
                        </div>
                        <small className="text-grey">
                          Sent {new Date(invite.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <Badge bg={invite.accepted ? "success" : "warning"}>
                        {invite.accepted ? "Accepted" : "Pending"}
                      </Badge>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default InvitesModal;
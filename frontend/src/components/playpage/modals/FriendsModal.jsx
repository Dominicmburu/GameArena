import React from 'react';
import { Modal, Tabs, Tab, ListGroup, Button, Badge, Form, Spinner } from 'react-bootstrap';
import { Users, UserCheck, UserX, Send, MessageCircle } from 'lucide-react';

const FriendsModal = ({
  show,
  onHide,
  friends,
  friendRequests,
  friendRequestUsername,
  onUsernameChange,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  loadingStates
}) => {
  return (
    <Modal show={show} onHide={onHide} className="cyber-modal" size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <Users size={24} className="me-2 text-neon" />
          Friends & Friend Requests
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs defaultActiveKey="requests" className="mb-3">
          <Tab eventKey="requests" title={`Friend Requests (${friendRequests?.received?.length || 0})`}>
            <div className="mb-3">
              <h6 className="text-white">Received Friend Requests</h6>
              {(!friendRequests?.received || friendRequests.received.length === 0) ? (
                <p className="text-grey">No pending friend requests</p>
              ) : (
                <ListGroup>
                  {friendRequests.received.map(request => (
                    <ListGroup.Item key={request.id} className="cyber-card mb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong className="text-white">{request.from?.username || request.username}</strong>
                          <small className="text-grey d-block">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="d-flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => onAcceptFriendRequest(request.id)}
                            disabled={loadingStates[`acceptingRequest_${request.id}`]}
                          >
                            <UserCheck size={16} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => onDeclineFriendRequest(request.id)}
                            disabled={loadingStates[`decliningRequest_${request.id}`]}
                          >
                            {loadingStates[`decliningRequest_${request.id}`] ? (
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
            </div>

            <div className="mb-3">
              <h6 className="text-white">Sent Friend Requests</h6>
              {(!friendRequests?.sent || friendRequests.sent.length === 0) ? (
                <p className="text-grey">No pending sent requests</p>
              ) : (
                <ListGroup>
                  {friendRequests.sent.map(request => (
                    <ListGroup.Item key={request.id} className="cyber-card mb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong className="text-white">{request.to?.username || request.username}</strong>
                          <small className="text-grey d-block">
                            Sent {new Date(request.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <Badge bg="warning">Pending</Badge>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </div>

            <div>
              <h6 className="text-white">Send New Friend Request</h6>
              <div className="d-flex gap-2">
                <Form.Control
                  type="text"
                  className="cyber-input"
                  placeholder="Enter username"
                  value={friendRequestUsername}
                  onChange={(e) => onUsernameChange(e.target.value)}
                />
                <Button
                  className="btn-cyber"
                  onClick={onSendFriendRequest}
                  disabled={!friendRequestUsername.trim() || loadingStates.sendingFriendRequest}
                >
                  {loadingStates.sendingFriendRequest ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <Send size={16} />
                  )}
                </Button>
              </div>
            </div>
          </Tab>

          <Tab eventKey="friends" title={`Friends (${friends?.length || 0})`}>
            {(!friends || friends.length === 0) ? (
              <div className="text-center py-4">
                <Users size={48} className="text-grey mb-3" />
                <p className="text-grey">No friends yet</p>
              </div>
            ) : (
              <ListGroup>
                {friends.map(friend => (
                  <ListGroup.Item key={friend.id} className="cyber-card mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong className="text-white">{friend.username}</strong>
                        <small className="text-grey d-block">
                          Friends since {new Date(friend.friendsSince || friend.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <Button variant="outline-light" size="sm">
                        <MessageCircle size={16} />
                      </Button>
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

export default FriendsModal;
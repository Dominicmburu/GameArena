import React, { useState } from 'react'
import { Modal, Spinner } from 'react-bootstrap'
import { Users, UserPlus, Check, X, Send, Inbox, Mail } from 'lucide-react'

const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-KE', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

const FriendsModal = ({
  show,
  onHide,
  friends = [],
  friendRequests = { received: [], sent: [] },
  friendRequestUsername = '',
  onUsernameChange,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  loadingStates = {},
}) => {
  const [tab, setTab] = useState('requests')
  const received = friendRequests?.received || []
  const sent     = friendRequests?.sent || []

  const handleSubmitRequest = (e) => {
    e.preventDefault()
    if (friendRequestUsername.trim() && !loadingStates.sendingFriendRequest) {
      onSendFriendRequest()
    }
  }

  return (
    <Modal show={show} onHide={onHide} className="pp-modal" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <span className="pp-modal-title-icon"><Users size={16} /></span>
          Friends
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="pp-modal-tabs">
          <button
            type="button"
            className={`pp-modal-tab ${tab === 'requests' ? 'active' : ''}`}
            onClick={() => setTab('requests')}
          >
            <Mail size={14} />
            Requests
            <span className="pp-modal-tab-count">{received.length}</span>
          </button>
          <button
            type="button"
            className={`pp-modal-tab ${tab === 'friends' ? 'active' : ''}`}
            onClick={() => setTab('friends')}
          >
            <Users size={14} />
            Friends
            <span className="pp-modal-tab-count">{friends.length}</span>
          </button>
        </div>

        {tab === 'requests' && (
          <>
            {/* Send friend request form */}
            <div className="pp-modal-section">
              <div className="pp-modal-section-head">
                <UserPlus size={13} color="#7A7A7A" />
                <span className="pp-modal-section-title">Add a Friend</span>
              </div>
              <form onSubmit={handleSubmitRequest} className="pp-modal-input-group">
                <input
                  type="text"
                  className="pp-modal-input"
                  placeholder="Enter username"
                  value={friendRequestUsername}
                  onChange={(e) => onUsernameChange(e.target.value)}
                />
                <button
                  type="submit"
                  className="pp-modal-btn-icon"
                  disabled={!friendRequestUsername.trim() || loadingStates.sendingFriendRequest}
                  title="Send friend request"
                  aria-label="Send friend request"
                >
                  {loadingStates.sendingFriendRequest
                    ? <Spinner animation="border" size="sm" />
                    : <Send size={16} />}
                </button>
              </form>
            </div>

            {/* Received requests */}
            <div className="pp-modal-section">
              <div className="pp-modal-section-head">
                <Inbox size={13} color="#7A7A7A" />
                <span className="pp-modal-section-title">Received</span>
                <span className="pp-modal-section-count">{received.length}</span>
              </div>
              {received.length === 0 ? (
                <div className="pp-modal-empty" style={{ padding: '20px 16px' }}>
                  <p>No pending friend requests</p>
                </div>
              ) : (
                <div className="pp-modal-list">
                  {received.map(request => {
                    const name = request.from?.username || request.username
                    const isAccepting = loadingStates[`acceptingRequest_${request.id}`]
                    const isDeclining = loadingStates[`decliningRequest_${request.id}`]
                    return (
                      <div key={request.id} className="pp-modal-item">
                        <div className="pp-modal-avatar">
                          {name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="pp-modal-item-info">
                          <div className="pp-modal-item-title">{name}</div>
                          <div className="pp-modal-item-meta">
                            Sent {formatDate(request.createdAt)}
                          </div>
                        </div>
                        <div className="pp-modal-item-actions">
                          <button
                            type="button"
                            className="pp-modal-iconbtn pp-modal-iconbtn--accept"
                            onClick={() => onAcceptFriendRequest(request.id)}
                            disabled={isAccepting || isDeclining}
                            title="Accept"
                            aria-label="Accept friend request"
                          >
                            {isAccepting ? <Spinner animation="border" size="sm" /> : <Check size={16} />}
                          </button>
                          <button
                            type="button"
                            className="pp-modal-iconbtn pp-modal-iconbtn--decline"
                            onClick={() => onDeclineFriendRequest(request.id)}
                            disabled={isAccepting || isDeclining}
                            title="Decline"
                            aria-label="Decline friend request"
                          >
                            {isDeclining ? <Spinner animation="border" size="sm" /> : <X size={16} />}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Sent requests */}
            {sent.length > 0 && (
              <div className="pp-modal-section">
                <div className="pp-modal-section-head">
                  <Send size={13} color="#7A7A7A" />
                  <span className="pp-modal-section-title">Sent</span>
                  <span className="pp-modal-section-count">{sent.length}</span>
                </div>
                <div className="pp-modal-list">
                  {sent.map(request => {
                    const name = request.to?.username || request.username
                    return (
                      <div key={request.id} className="pp-modal-item">
                        <div className="pp-modal-avatar">
                          {name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="pp-modal-item-info">
                          <div className="pp-modal-item-title">{name}</div>
                          <div className="pp-modal-item-meta">
                            Sent {formatDate(request.createdAt)}
                          </div>
                        </div>
                        <span className="pp-modal-status pp-modal-status--pending">
                          Pending
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'friends' && (
          friends.length === 0 ? (
            <div className="pp-modal-empty">
              <Users size={42} className="pp-modal-empty-icon" />
              <p>You haven't added any friends yet</p>
            </div>
          ) : (
            <div className="pp-modal-list">
              {friends.map(friend => (
                <div key={friend.id} className="pp-modal-item">
                  <div className="pp-modal-avatar">
                    {friend.username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="pp-modal-item-info">
                    <div className="pp-modal-item-title">{friend.username}</div>
                    <div className="pp-modal-item-meta">
                      Friends since {formatDate(friend.friendsSince || friend.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </Modal.Body>
    </Modal>
  )
}

export default FriendsModal

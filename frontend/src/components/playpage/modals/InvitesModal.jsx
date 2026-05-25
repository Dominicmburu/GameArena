import React, { useState } from 'react'
import { Modal, Spinner } from 'react-bootstrap'
import { Mail, Send, Check, X, Inbox } from 'lucide-react'

const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-KE', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const formatKES = (n) =>
  `KES ${Number(n || 0).toLocaleString('en-KE')}`

const InvitesModal = ({
  show,
  onHide,
  pendingInvites = [],
  sentInvites = [],
  onAcceptInvite,
  onDeclineInvite,
  loadingStates = {},
}) => {
  const [tab, setTab] = useState('pending')

  return (
    <Modal show={show} onHide={onHide} className="pp-modal" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <span className="pp-modal-title-icon"><Mail size={16} /></span>
          Competition Invites
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="pp-modal-tabs">
          <button
            type="button"
            className={`pp-modal-tab ${tab === 'pending' ? 'active' : ''}`}
            onClick={() => setTab('pending')}
          >
            <Inbox size={14} />
            Received
            <span className="pp-modal-tab-count">{pendingInvites.length}</span>
          </button>
          <button
            type="button"
            className={`pp-modal-tab ${tab === 'sent' ? 'active' : ''}`}
            onClick={() => setTab('sent')}
          >
            <Send size={14} />
            Sent
            <span className="pp-modal-tab-count">{sentInvites.length}</span>
          </button>
        </div>

        {tab === 'pending' && (
          pendingInvites.length === 0 ? (
            <div className="pp-modal-empty">
              <Inbox size={42} className="pp-modal-empty-icon" />
              <p>No pending invitations</p>
            </div>
          ) : (
            <div className="pp-modal-list">
              {pendingInvites.map(invite => {
                const isAccepting = loadingStates[`acceptingInvite_${invite.id}`]
                const isDeclining = loadingStates[`decliningInvite_${invite.id}`]
                const game = invite.Competition?.game
                return (
                  <div key={invite.id} className="pp-modal-item">
                    {game?.imageUrl ? (
                      <img
                        src={game.imageUrl}
                        alt={game.name}
                        className="pp-modal-game-thumb"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    ) : (
                      <div className="pp-modal-avatar">
                        {invite.inviter?.username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}

                    <div className="pp-modal-item-info">
                      <div className="pp-modal-item-title">
                        {invite.Competition?.title || 'Competition'}
                      </div>
                      <div className="pp-modal-item-sub">
                        from <strong>{invite.inviter?.username || 'Unknown'}</strong>
                        {game?.name && ` · ${game.name}`}
                      </div>
                      <span className="pp-modal-fee">
                        Entry {formatKES(invite.Competition?.entryFee)}
                      </span>
                      <div className="pp-modal-item-meta">
                        {formatDate(invite.createdAt)}
                      </div>
                    </div>

                    <div className="pp-modal-item-actions">
                      <button
                        type="button"
                        className="pp-modal-iconbtn pp-modal-iconbtn--accept"
                        onClick={() => onAcceptInvite(invite)}
                        disabled={isAccepting || isDeclining}
                        title="Accept"
                        aria-label="Accept invitation"
                      >
                        {isAccepting ? <Spinner animation="border" size="sm" /> : <Check size={16} />}
                      </button>
                      <button
                        type="button"
                        className="pp-modal-iconbtn pp-modal-iconbtn--decline"
                        onClick={() => onDeclineInvite(invite.id)}
                        disabled={isAccepting || isDeclining}
                        title="Decline"
                        aria-label="Decline invitation"
                      >
                        {isDeclining ? <Spinner animation="border" size="sm" /> : <X size={16} />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {tab === 'sent' && (
          sentInvites.length === 0 ? (
            <div className="pp-modal-empty">
              <Send size={42} className="pp-modal-empty-icon" />
              <p>You haven't sent any invitations yet</p>
            </div>
          ) : (
            <div className="pp-modal-list">
              {sentInvites.map(invite => (
                <div key={invite.id} className="pp-modal-item">
                  <div className="pp-modal-avatar">
                    {invite.inviteeUsername?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="pp-modal-item-info">
                    <div className="pp-modal-item-title">
                      {invite.Competition?.title || 'Competition'}
                    </div>
                    <div className="pp-modal-item-sub">
                      to <strong>{invite.inviteeUsername}</strong>
                    </div>
                    <div className="pp-modal-item-meta">
                      Sent {formatDate(invite.createdAt)}
                    </div>
                  </div>
                  <span className={`pp-modal-status pp-modal-status--${invite.accepted ? 'accepted' : 'pending'}`}>
                    {invite.accepted ? 'Accepted' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </Modal.Body>
    </Modal>
  )
}

export default InvitesModal

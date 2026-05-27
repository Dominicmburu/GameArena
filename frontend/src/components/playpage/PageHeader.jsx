import React from 'react'
import { Wallet, KeyRound, Mail, Users, History, RefreshCw, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWallet } from '../../contexts/WalletContext'
import { formatKES } from '../../utils/formatters'

const NotifBtn = ({ Icon, count, onClick, title, to }) => {
  const inner = (
    <>
      <Icon size={16} />
      {count > 0 && <span className="pp-notif-dot">{count > 9 ? '9+' : count}</span>}
    </>
  )
  if (to) {
    return (
      <Link to={to} className="pp-notif-btn" title={title} aria-label={title}>
        {inner}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} className="pp-notif-btn" title={title} aria-label={title}>
      {inner}
    </button>
  )
}

const PageHeader = ({
  pendingInvites,
  friendRequests,
  onJoinClick,
  onInvitesClick,
  onFriendsClick,
}) => {
  const { balance, isLoading, fetchBalance } = useWallet()
  const inviteCount  = pendingInvites?.length || 0
  const requestCount = friendRequests?.received?.length || 0

  return (
    <div className="pp-header">
      {/* Row 1: Title + notification icons */}
      <div className="pp-header-top">
        <div className="pp-header-titleblock">
          <h1 className="pp-title">Play</h1>
          <p className="pp-subtitle">Browse competitions, join the action, and track your games</p>
        </div>

        <div className="pp-notif-group">
          <NotifBtn Icon={Mail}    count={inviteCount}  onClick={onInvitesClick} title="Competition Invites" />
          <NotifBtn Icon={Users}   count={requestCount} onClick={onFriendsClick} title="Friends & Requests" />
          <NotifBtn Icon={History} count={0}            to="/history"            title="Game History" />
        </div>
      </div>

      {/* Row 2: Wallet + Primary action */}
      <div className="pp-header-actions">
        <div className="pp-wallet">
          <Wallet size={16} color="#C53030" />
          <span className="pp-wallet-label">Balance</span>
          <span className="pp-wallet-value">
            {isLoading ? '...' : formatKES(balance)}
          </span>
          <button
            type="button"
            onClick={fetchBalance}
            disabled={isLoading}
            className="pp-wallet-refresh"
            title="Refresh balance"
            aria-label="Refresh balance"
          >
            <RefreshCw size={13} className={isLoading ? 'pp-spin' : ''} />
          </button>
          <Link to="/deposit" className="pp-wallet-add" title="Deposit">
            <Plus size={13} />
          </Link>
        </div>

        <button type="button" onClick={onJoinClick} className="pp-action-primary">
          <KeyRound size={15} />
          <span>Join by Code</span>
        </button>
      </div>
    </div>
  )
}

export default PageHeader

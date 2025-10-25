import React from 'react';
import { Button, Badge } from 'react-bootstrap';
import { Play, UserPlus, Mail, Users, History, RefreshCw } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';

const PageHeader = ({
  pendingInvites,
  friendRequests,
  onJoinClick,
  onInvitesClick,
  onFriendsClick,
  onHistoryClick
}) => {
  const { balance, isLoading, fetchBalance } = useWallet();

  return (
    <div className="page-header cyber-card p-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap">
        <div>
          <h1 className="cyber-text text-neon mb-2">
            <Play size={32} className="me-3" />
            Gaming Arena
          </h1>
          <p className="text-white mb-0">Compete, earn, and dominate the leaderboards</p>
        </div>
        <div className="player-stats d-flex gap-3 flex-wrap">
          <div className="stat-item text-center position-relative">
            <div className="d-flex align-items-center gap-2">
              <div className="stat-value text-neon fw-bold h5 mb-0">
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </span>
                ) : (
                  `KSh ${balance.toFixed(2)}`
                )}
              </div>
              <button
                onClick={fetchBalance}
                className="btn btn-link p-0 text-neon"
                disabled={isLoading}
                style={{ textDecoration: 'none' }}
                title="Refresh balance"
              >
                <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
              </button>
            </div>
            {/* <div className="stat-label text-white small">Balance</div> */}
          </div>
          
          <div className="d-flex gap-2">
            <Button className="btn-cyber" onClick={onJoinClick}>
              <UserPlus size={20} className="me-2" />
              <span className="d-none d-sm-inline">Join Game</span>
            </Button>
            <Button variant="outline-light" onClick={onInvitesClick}>
              <Mail size={20} />
              {(pendingInvites?.length || 0) > 0 && (
                <Badge bg="danger" className="ms-1">
                  {pendingInvites?.length || 0}
                </Badge>
              )}
            </Button>
            <Button variant="outline-light" onClick={onFriendsClick}>
              <Users size={20} />
              {(friendRequests?.received?.length || 0) > 0 && (
                <Badge bg="info" className="ms-1">
                  {friendRequests?.received?.length || 0}
                </Badge>
              )}
            </Button>
            <Button variant="outline-light" onClick={onHistoryClick}>
              <History size={20} />
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default PageHeader;
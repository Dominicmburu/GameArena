import React from 'react';
import JoinCompetitionModal from './modals/JoinCompetitionModal';
import InvitePlayerModal from './modals/InvitePlayerModal';
import InvitesModal from './modals/InvitesModal';
import FriendsModal from './modals/FriendsModal';
import GameHistoryModal from './modals/GameHistoryModal';
import PaymentModal from '../payment/PaymentModal';
import GameModal from './modals/GameModal';

const ModalsContainer = ({
  showJoinModal,
  showInviteModal,
  showInvitesModal,
  showFriendsModal,
  showHistoryModal,
  showPaymentModal,
  showGameModal,
  selectedCompetition,
  joinCode,
  inviteUsername,
  friendRequestUsername,
  loadingStates,
  friends,
  friendRequests,
  pendingInvites,
  sentInvites,
  gameHistory,
  activeCompetitions,
  walletBalance,
  onJoinByCode,
  onInvitePlayer,
  onAcceptInvite,
  onDeclineInvite,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onGameEnd,
  onPaymentSuccess,
  closeAllModals,
  setFormValue
}) => {
  return (
    <>
      <JoinCompetitionModal
        show={showJoinModal}
        onHide={() => closeAllModals('join')}
        joinCode={joinCode}
        onJoinCodeChange={(value) => setFormValue('joinCode', value)}
        onJoin={onJoinByCode}
        loading={loadingStates.joiningByCode}
      />

      <InvitePlayerModal
        show={showInviteModal}
        onHide={() => closeAllModals('invite')}
        selectedCompetition={selectedCompetition}
        inviteUsername={inviteUsername}
        onUsernameChange={(value) => setFormValue('inviteUsername', value)}
        onInvite={onInvitePlayer}
        friends={friends}
        loading={loadingStates.invitingPlayer}
      />

      <InvitesModal
        show={showInvitesModal}
        onHide={() => closeAllModals('invites')}
        pendingInvites={pendingInvites}
        sentInvites={sentInvites}
        onAcceptInvite={onAcceptInvite}
        onDeclineInvite={onDeclineInvite}
        loadingStates={loadingStates}
      />

      <FriendsModal
        show={showFriendsModal}
        onHide={() => closeAllModals('friends')}
        friends={friends}
        friendRequests={friendRequests}
        friendRequestUsername={friendRequestUsername}
        onUsernameChange={(value) => setFormValue('friendRequestUsername', value)}
        onSendFriendRequest={onSendFriendRequest}
        onAcceptFriendRequest={onAcceptFriendRequest}
        onDeclineFriendRequest={onDeclineFriendRequest}
        loadingStates={loadingStates}
      />

      <GameHistoryModal
        show={showHistoryModal}
        onHide={() => closeAllModals('history')}
        gameHistory={gameHistory}
        activeCompetitions={activeCompetitions}
        onInviteAgain={(username) => {
          closeAllModals('history');
          if (activeCompetitions.length > 0) {
            setFormValue('inviteUsername', username);
            setFormValue('selectedCompetition', activeCompetitions[0]);
            closeAllModals('invite-open');
          }
        }}
      />

      <PaymentModal
        show={showPaymentModal}
        onHide={() => closeAllModals('payment')}
        amount={selectedCompetition?.entryFee || 0}
        onSuccess={onPaymentSuccess}
        title={`Join ${selectedCompetition?.title}`}
      />

      <GameModal
        show={showGameModal}
        onHide={() => closeAllModals('game')}
        selectedCompetition={selectedCompetition}
        onGameEnd={onGameEnd}
      />
    </>
  );
};

export default ModalsContainer
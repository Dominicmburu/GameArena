import React from 'react';
import JoinCompetitionModal from './modals/JoinCompetitionModal';
import InvitePlayerModal from './modals/InvitePlayerModal';
import InvitesModal from './modals/InvitesModal';
import FriendsModal from './modals/FriendsModal';
import GameHistoryModal from './modals/GameHistoryModal';
import PaymentModal from '../payment/PaymentModal';
import GameModal from './modals/GameModal';
import { useWallet } from '../../contexts/WalletContext';
import ConfirmationModal from './modals/ConfirmationModal';
import LeaveConfirmationModal from './modals/LeaveConfirmationModal';

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
  setFormValue,
  showJoinConfirmModal,
  showAcceptConfirmModal,
  pendingJoinCompetition,
  pendingAcceptInvite,
  confirmJoinByCode,
  confirmAcceptInvite,
  handleTopUpFromConfirm,
  setShowJoinConfirmModal,
  setShowAcceptConfirmModal,
  showLeaveConfirmModal,
  pendingLeaveCompetition,
  confirmLeaveCompetition,
  setShowLeaveConfirmModal
}) => {

  const { balance } = useWallet();

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

      {/* Join Competition Confirmation Modal */}
      <ConfirmationModal
        show={showJoinConfirmModal}
        onHide={() => setShowJoinConfirmModal(false)}
        onConfirm={confirmJoinByCode}
        onTopUp={handleTopUpFromConfirm}
        title="Confirm Join Competition"
        competition={pendingJoinCompetition}
        actionType="join"
        loading={loadingStates?.joiningByCode}
        walletBalance={balance}
        hasEnoughBalance={balance >= (pendingJoinCompetition?.entryFee || 0)}
      />

      {/* Accept Invite Confirmation Modal */}
      <ConfirmationModal
        show={showAcceptConfirmModal}
        onHide={() => setShowAcceptConfirmModal(false)}
        onConfirm={confirmAcceptInvite}
        onTopUp={handleTopUpFromConfirm}
        title="Confirm Accept Invitation"
        competition={pendingAcceptInvite?.Competition}
        actionType="accept"
        loading={loadingStates?.[`acceptingInvite_${pendingAcceptInvite?.id}`]}
        walletBalance={balance}
        hasEnoughBalance={balance >= (pendingAcceptInvite?.Competition?.entryFee || 0)}
      />

      <LeaveConfirmationModal
        show={showLeaveConfirmModal}
        onHide={() => setShowLeaveConfirmModal(false)}
        onConfirm={confirmLeaveCompetition}
        competition={pendingLeaveCompetition}
        loading={loadingStates?.leaving}
      />
    </>
  );
};

export default ModalsContainer
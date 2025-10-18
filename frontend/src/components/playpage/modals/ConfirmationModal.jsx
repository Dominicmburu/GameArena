import React from 'react'
import { Modal, Button, Row, Col, Alert } from 'react-bootstrap'
import { Info, DollarSign, AlertTriangle, Gamepad2, CreditCard } from 'lucide-react'

const ConfirmationModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  onTopUp,
  title, 
  competition,
  actionType, // 'join' or 'accept'
  loading,
  walletBalance,
  hasEnoughBalance
}) => {

  const entryFee = competition?.entryFee || 0
  const shortfall = entryFee - walletBalance

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="cyber-modal confirm-modal"
    >
      <Modal.Header closeButton={!loading}>
        <Modal.Title className="d-flex align-items-center">
          <Info size={24} className="me-2 text-energy-green" />
          {title || 'Confirm Action'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="confirmation-content">

          {/* Financial Summary */}
          <div className="mb-4 p-3 cyber-card" style={{ background: 'rgba(0, 255, 133, 0.08)' }}>
            {hasEnoughBalance ? (
              <div className="alert p-3 mt-3 mb-0" style={{ 
                background: 'rgba(255, 0, 60, 0.15)', 
                border: '1px solid rgba(255, 0, 60, 0.4)',
                borderRadius: '6px'
              }}>
                <div className="d-flex align-items-start">
                  <AlertTriangle size={20} className="text-cyber-red me-2 mt-1" style={{ flexShrink: 0 }} />
                  <div>
                    <strong className="text-cyber-red d-block mb-2">Important Payment Notice</strong>
                    <p className="text-white mb-0">
                      <strong>KSh {entryFee.toFixed(2)}</strong> will be deducted from your wallet immediately when you {actionType === 'join' ? 'join' : 'accept'} this competition. 
                      This payment is processed upfront and is non-refundable once you start playing.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert p-3 mt-3 mb-0" style={{ 
                background: 'rgba(255, 0, 60, 0.2)', 
                border: '2px solid rgba(255, 0, 60, 0.5)',
                borderRadius: '6px'
              }}>
                <div className="d-flex align-items-start">
                  <AlertTriangle size={24} className="text-cyber-red me-2 mt-1" style={{ flexShrink: 0 }} />
                  <div>
                    <strong className="text-cyber-red d-block mb-2 fs-5">Insufficient Balance</strong>
                    <p className="text-white mb-2">
                      You don't have enough balance to join this competition. You need an additional <strong>KSh {shortfall.toFixed(2)}</strong> to proceed.
                    </p>
                    <p className="text-white-50 small mb-0">
                      Please top up your wallet to continue.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Game Rules Link */}
          <div className="p-3 cyber-card" style={{ background: 'rgba(155, 0, 255, 0.08)' }}>
            <h5 className="text-purple mb-3">
              <Info size={20} className="me-2 mb-1" style={{ display: 'inline' }} />
              Important Information
            </h5>
            
            <p className="text-white mb-3">
              Before {actionType === 'join' ? 'joining' : 'accepting'}, please review our game rules and payment policies.
            </p>

            <Button
              variant="outline-light"
              className="w-100 mb-3"
              style={{
                border: '2px solid rgba(155, 0, 255, 0.5)',
                color: '#9B00FF',
                background: 'rgba(155, 0, 255, 0.1)',
                padding: '12px',
                borderRadius: '6px'
              }}
              onClick={() => window.open('/game-rules', '_blank')}
            >
              <Gamepad2 size={20} className="me-2" />
              Read Game Rules & Regulations
            </Button>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer style={{ borderTop: '1px solid rgba(0, 240, 255, 0.3)' }}>
        <Button
          variant="outline-secondary"
          onClick={onHide}
          disabled={loading}
          style={{ borderColor: 'rgba(255, 255, 255, 0.3)', color: '#fff' }}
        >
          Cancel
        </Button>

        {hasEnoughBalance ? (
          <Button
            className="btn-cyber"
            onClick={onConfirm}
          >
            {loading ? (
              <>
                <div className="loading-spinner me-2" style={{ width: '16px', height: '16px' }} />
                Processing...
              </>
            ) : (
              <>
                <DollarSign size={18} className="me-2" />
                Confirm & Pay KSh {entryFee.toFixed(2)}
              </>
            )}
          </Button>
        ) : (
          <Button
            className="btn-cyber"
            onClick={onTopUp}
            style={{
              background: 'linear-gradient(45deg, #FF003C, #FF6B00)',
              boxShadow: '0 0 20px rgba(255, 0, 60, 0.3)'
            }}
          >
            <CreditCard size={18} className="me-2" />
            Top Up Wallet
          </Button>
        )}
      </Modal.Footer>

      <style jsx>{`
        .cyber-modal .modal-content {
          background: rgba(31, 31, 35, 0.95) !important;
          border: 1px solid rgba(0, 240, 255, 0.3) !important;
          backdrop-filter: blur(10px);
        }

        .cyber-modal .modal-header {
          border-bottom: 1px solid rgba(0, 240, 255, 0.3) !important;
        }

        .text-neon {
          color: #00FF85;
        }

        .text-purple {
          color: #9B00FF;
        }

        .text-energy-green {
          color: #00FF85;
        }

        .text-cyber-red {
          color: #FF003C;
        }

        .text-white-50 {
          color: rgba(255, 255, 255, 0.5);
        }

        .detail-item {
          padding: 8px 0;
        }

        .financial-item {
          padding: 8px 0;
        }

        .btn-cyber {
          background: linear-gradient(45deg, #00FF85, #00F0FF) !important;
          border: none !important;
          color: #0E0E10 !important;
          font-weight: bold !important;
          padding: 12px 30px !important;
          border-radius: 8px !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 0 20px rgba(0, 255, 133, 0.3) !important;
        }

        .btn-cyber:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 5px 25px rgba(0, 255, 133, 0.5) !important;
        }

        .btn-cyber:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading-spinner {
          border: 2px solid transparent;
          border-top: 2px solid #0E0E10;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .form-check-input {
          border: 1px solid rgba(0, 240, 255, 0.3);
          background: rgba(0, 240, 255, 0.05);
          cursor: pointer;
        }

        .form-check-input:checked {
          background: #00FF85;
          border-color: #00FF85;
        }

        .confirmation-content {
          max-height: 600px;
          overflow-y: auto;
        }
      `}</style>
    </Modal>
  )
}

export default ConfirmationModal
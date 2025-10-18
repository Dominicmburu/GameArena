import React, { useState } from 'react'
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap'
import { CreditCard, CheckCircle, AlertTriangle } from 'lucide-react'
import { useWallet } from '../../contexts/WalletContext'

const PaymentModal = ({ show, onHide, amount, onSuccess, title }) => {
  const { deposit, querySTKStatus, fetchBalance } = useWallet()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: input, 2: processing, 3: success
  const [checkoutRequestId, setCheckoutRequestId] = useState(null)

  const handlePayment = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate phone number (Kenyan format)
      const cleanPhone = phoneNumber.replace(/\D/g, '')
      
      // Accept both 254... and 07... formats
      let formattedPhone = cleanPhone
      if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
        formattedPhone = '254' + cleanPhone.substring(1)
      } else if (cleanPhone.startsWith('7') && cleanPhone.length === 9) {
        formattedPhone = '254' + cleanPhone
      } else if (!cleanPhone.startsWith('254') || cleanPhone.length !== 12) {
        throw new Error('Please enter a valid Kenyan phone number (254... or 07...)')
      }

      const response = await deposit(amount, formattedPhone)
      
      if (response.success) {
        setCheckoutRequestId(response.data?.CheckoutRequestID || response.data?.checkoutRequestId)
        setStep(2)
        // Poll for payment status
        pollPaymentStatus(response.data?.CheckoutRequestID || response.data?.checkoutRequestId)
      } else {
        throw new Error(response.message || 'Payment initiation failed')
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Payment initiation failed')
      setLoading(false)
    }
  }

  const pollPaymentStatus = async (checkoutId) => {
    if (!checkoutId) {
      setError('Invalid checkout request ID')
      setLoading(false)
      setStep(1)
      return
    }

    let attempts = 0
    const maxAttempts = 30 // 5 minutes with 10-second intervals

    const checkStatus = async () => {
      try {
        const response = await querySTKStatus(checkoutId)
        
        if (response.success && response.data?.ResultCode === '0') {
          // Payment successful
          setStep(3)
          setLoading(false)
          
          // Refresh balance
          await fetchBalance()
          
          setTimeout(() => {
            if (onSuccess) {
              onSuccess(response.data)
            }
            onHide()
            resetModal()
          }, 2000)
        } else if (response.data?.ResultCode && response.data.ResultCode !== '0') {
          // Payment failed
          throw new Error(response.data?.ResultDesc || 'Payment failed. Please try again.')
        } else if (attempts < maxAttempts) {
          // Still processing
          attempts++
          setTimeout(checkStatus, 10000) // Check every 10 seconds
        } else {
          // Timeout
          throw new Error('Payment timeout. Please check your M-Pesa messages and contact support if amount was deducted.')
        }
      } catch (error) {
        setError(error.response?.data?.message || error.message || 'Failed to check payment status')
        setLoading(false)
        setStep(1)
      }
    }

    checkStatus()
  }

  const resetModal = () => {
    setStep(1)
    setPhoneNumber('')
    setError('')
    setLoading(false)
    setCheckoutRequestId(null)
  }

  const handleClose = () => {
    if (!loading) {
      onHide()
      resetModal()
    }
  }

  return (
    <Modal show={show} onHide={handleClose} centered className="cyber-modal">
      <Modal.Header closeButton={!loading}>
        <Modal.Title className="d-flex align-items-center">
          <CreditCard size={24} className="me-2 text-neon" />
          {title || 'Complete Payment'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {step === 1 && (
          <>
            <div className="payment-info cyber-card p-3 mb-3" style={{ background: 'rgba(0, 255, 133, 0.08)', border: '1px solid rgba(0, 255, 133, 0.2)' }}>
              <h6 className="text-neon mb-2">Payment Details</h6>
              <div className="d-flex justify-content-between">
                <span className="text-white">Amount:</span>
                <span className="text-white fw-bold">KSh {parseFloat(amount).toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <Alert variant="danger" className="mb-3">
                <AlertTriangle size={16} className="me-2" />
                {error}
              </Alert>
            )}

            <Form onSubmit={handlePayment}>
              <Form.Group className="mb-3">
                <Form.Label className="text-white">M-Pesa Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="254712345678 or 0712345678"
                  required
                  className="cyber-input"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                    color: '#fff'
                  }}
                />
                <Form.Text className="text-muted">
                  Enter your M-Pesa registered phone number
                </Form.Text>
              </Form.Group>

              <Button
                type="submit"
                className="btn-cyber w-100"
                disabled={loading || !phoneNumber}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Processing...
                  </>
                ) : (
                  `Pay KSh ${parseFloat(amount).toFixed(2)}`
                )}
              </Button>
            </Form>
          </>
        )}

        {step === 2 && (
          <div className="text-center py-4">
            <div className="mb-3">
              <Spinner animation="border" style={{ color: '#00F0FF' }} />
            </div>
            <h5 className="text-white mb-3">Payment Request Sent</h5>
            <p className="text-white mb-3">
              Please check your phone for the M-Pesa prompt and enter your PIN to complete the payment.
            </p>
            <div className="alert p-3 mb-0" style={{ background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
              <small className="text-white">
                <strong>Note:</strong> This may take up to 2 minutes to process. Do not close this window.
              </small>
            </div>
            {checkoutRequestId && (
              <div className="mt-3">
                <small className="text-white-50">
                  Request ID: {checkoutRequestId.substring(0, 8)}...
                </small>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-4">
            <div className="success-animation mb-3">
              <CheckCircle size={64} color="#00FF85" className="success-icon" />
            </div>
            <h5 className="text-energy-green mb-2">Payment Successful!</h5>
            <p className="text-white mb-0">
              Your payment of <strong>KSh {parseFloat(amount).toFixed(2)}</strong> has been processed successfully.
            </p>
            <p className="text-white-50 small mt-2">
              Your wallet balance will be updated shortly.
            </p>
          </div>
        )}
      </Modal.Body>

      {step === 1 && (
        <Modal.Footer style={{ borderTop: '1px solid rgba(0, 240, 255, 0.3)' }}>
          <Button 
            variant="outline-secondary" 
            onClick={handleClose} 
            disabled={loading}
            style={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: '#fff'
            }}
          >
            Cancel
          </Button>
        </Modal.Footer>
      )}

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

        .text-energy-green {
          color: #00FF85;
        }

        .text-white-50 {
          color: rgba(255, 255, 255, 0.5);
        }

        .btn-cyber {
          background: linear-gradient(45deg, #00FF85, #00F0FF) !important;
          border: none !important;
          color: #0E0E10 !important;
          font-weight: bold !important;
          padding: 12px 30px !important;
          border-radius: 8px !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
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

        .success-animation {
          animation: successPulse 1s ease-in-out;
        }

        @keyframes successPulse {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }

        .success-icon {
          filter: drop-shadow(0 0 20px rgba(0, 255, 133, 0.5));
        }
      `}</style>
    </Modal>
  )
}

export default PaymentModal
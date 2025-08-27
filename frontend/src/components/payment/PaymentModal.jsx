import React, { useState } from 'react'
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap'
import { CreditCard, CheckCircle, AlertTriangle } from 'lucide-react'
import { paymentService } from '../../services/paymentService'

const PaymentModal = ({ show, onHide, amount, onSuccess, title }) => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: input, 2: processing, 3: success

  const handlePayment = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate phone number (Kenyan format)
      const cleanPhone = phoneNumber.replace(/\D/g, '')
      if (!cleanPhone.startsWith('254') || cleanPhone.length !== 12) {
        throw new Error('Please enter a valid Kenyan phone number (254...)')
      }

      const response = await paymentService.initiateDeposit(amount, cleanPhone)
      
      if (response.success) {
        setStep(2)
        // Poll for payment status
        pollPaymentStatus(response.data.transactionId)
      } else {
        throw new Error(response.message || 'Payment initiation failed')
      }
    } catch (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const pollPaymentStatus = async (transactionId) => {
    let attempts = 0
    const maxAttempts = 30 // 5 minutes with 10-second intervals

    const checkStatus = async () => {
      try {
        const response = await paymentService.checkPaymentStatus(transactionId)
        
        if (response.data.status === 'completed') {
          setStep(3)
          setLoading(false)
          setTimeout(() => {
            onSuccess(response.data)
            onHide()
            resetModal()
          }, 2000)
        } else if (response.data.status === 'failed') {
          throw new Error('Payment failed. Please try again.')
        } else if (attempts < maxAttempts) {
          attempts++
          setTimeout(checkStatus, 10000) // Check every 10 seconds
        } else {
          throw new Error('Payment timeout. Please check your M-Pesa messages.')
        }
      } catch (error) {
        setError(error.message)
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
            <div className="payment-info cyber-card p-3 mb-3">
              <h6 className="text-neon mb-2">Payment Details</h6>
              <div className="d-flex justify-content-between">
                <span className="text-white">Amount:</span>
                <span className="text-white fw-bold">KSh {amount}</span>
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
                  placeholder="254712345678"
                  required
                  className="cyber-input"
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
                  `Pay KSh ${amount}`
                )}
              </Button>
            </Form>
          </>
        )}

        {step === 2 && (
          <div className="text-center py-4">
            <div className="mb-3">
              <Spinner animation="border" variant="info" />
            </div>
            <h5 className="text-white mb-2">Payment Request Sent</h5>
            <p className="text-white">
              Please check your phone for the M-Pesa prompt and enter your PIN to complete the payment.
            </p>
            <div className="alert alert-info">
              <small>This may take up to 2 minutes to process...</small>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-4">
            <CheckCircle size={64} color="#00FF85" className="mb-3" />
            <h5 className="text-energy-green mb-2">Payment Successful!</h5>
            <p className="text-white">
              Your payment of KSh {amount} has been processed successfully.
            </p>
          </div>
        )}
      </Modal.Body>

      {step === 1 && (
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  )
}

export default PaymentModal
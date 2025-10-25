import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Badge, Alert, Modal, Spinner } from 'react-bootstrap'
import { Wallet, CreditCard, DollarSign, Shield, Clock, CheckCircle, AlertCircle, Gift, Phone, ArrowDownToLine } from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'
import ToastNotification from '../components/playpage/ToastNotification'

const Deposit = () => {
  const [depositAmount, setDepositAmount] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [selectedBonus, setSelectedBonus] = useState(null)
  const [checkoutRequestId, setCheckoutRequestId] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [statusMessage, setStatusMessage] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState('success')
  const [pollingInterval, setPollingInterval] = useState(null)
  const pollingRef = React.useRef(null)
  const isMountedRef = React.useRef(true)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawPhone, setWithdrawPhone] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)

  const {
    balance,
    transactions,
    isLoading,
    error,
    deposit: depositFunds,
    querySTKStatus,
    fetchBalance,
    fetchTransactions
  } = useWallet()

  const showToastMessage = (message, variant = 'success') => {
    setToastMessage(message)
    setToastVariant(variant)
    setShowToast(true)
  }

  useEffect(() => {
    isMountedRef.current = true

    // Fetch initial data
    fetchBalance()
    fetchTransactions()

    // Cleanup polling on unmount
    return () => {
      isMountedRef.current = false
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [])

  // Deposit bonuses
  const bonusOffers = [
    {
      id: 1,
      title: 'First Deposit Bonus',
      description: '100% match up to KES 500',
      minDeposit: 50,
      maxBonus: 500,
      percentage: 100,
      code: 'WELCOME100',
      active: true
    },
    {
      id: 2,
      title: 'Weekend Warrior',
      description: '50% bonus on weekend deposits',
      minDeposit: 100,
      maxBonus: 250,
      percentage: 50,
      code: 'WEEKEND50',
      active: false
    },
    {
      id: 3,
      title: 'High Roller',
      description: '25% bonus on deposits over KES 1000',
      minDeposit: 1000,
      maxBonus: 1000,
      percentage: 25,
      code: 'HIGHROLL25',
      active: true
    }
  ]

  const quickAmounts = [50, 100, 200, 500, 1000, 2000]

  const handleQuickAmount = (amount) => {
    setDepositAmount(amount.toString())
  }

  const formatPhoneNumber = (number) => {
    let cleaned = number.replace(/\D/g, '')

    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1)
    }

    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned
    }

    return cleaned
  }

  const validatePhoneNumber = (number) => {
    const cleaned = formatPhoneNumber(number)
    return /^254\d{9}$/.test(cleaned)
  }

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      showToastMessage('Please enter a valid deposit amount', 'error')
      return
    }

    const amount = parseFloat(depositAmount)
    if (amount < 1) {
      showToastMessage('Minimum deposit amount is KES 1', 'error')
      return
    }

    if (amount > 150000) {
      showToastMessage('Maximum deposit amount is KES 150,000', 'error')
      return
    }

    if (!phoneNumber) {
      showToastMessage('Please enter your M-Pesa phone number', 'error')
      return
    }

    if (!validatePhoneNumber(phoneNumber)) {
      showToastMessage('Please enter a valid Kenyan phone number (e.g., 0712345678)', 'error')
      return
    }

    setShowConfirmModal(true)
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      showToastMessage('Please enter a valid withdrawal amount', 'error')
      return
    }

    const amount = parseFloat(withdrawAmount)

    if (amount < 100) {
      showToastMessage('Minimum withdrawal amount is KES 100', 'error')
      return
    }

    if (amount > balance) {
      showToastMessage('Insufficient balance', 'error')
      return
    }

    if (!withdrawPhone) {
      showToastMessage('Please enter your M-Pesa phone number', 'error')
      return
    }

    if (!validatePhoneNumber(withdrawPhone)) {
      showToastMessage('Please enter a valid Kenyan phone number', 'error')
      return
    }

    setWithdrawing(true)

    try {
      // TODO: Implement withdrawal API call
      // const formattedPhone = formatPhoneNumber(withdrawPhone)
      // const result = await withdrawFunds(amount, formattedPhone)

      // Simulated response for now
      showToastMessage('Withdrawal request submitted successfully!', 'success')
      setShowWithdrawModal(false)
      setWithdrawAmount('')
      setWithdrawPhone('')

      // Refresh balance
      setTimeout(() => {
        fetchBalance()
        fetchTransactions()
      }, 1000)
    } catch (error) {
      console.error('Withdrawal error:', error)
      showToastMessage('Withdrawal failed. Please try again.', 'error')
    } finally {
      setWithdrawing(false)
    }
  }

  const confirmDeposit = async () => {
    setShowConfirmModal(false)
    setShowStatusModal(true)
    setPaymentStatus('initiating')
    setStatusMessage('Initiating M-Pesa payment...')

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber)
      const result = await depositFunds(parseFloat(depositAmount), formattedPhone)

      console.log('Deposit result:', result)

      if (result.success && result.data?.checkoutRequestId) {
        const checkoutId = result.data.checkoutRequestId

        // Set state first
        setCheckoutRequestId(checkoutId)
        setPaymentStatus('pending')
        setStatusMessage('STK Push sent to your phone. Please enter your M-Pesa PIN to complete the payment.')
        showToastMessage('STK Push sent! Check your phone.', 'success')

        // Start polling with the checkoutId directly (don't rely on state)
        pollPaymentStatus(checkoutId)
      } else {
        setPaymentStatus('failed')
        setStatusMessage(result.message || 'Failed to initiate payment')
        showToastMessage(result.message || 'Payment initiation failed', 'error')
      }
    } catch (error) {
      console.error('Deposit error:', error)
      setPaymentStatus('failed')
      setStatusMessage(error.response?.data?.error || error.message || 'Failed to initiate payment. Please try again.')
      showToastMessage('Payment failed. Please try again.', 'error')
    }
  }

  const pollPaymentStatus = async (checkoutId) => {
    // Clear any existing polling interval
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }

    let attempts = 0

    const poll = setInterval(async () => {
      // Stop polling if component is unmounted
      if (!isMountedRef.current) {
        clearInterval(poll)
        if (pollingRef.current === poll) {
          pollingRef.current = null
        }
        return
      }

      attempts++
      console.log(`Polling attempt ${attempts} for checkout: ${checkoutId}`)

      try {
        const result = await querySTKStatus(checkoutId)
        console.log('Status result:', result)

        // Stop polling if component unmounted during request
        if (!isMountedRef.current) {
          clearInterval(poll)
          if (pollingRef.current === poll) {
            pollingRef.current = null
          }
          return
        }

        // Check for completed status
        if (result.status === 'COMPLETED') {
          clearInterval(poll)
          if (pollingRef.current === poll) {
            pollingRef.current = null
          }
          setPollingInterval(null)
          setPaymentStatus('success')
          setStatusMessage('Payment successful! Your wallet has been credited.')
          showToastMessage('Deposit successful!', 'success')

          // Reset form
          setDepositAmount('')
          setPhoneNumber('')
          setSelectedBonus(null)
          setCheckoutRequestId(null)

          // Refresh wallet data
          setTimeout(() => {
            if (isMountedRef.current) {
              fetchBalance()
              fetchTransactions()
            }
          }, 1000)
        }
        // Check for failed status
        else if (result.status === 'FAILED') {
          clearInterval(poll)
          if (pollingRef.current === poll) {
            pollingRef.current = null
          }
          setPollingInterval(null)
          setPaymentStatus('failed')
          setStatusMessage(result.failureReason || result.resultDesc || 'Payment failed')
          showToastMessage('Payment failed', 'error')
        }
        // Check for cancelled status
        else if (result.status === 'CANCELLED') {
          clearInterval(poll)
          if (pollingRef.current === poll) {
            pollingRef.current = null
          }
          setPollingInterval(null)
          setPaymentStatus('failed')
          setStatusMessage('Payment was cancelled')
          showToastMessage('Payment cancelled', 'warning')
        }
        // Still pending - continue polling indefinitely
        else if (result.status === 'PENDING') {
          console.log(`Payment still pending... (attempt ${attempts})`)
          // Keep polling - no timeout
        }
      } catch (error) {
        console.error('Status check error:', error)
        // Continue polling even on errors - don't give up
        console.log(`Error during polling, will retry... (attempt ${attempts})`)
      }
    }, 3000) // Poll every 3 seconds

    pollingRef.current = poll
    setPollingInterval(poll)
  }

  const calculateBonus = () => {
    if (!selectedBonus || !depositAmount) return 0
    const amount = parseFloat(depositAmount)
    const bonus = Math.min(amount * (selectedBonus.percentage / 100), selectedBonus.maxBonus)
    return bonus
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#00FF85'
      case 'PENDING': return '#00F0FF'
      case 'FAILED': return '#FF003C'
      case 'CANCELLED': return '#FF8C00'
      default: return '#B0B0B0'
    }
  }

  const getTransactionIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle size={16} color="#00FF85" />
      case 'PENDING': return <Clock size={16} color="#00F0FF" />
      case 'FAILED': return <AlertCircle size={16} color="#FF003C" />
      case 'CANCELLED': return <AlertCircle size={16} color="#FF8C00" />
      default: return <Clock size={16} color="#B0B0B0" />
    }
  }

  const closeStatusModal = () => {
    // Clear polling if still running
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }

    setShowStatusModal(false)
    setPaymentStatus('pending')
    setStatusMessage('')
    setCheckoutRequestId(null)
  }

  const retryStatusCheck = () => {
    if (checkoutRequestId && isMountedRef.current) {
      setPaymentStatus('pending')
      setStatusMessage('Checking payment status...')
      pollPaymentStatus(checkoutRequestId)
    }
  }

  return (
    <div className="deposit-page animated-bg">
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="page-header cyber-card p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h1 className="cyber-text text-neon mb-2">
                    <Wallet size={32} className="me-3" />
                    Wallet & Deposits
                  </h1>
                  <p className="text-white mb-0">Manage your gaming funds and make secure deposits via M-Pesa</p>
                </div>
                <Button
                  variant="success"
                  size="lg"
                  onClick={() => setShowWithdrawModal(true)}
                  disabled={balance <= 0}
                  className='btn-cyber'
                >
                  <ArrowDownToLine size={20} className="me-2" />
                  Withdraw Funds
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Row className="mb-4">
            <Col>
              <Alert variant="danger" dismissible onClose={() => { }}>
                <AlertCircle size={20} className="me-2" />
                {error}
              </Alert>
            </Col>
          </Row>
        )}

        {/* Wallet Overview */}
        <Row className="mb-4">
          <Col lg={4} sm={6} className="mb-3">
            <Card className="cyber-card wallet-card h-100">
              <Card.Body className="text-center">
                <DollarSign size={30} color="#00F0FF" className="mb-2" />
                <h4 className="text-neon fw-bold">
                  {isLoading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    `KES ${balance.toFixed(2)}`
                  )}
                </h4>
                <small className="text-white">Available Balance</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4} sm={6} className="mb-3">
            <Card className="cyber-card wallet-card h-100">
              <Card.Body className="text-center">
                <Wallet size={30} color="#00FF85" className="mb-2" />
                <h4 className="text-energy-green fw-bold">
                  {transactions.filter(t => t.type === 'DEPOSIT').length}
                </h4>
                <small className="text-white">Total Deposits</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4} sm={6} className="mb-3">
            <Card className="cyber-card wallet-card h-100">
              <Card.Body className="text-center">
                <Clock size={30} color="#9B00FF" className="mb-2" />
                <h4 className="text-purple fw-bold">
                  {transactions.filter(t => t.meta?.status === 'PENDING' || !t.meta?.status).length}
                </h4>
                <small className="text-white">Pending Transactions</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Deposit Form */}
          <Col lg={8}>
            <Card className="cyber-card mb-4">
              <Card.Header>
                <h5 className="mb-0 d-flex align-items-center">
                  <CreditCard size={20} className="me-2 text-neon" />
                  Make a Deposit via M-Pesa
                </h5>
              </Card.Header>
              <Card.Body>
                {/* Security Notice */}
                <Alert className="security-alert mb-4" variant="info">
                  <Shield size={20} className="me-2" />
                  Your transactions are secured with M-Pesa. You will receive an STK push on your phone to complete the payment.
                </Alert>

                <Form>
                  {/* Phone Number */}
                  <Form.Group className="mb-4">
                    <Form.Label className="text-white h6">M-Pesa Phone Number</Form.Label>
                    <div className="input-group">
                      <span
                        className="input-group-text"
                        style={{
                          background: 'rgba(31, 31, 35, 0.8)',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          color: '#00F0FF'
                        }}
                      >
                        <Phone size={18} />
                      </span>
                      <Form.Control
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="07XXXXXXXX or 2547XXXXXXXX"
                        maxLength="12"
                      />
                    </div>
                    <Form.Text className="text-white-50">
                      Enter the M-Pesa phone number to receive the payment prompt
                    </Form.Text>
                  </Form.Group>

                  {/* Deposit Amount */}
                  <Form.Group className="mb-4">
                    <Form.Label className="text-white h6">Deposit Amount (KES)</Form.Label>
                    <div className="amount-input-container">
                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{
                            background: 'rgba(31, 31, 35, 0.8)',
                            border: '1px solid rgba(0, 240, 255, 0.3)',
                            color: '#00F0FF'
                          }}
                        >
                          KES
                        </span>
                        <Form.Control
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="Enter amount"
                          min="1"
                          max="150000"
                          step="1"
                          style={{
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}
                        />
                      </div>

                      {/* Quick Amount Buttons */}
                      <div className="quick-amounts mt-3">
                        <div className="d-flex flex-wrap gap-2">
                          {quickAmounts.map(amount => (
                            <Button
                              key={amount}
                              className="quick-amount-btn"
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleQuickAmount(amount)}
                              style={{
                                background: depositAmount === amount.toString() ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                                borderColor: '#00F0FF',
                                color: depositAmount === amount.toString() ? '#00F0FF' : '#B0B0B0'
                              }}
                            >
                              KES {amount}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <Form.Text className="text-white-50 mt-2 d-block">
                        Minimum: KES 1 | Maximum: KES 150,000
                      </Form.Text>
                    </div>
                  </Form.Group>

                  {/* Promo Code */}
                  <Form.Group className="mb-4">
                    <Form.Label className="text-white h6">Promo Code (Optional)</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter promo code"
                      />
                      <Button className="btn-outline-cyber" style={{ minWidth: '100px' }}>
                        Apply
                      </Button>
                    </div>
                  </Form.Group>

                  {/* Deposit Summary */}
                  {depositAmount && (
                    <div className="deposit-summary cyber-card p-3 mb-4">
                      <h6 className="text-neon mb-3">Deposit Summary</h6>
                      <div className="summary-row d-flex justify-content-between mb-2">
                        <span className="text-white">Deposit Amount:</span>
                        <span className="text-white fw-bold">KES {parseFloat(depositAmount || 0).toFixed(2)}</span>
                      </div>
                      {selectedBonus && (
                        <>
                          <div className="summary-row d-flex justify-content-between mb-2">
                            <span className="text-white">Bonus ({selectedBonus.percentage}%):</span>
                            <span className="text-energy-green fw-bold">+KES {calculateBonus().toFixed(2)}</span>
                          </div>
                          <hr style={{ borderColor: 'rgba(0, 240, 255, 0.3)' }} />
                          <div className="summary-row d-flex justify-content-between">
                            <span className="text-white fw-bold">Total Credit:</span>
                            <span className="text-neon fw-bold">KES {(parseFloat(depositAmount || 0) + calculateBonus()).toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <Button
                    className="btn-cyber w-100"
                    size="lg"
                    onClick={handleDeposit}
                    disabled={!depositAmount || parseFloat(depositAmount) <= 0 || !phoneNumber || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard size={20} className="me-2" />
                        Deposit KES {parseFloat(depositAmount || 0).toFixed(2)}
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            {/* Bonus Offers */}
            <Card className="cyber-card mb-4">
              <Card.Header>
                <h6 className="mb-0 d-flex align-items-center">
                  <Gift size={20} className="me-2 text-purple" />
                  Bonus Offers
                </h6>
              </Card.Header>
              <Card.Body className="p-0">
                {bonusOffers.map(bonus => (
                  <div
                    key={bonus.id}
                    className={`bonus-offer p-3 cursor-pointer ${selectedBonus?.id === bonus.id ? 'selected' : ''} ${!bonus.active ? 'disabled' : ''}`}
                    onClick={() => bonus.active && setSelectedBonus(bonus)}
                    style={{
                      borderBottom: '1px solid rgba(0, 240, 255, 0.1)',
                      cursor: bonus.active ? 'pointer' : 'not-allowed',
                      opacity: bonus.active ? 1 : 0.5,
                      background: selectedBonus?.id === bonus.id ? 'rgba(0, 240, 255, 0.1)' : 'transparent'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="text-white mb-0">{bonus.title}</h6>
                      {bonus.active ? (
                        <Badge style={{ background: '#00FF85' }}>Active</Badge>
                      ) : (
                        <Badge style={{ background: '#B0B0B0' }}>Expired</Badge>
                      )}
                    </div>
                    <p className="text-white small mb-2">{bonus.description}</p>
                    <div className="bonus-details">
                      <small className="text-white">
                        Min deposit: KES {bonus.minDeposit} | Max bonus: KES {bonus.maxBonus}
                      </small>
                    </div>
                    {selectedBonus?.id === bonus.id && (
                      <div className="bonus-code mt-2">
                        <Badge
                          className="w-100 text-center py-2"
                          style={{
                            background: 'rgba(0, 240, 255, 0.2)',
                            border: '1px solid #00F0FF',
                            color: '#00F0FF'
                          }}
                        >
                          Code: {bonus.code}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </Card.Body>
            </Card>

            {/* Recent Transactions */}
            <Card className="cyber-card">
              <Card.Header>
                <h6 className="mb-0 d-flex align-items-center">
                  <Clock size={20} className="me-2 text-neon" />
                  Recent Transactions
                </h6>
              </Card.Header>
              <Card.Body className="p-0">
                {isLoading ? (
                  <div className="text-center p-4">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center p-4">
                    <p className="text-white mb-0">No transactions yet</p>
                  </div>
                ) : (
                  transactions.slice(0, 5).map(transaction => {
                    const txStatus = transaction.meta?.status || 'PENDING'
                    const receipt = transaction.meta?.MpesaReceiptNumber || transaction.meta?.mpesaReceiptNumber

                    return (
                      <div
                        key={transaction.id}
                        className="transaction-item p-3"
                        style={{
                          borderBottom: '1px solid rgba(0, 240, 255, 0.1)'
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="transaction-info">
                            <div className="d-flex align-items-center mb-1">
                              <span className={`transaction-type me-2 ${transaction.type === 'DEPOSIT' ? 'text-energy-green' : 'text-cyber-red'}`}>
                                {transaction.type === 'DEPOSIT' ? '+' : '-'}KES {transaction.amount}
                              </span>
                              <Badge
                                style={{
                                  background: getStatusColor(txStatus),
                                  color: '#0E0E10',
                                  fontSize: '0.7rem'
                                }}
                              >
                                {txStatus}
                              </Badge>
                            </div>
                            <div className="transaction-details">
                              <small className="text-white">
                                {receipt || 'M-Pesa'} • {new Date(transaction.createdAt).toLocaleDateString()}
                              </small>
                            </div>
                          </div>
                          <div className="transaction-icon">
                            {getTransactionIcon(txStatus)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Confirmation Modal */}
      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        className="cyber-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <Shield size={24} className="me-2 text-neon" />
            Confirm Deposit
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="confirmation-details">
            <Alert variant="info" className="mb-3">
              <Shield size={20} className="me-2" />
              Please review your deposit details before confirming.
            </Alert>

            <div className="deposit-details cyber-card p-3 mb-3">
              <div className="detail-row d-flex justify-content-between mb-2">
                <span className="text-white">Phone Number:</span>
                <span className="text-white fw-bold">{phoneNumber}</span>
              </div>
              <div className="detail-row d-flex justify-content-between mb-2">
                <span className="text-white">Amount:</span>
                <span className="text-white fw-bold">KES {parseFloat(depositAmount || 0).toFixed(2)}</span>
              </div>
              <div className="detail-row d-flex justify-content-between mb-2">
                <span className="text-white">Payment Method:</span>
                <span className="text-white">M-Pesa STK Push</span>
              </div>
              {selectedBonus && (
                <>
                  <div className="detail-row d-flex justify-content-between mb-2">
                    <span className="text-white">Bonus:</span>
                    <span className="text-energy-green fw-bold">+KES {calculateBonus().toFixed(2)}</span>
                  </div>
                  <hr style={{ borderColor: 'rgba(0, 240, 255, 0.3)' }} />
                  <div className="detail-row d-flex justify-content-between">
                    <span className="text-white fw-bold">Total Credit:</span>
                    <span className="text-neon fw-bold">KES {(parseFloat(depositAmount || 0) + calculateBonus()).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            <small className="text-white">
              You will receive an M-Pesa prompt on your phone. Enter your PIN to complete the transaction.
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>
          <Button
            className="btn-cyber"
            onClick={confirmDeposit}
          >
            <CheckCircle size={18} className="me-2" />
            Confirm Deposit
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Payment Status Modal */}
      <Modal
        show={showStatusModal}
        onHide={closeStatusModal}
        className="cyber-modal"
        centered
        backdrop="static"
        keyboard={paymentStatus === 'success' || paymentStatus === 'failed'}
      >
        <Modal.Header closeButton={paymentStatus === 'success' || paymentStatus === 'failed'}>
          <Modal.Title className="d-flex align-items-center">
            {paymentStatus === 'success' && <CheckCircle size={24} className="me-2 text-energy-green" />}
            {paymentStatus === 'failed' && <AlertCircle size={24} className="me-2 text-cyber-red" />}
            {(paymentStatus === 'pending' || paymentStatus === 'initiating') && <Clock size={24} className="me-2 text-neon" />}
            {paymentStatus === 'timeout' && <Clock size={24} className="me-2 text-warning" />}
            Payment Status
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          {(paymentStatus === 'initiating' || paymentStatus === 'pending') && (
            <Spinner animation="border" variant="primary" className="mb-3" />
          )}
          {paymentStatus === 'success' && (
            <CheckCircle size={64} color="#00FF85" className="mb-3" />
          )}
          {paymentStatus === 'failed' && (
            <AlertCircle size={64} color="#FF003C" className="mb-3" />
          )}
          {paymentStatus === 'timeout' && (
            <Clock size={64} color="#FFA500" className="mb-3" />
          )}

          <p className="text-white h5 mb-3">{statusMessage}</p>

          {paymentStatus === 'pending' && (
            <small className="text-white-50">
              Waiting for payment confirmation... Please complete the payment on your phone.
            </small>
          )}

          {checkoutRequestId && (
            <small className="text-white-50 d-block mt-2">
              Transaction ID: {checkoutRequestId.substring(0, 20)}...
            </small>
          )}
        </Modal.Body>
        {(paymentStatus === 'success' || paymentStatus === 'failed' || paymentStatus === 'timeout') && (
          <Modal.Footer>
            <Button
              className="btn-cyber w-100"
              onClick={closeStatusModal}
            >
              Close
            </Button>
            {paymentStatus === 'timeout' && (
              <Button
                variant="outline-primary"
                className="w-100 mt-2"
                onClick={retryStatusCheck}
              >
                Retry Status Check
              </Button>
            )}
          </Modal.Footer>
        )}
      </Modal>

      {/* Withdrawal Modal */}
      <Modal
        show={showWithdrawModal}
        onHide={() => setShowWithdrawModal(false)}
        className="cyber-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <ArrowDownToLine size={24} className="me-2 text-energy-green" />
            Withdraw Funds
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="mb-3">
            <Shield size={20} className="me-2" />
            Withdrawals are processed within 24 hours to your M-Pesa account.
          </Alert>

          {/* Current Balance */}
          <div className="cyber-card p-3 mb-4">
            <div className="text-center">
              <small className="text-white d-block mb-1">Available Balance</small>
              <h3 className="text-neon mb-0">KES {balance.toFixed(2)}</h3>
            </div>
          </div>

          <Form>
            {/* M-Pesa Phone Number */}
            <Form.Group className="mb-3">
              <Form.Label className="text-white">M-Pesa Phone Number</Form.Label>
              <div className="input-group">
                <span
                  className="input-group-text"
                  style={{
                    background: 'rgba(31, 31, 35, 0.8)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    color: '#00F0FF'
                  }}
                >
                  <Phone size={18} />
                </span>
                <Form.Control
                  type="tel"
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  placeholder="07XXXXXXXX or 2547XXXXXXXX"
                  maxLength="12"
                />
              </div>
              <Form.Text className="text-white-50">
                Enter your M-Pesa number to receive the funds
              </Form.Text>
            </Form.Group>

            {/* Withdrawal Amount */}
            <Form.Group className="mb-3">
              <Form.Label className="text-white">Withdrawal Amount (KES)</Form.Label>
              <div className="input-group">
                <span
                  className="input-group-text"
                  style={{
                    background: 'rgba(31, 31, 35, 0.8)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    color: '#00FF85'
                  }}
                >
                  KES
                </span>
                <Form.Control
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="100"
                  max={balance}
                  step="1"
                />
              </div>
              <Form.Text className="text-white-50">
                Minimum: KES 100 | Available: KES {balance.toFixed(2)}
              </Form.Text>
            </Form.Group>

            {/* Withdrawal Summary */}
            {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
              <div className="cyber-card p-3 mb-3" style={{ background: 'rgba(0, 255, 133, 0.05)', border: '1px solid rgba(0, 255, 133, 0.2)' }}>
                <h6 className="text-energy-green mb-3">Withdrawal Summary</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-white">Amount to withdraw:</span>
                  <span className="text-white fw-bold">KES {parseFloat(withdrawAmount).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-white">Processing fee:</span>
                  <span className="text-white">KES 0.00</span>
                </div>
                <hr style={{ borderColor: 'rgba(0, 255, 133, 0.3)' }} />
                <div className="d-flex justify-content-between">
                  <span className="text-white fw-bold">You will receive:</span>
                  <span className="text-energy-green fw-bold">KES {parseFloat(withdrawAmount).toFixed(2)}</span>
                </div>
              </div>
            )}

            <Alert variant="warning" className="small mb-0">
              <AlertCircle size={16} className="me-2" />
              Processing time: 1-24 hours. You'll receive an M-Pesa confirmation once processed.
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowWithdrawModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleWithdraw}
            disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || !withdrawPhone || withdrawing || parseFloat(withdrawAmount) > balance}
          >
            {withdrawing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              <>
                <ArrowDownToLine size={18} className="me-2" />
                Withdraw KES {parseFloat(withdrawAmount || 0).toFixed(2)}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notification */}
      <ToastNotification
        show={showToast}
        message={toastMessage}
        variant={toastVariant}
        onClose={() => setShowToast(false)}
      />

      <style jsx>{`
        .wallet-card {
          transition: all 0.3s ease;
        }

        .wallet-card:hover {
          transform: translateY(-3px);
        }

        .security-alert {
          background: rgba(0, 240, 255, 0.1) !important;
          border: 1px solid rgba(0, 240, 255, 0.3) !important;
          color: #F5F5F5 !important;
        }

        .quick-amount-btn {
          transition: all 0.3s ease;
        }

        .quick-amount-btn:hover {
          background: rgba(0, 240, 255, 0.2) !important;
          color: #00F0FF !important;
          transform: translateY(-2px);
        }

        .deposit-summary {
          background: rgba(0, 240, 255, 0.05) !important;
          border: 1px solid rgba(0, 240, 255, 0.2) !important;
        }

        .bonus-offer {
          transition: all 0.3s ease;
        }

        .bonus-offer:hover:not(.disabled) {
          background: rgba(0, 240, 255, 0.05) !important;
        }

        .bonus-offer.selected {
          position: relative;
        }

        .bonus-offer.selected::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(45deg, #00F0FF, #9B00FF);
        }

        .transaction-item {
          transition: all 0.3s ease;
        }

        .transaction-item:hover {
          background: rgba(0, 240, 255, 0.05);
        }

        .cyber-modal .modal-content {
          background: rgba(31, 31, 35, 0.95) !important;
          border: 1px solid rgba(0, 240, 255, 0.3) !important;
          backdrop-filter: blur(10px);
        }

        .cyber-modal .modal-header {
          border-bottom: 1px solid rgba(0, 240, 255, 0.3) !important;
        }

        .cyber-modal .modal-footer {
          border-top: 1px solid rgba(0, 240, 255, 0.3) !important;
        }

        .deposit-details {
          background: rgba(0, 240, 255, 0.05) !important;
          border: 1px solid rgba(0, 240, 255, 0.2) !important;
        }
      `}</style>
    </div>
  )
}

export default Deposit
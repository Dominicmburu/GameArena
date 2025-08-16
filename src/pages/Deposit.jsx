import React, { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Badge, Alert, Modal } from 'react-bootstrap'
import { Wallet, CreditCard, DollarSign, Shield, Clock, CheckCircle, AlertCircle, Gift } from 'lucide-react'

const Deposit = () => {
  const [depositAmount, setDepositAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('credit-card')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [selectedBonus, setSelectedBonus] = useState(null)

  // Mock user wallet data
  const walletData = {
    balance: 1250.75,
    pendingDeposits: 100.00,
    totalDeposited: 5420.30,
    totalWithdrawn: 3890.50
  }

  // Mock transaction history
  const recentTransactions = [
    { id: 1, type: 'deposit', amount: 250, method: 'Credit Card', status: 'completed', date: '2024-08-15' },
    { id: 2, type: 'withdrawal', amount: 150, method: 'PayPal', status: 'completed', date: '2024-08-14' },
    { id: 3, type: 'deposit', amount: 100, method: 'Crypto', status: 'pending', date: '2024-08-14' },
    { id: 4, type: 'deposit', amount: 500, method: 'Bank Transfer', status: 'completed', date: '2024-08-12' }
  ]

  // Deposit bonuses
  const bonusOffers = [
    {
      id: 1,
      title: 'First Deposit Bonus',
      description: '100% match up to $500',
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
      description: '25% bonus on deposits over $1000',
      minDeposit: 1000,
      maxBonus: 1000,
      percentage: 25,
      code: 'HIGHROLL25',
      active: true
    }
  ]

  const quickAmounts = [25, 50, 100, 250, 500, 1000]

  const handleQuickAmount = (amount) => {
    setDepositAmount(amount.toString())
  }

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid deposit amount')
      return
    }
    setShowConfirmModal(true)
  }

  const confirmDeposit = () => {
    // Here would be the actual payment processing
    console.log('Processing deposit:', {
      amount: depositAmount,
      method: paymentMethod,
      bonus: selectedBonus,
      promoCode
    })
    setShowConfirmModal(false)
    // Reset form or show success message
  }

  const calculateBonus = () => {
    if (!selectedBonus || !depositAmount) return 0
    const amount = parseFloat(depositAmount)
    const bonus = Math.min(amount * (selectedBonus.percentage / 100), selectedBonus.maxBonus)
    return bonus
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#00FF85'
      case 'pending': return '#00F0FF'
      case 'failed': return '#FF003C'
      default: return '#B0B0B0'
    }
  }

  return (
    <div className="deposit-page animated-bg">
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="page-header cyber-card p-4">
              <h1 className="cyber-text text-neon mb-2">
                <Wallet size={32} className="me-3" />
                Wallet & Deposits
              </h1>
              <p className="text-white mb-0">Manage your gaming funds and make secure deposits</p>
            </div>
          </Col>
        </Row>

        {/* Wallet Overview */}
        <Row className="mb-4">
          <Col lg={3} sm={6} className="mb-3">
            <Card className="cyber-card wallet-card h-100">
              <Card.Body className="text-center">
                <DollarSign size={30} color="#00F0FF" className="mb-2" />
                <h4 className="text-neon fw-bold">${walletData.balance.toFixed(2)}</h4>
                <small className="text-white">Available Balance</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} sm={6} className="mb-3">
            <Card className="cyber-card wallet-card h-100">
              <Card.Body className="text-center">
                <Clock size={30} color="#9B00FF" className="mb-2" />
                <h4 className="text-purple fw-bold">${walletData.pendingDeposits.toFixed(2)}</h4>
                <small className="text-white">Pending Deposits</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} sm={6} className="mb-3">
            <Card className="cyber-card wallet-card h-100">
              <Card.Body className="text-center">
                <Wallet size={30} color="#00FF85" className="mb-2" />
                <h4 className="text-energy-green fw-bold">${walletData.totalDeposited.toFixed(2)}</h4>
                <small className="text-white">Total Deposited</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} sm={6} className="mb-3">
            <Card className="cyber-card wallet-card h-100">
              <Card.Body className="text-center">
                <CheckCircle size={30} color="#FF003C" className="mb-2" />
                <h4 className="text-cyber-red fw-bold">${walletData.totalWithdrawn.toFixed(2)}</h4>
                <small className="text-white">Total Withdrawn</small>
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
                  Make a Deposit
                </h5>
              </Card.Header>
              <Card.Body>
                {/* Security Notice */}
                <Alert className="security-alert mb-4" variant="info">
                  <Shield size={20} className="me-2" />
                  Your financial information is protected with 256-bit SSL encryption and industry-standard security measures.
                </Alert>

                <Form>
                  {/* Deposit Amount */}
                  <Form.Group className="mb-4">
                    <Form.Label className="text-white h6">Deposit Amount</Form.Label>
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
                          $
                        </span>
                        <Form.Control
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="Enter amount"
                          min="1"
                          step="0.01"
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
                              ${amount}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Form.Group>

                  {/* Payment Methods */}
                  <Form.Group className="mb-4">
                    <Form.Label className="text-white h6">Payment Method</Form.Label>
                    <div className="payment-methods">
                      <Row>
                        <Col md={6} className="mb-3">
                          <div 
                            className={`payment-option cyber-card p-3 cursor-pointer ${paymentMethod === 'credit-card' ? 'selected' : ''}`}
                            onClick={() => setPaymentMethod('credit-card')}
                            style={{
                              border: paymentMethod === 'credit-card' ? '2px solid #00F0FF' : '1px solid rgba(0, 240, 255, 0.3)',
                              cursor: 'pointer'
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <CreditCard size={24} color="#00F0FF" className="me-3" />
                              <div>
                                <div className="text-white fw-bold">Credit/Debit Card</div>
                                <small className="text-white">Instant deposit</small>
                              </div>
                            </div>
                          </div>
                        </Col>
                        <Col md={6} className="mb-3">
                          <div 
                            className={`payment-option cyber-card p-3 cursor-pointer ${paymentMethod === 'crypto' ? 'selected' : ''}`}
                            onClick={() => setPaymentMethod('crypto')}
                            style={{
                              border: paymentMethod === 'crypto' ? '2px solid #00F0FF' : '1px solid rgba(0, 240, 255, 0.3)',
                              cursor: 'pointer'
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <DollarSign size={24} color="#00FF85" className="me-3" />
                              <div>
                                <div className="text-white fw-bold">Cryptocurrency</div>
                                <small className="text-white">Bitcoin, Ethereum</small>
                              </div>
                            </div>
                          </div>
                        </Col>
                        <Col md={6} className="mb-3">
                          <div 
                            className={`payment-option cyber-card p-3 cursor-pointer ${paymentMethod === 'bank' ? 'selected' : ''}`}
                            onClick={() => setPaymentMethod('bank')}
                            style={{
                              border: paymentMethod === 'bank' ? '2px solid #00F0FF' : '1px solid rgba(0, 240, 255, 0.3)',
                              cursor: 'pointer'
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <Shield size={24} color="#FF003C" className="me-3" />
                              <div>
                                <div className="text-white fw-bold">Bank Transfer</div>
                                <small className="text-white">1-3 business days</small>
                              </div>
                            </div>
                          </div>
                        </Col>
                      </Row>
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
                        <span className="text-white fw-bold">${parseFloat(depositAmount || 0).toFixed(2)}</span>
                      </div>
                      {selectedBonus && (
                        <>
                          <div className="summary-row d-flex justify-content-between mb-2">
                            <span className="text-white">Bonus ({selectedBonus.percentage}%):</span>
                            <span className="text-energy-green fw-bold">+${calculateBonus().toFixed(2)}</span>
                          </div>
                          <hr style={{ borderColor: 'rgba(0, 240, 255, 0.3)' }} />
                          <div className="summary-row d-flex justify-content-between">
                            <span className="text-white fw-bold">Total Credit:</span>
                            <span className="text-neon fw-bold">${(parseFloat(depositAmount || 0) + calculateBonus()).toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <Button 
                    className="btn-cyber w-100"
                    size="lg"
                    onClick={handleDeposit}
                    disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                  >
                    <CreditCard size={20} className="me-2" />
                    Deposit ${parseFloat(depositAmount || 0).toFixed(2)}
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
                        Min deposit: ${bonus.minDeposit} | Max bonus: ${bonus.maxBonus}
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
                {recentTransactions.map(transaction => (
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
                          <span className={`transaction-type me-2 ${transaction.type === 'deposit' ? 'text-energy-green' : 'text-cyber-red'}`}>
                            {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount}
                          </span>
                          <Badge 
                            style={{ 
                              background: getStatusColor(transaction.status),
                              color: '#0E0E10',
                              fontSize: '0.7rem'
                            }}
                          >
                            {transaction.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="transaction-details">
                          <small className="text-white">
                            {transaction.method} • {new Date(transaction.date).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                      <div className="transaction-icon">
                        {transaction.status === 'completed' && <CheckCircle size={16} color="#00FF85" />}
                        {transaction.status === 'pending' && <Clock size={16} color="#00F0FF" />}
                        {transaction.status === 'failed' && <AlertCircle size={16} color="#FF003C" />}
                      </div>
                    </div>
                  </div>
                ))}
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
                <span className="text-white">Amount:</span>
                <span className="text-white fw-bold">${parseFloat(depositAmount || 0).toFixed(2)}</span>
              </div>
              <div className="detail-row d-flex justify-content-between mb-2">
                <span className="text-white">Payment Method:</span>
                <span className="text-white">{paymentMethod.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              </div>
              {selectedBonus && (
                <>
                  <div className="detail-row d-flex justify-content-between mb-2">
                    <span className="text-white">Bonus:</span>
                    <span className="text-energy-green fw-bold">+${calculateBonus().toFixed(2)}</span>
                  </div>
                  <hr style={{ borderColor: 'rgba(0, 240, 255, 0.3)' }} />
                  <div className="detail-row d-flex justify-content-between">
                    <span className="text-white fw-bold">Total Credit:</span>
                    <span className="text-neon fw-bold">${(parseFloat(depositAmount || 0) + calculateBonus()).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
            
            <small className="text-white">
              By confirming this deposit, you agree to our Terms of Service and acknowledge that all transactions are final.
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

        .payment-option {
          transition: all 0.3s ease;
        }

        .payment-option:hover {
          transform: translateY(-2px);
        }

        .payment-option.selected {
          box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
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
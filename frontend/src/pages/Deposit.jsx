import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Container, Spinner } from 'react-bootstrap'
import {
  Wallet, ArrowDown, ArrowUp, Plus, Phone, RefreshCw,
  CheckCircle, AlertCircle, Clock, Activity, ChevronRight,
  TrendingUp, TrendingDown, Trophy, Gamepad2, Receipt, ShieldCheck,
  Info, ChevronDown,
} from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'
import { formatKES, floorKES } from '../utils/formatters'
import '../styles/PlayPage.css'
import '../styles/WalletPage.css'

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000]
const POLL_INTERVAL_MS = 3000
const POLL_MAX_MS      = 5 * 60 * 1000   // 5 minutes
const MIN_DEPOSIT      = 1
const MAX_DEPOSIT      = 150000
const MIN_WITHDRAW     = 100

const formatPhoneNumber = (raw) => {
  let cleaned = String(raw || '').replace(/\D/g, '')
  if (cleaned.startsWith('0'))   cleaned = '254' + cleaned.slice(1)
  if (!cleaned.startsWith('254')) cleaned = '254' + cleaned
  return cleaned
}

const validatePhone = (raw) => /^254\d{9}$/.test(formatPhoneNumber(raw))

const formatPhoneDisplay = (raw) => {
  // Display-friendly version: 0712 345 678 if Kenyan, otherwise as-is
  const cleaned = String(raw || '').replace(/\D/g, '')
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    const local = '0' + cleaned.slice(3)
    return `${local.slice(0,4)} ${local.slice(4,7)} ${local.slice(7)}`
  }
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `${cleaned.slice(0,4)} ${cleaned.slice(4,7)} ${cleaned.slice(7)}`
  }
  return raw
}

const sameDay = (a, b) => {
  const d1 = new Date(a), d2 = new Date(b)
  return d1.toDateString() === d2.toDateString()
}

const groupByDay = (txs) => {
  const today     = new Date()
  const yesterday = new Date(today.getTime() - 86400000)
  const groups = {}
  txs.forEach(tx => {
    const d = new Date(tx.createdAt)
    let key
    if (sameDay(d, today))         key = 'Today'
    else if (sameDay(d, yesterday)) key = 'Yesterday'
    else                            key = d.toLocaleDateString('en-KE', {
      weekday: 'long', month: 'short', day: 'numeric',
    })
    if (!groups[key]) groups[key] = []
    groups[key].push(tx)
  })
  return groups
}

const TYPE_FILTERS = [
  { key: 'all',        label: 'All' },
  { key: 'DEPOSIT',    label: 'Deposits' },
  { key: 'WITHDRAWAL', label: 'Withdrawals' },
  { key: 'PRIZE',      label: 'Prizes' },
  { key: 'ENTRY_FEE',  label: 'Entry Fees' },
]

const TYPE_META = {
  DEPOSIT:    { label: 'Deposit',     icon: ArrowDown,  sign: '+', color: '#5BC58A' },
  WITHDRAWAL: { label: 'Withdrawal',  icon: ArrowUp,    sign: '−', color: '#E08888' },
  PRIZE:      { label: 'Prize Won',   icon: Trophy,     sign: '+', color: '#F6AD55' },
  ENTRY_FEE:  { label: 'Entry Fee',   icon: Gamepad2,   sign: '−', color: '#B0B0B0' },
  REFUND:     { label: 'Refund',      icon: ArrowDown,  sign: '+', color: '#5BC58A' },
  TRANSFER:   { label: 'Transfer',    icon: Activity,   sign: '',  color: '#B0B0B0' },
}

const txStatus = (tx) => (tx.meta?.status || 'COMPLETED').toUpperCase()
const STATUS_COLOR = {
  COMPLETED: '#5BC58A',
  PENDING:   '#F6AD55',
  FAILED:    '#E08888',
  CANCELLED: '#B0B0B0',
}

const Deposit = () => {
  const {
    balance, transactions, isLoading, error,
    deposit, withdraw, querySTKStatus,
    fetchBalance, fetchTransactions,
  } = useWallet()

  const [tab, setTab] = useState('activity')     // 'activity' | 'deposit' | 'withdraw'
  const [typeFilter, setTypeFilter] = useState('all')

  // Deposit state
  const [dAmount, setDAmount] = useState('')
  const [dPhone, setDPhone]   = useState('')
  const [dStage, setDStage]   = useState('idle') // idle | sending | waiting | success | failed
  const [dStatusMsg, setDStatusMsg] = useState('')
  const [dCheckoutId, setDCheckoutId] = useState(null)
  const [dElapsed, setDElapsed] = useState(0)    // ms elapsed waiting

  // Withdraw state
  const [wAmount, setWAmount] = useState('')
  const [wPhone, setWPhone]   = useState('')
  const [wStage, setWStage]   = useState('idle') // idle | sending | success | failed
  const [wStatusMsg, setWStatusMsg] = useState('')
  const [showPochiGuide, setShowPochiGuide] = useState(false)

  // Feedback toast (small, dismissible)
  const [feedback, setFeedback] = useState(null)

  // refs for polling lifecycle
  const pollRef     = useRef(null)
  const elapsedRef  = useRef(null)
  const startTimeRef= useRef(0)
  const isMountedRef= useRef(true)

  // Initial load
  useEffect(() => {
    isMountedRef.current = true
    fetchBalance()
    fetchTransactions()
    return () => {
      isMountedRef.current = false
      clearAllTimers()
    }
  }, [])

  const clearAllTimers = () => {
    if (pollRef.current)    { clearInterval(pollRef.current);    pollRef.current = null }
    if (elapsedRef.current) { clearInterval(elapsedRef.current); elapsedRef.current = null }
  }

  const showFeedback = (msg, type = 'ok') => {
    setFeedback({ msg, type })
    setTimeout(() => setFeedback(null), 5000)
  }

  // ── Deposit flow ──────────────────────────────────────────
  const submitDeposit = async () => {
    const amt = floorKES(dAmount)
    if (!amt || amt < MIN_DEPOSIT)  return showFeedback(`Minimum deposit is ${formatKES(MIN_DEPOSIT)}`, 'err')
    if (amt > MAX_DEPOSIT)           return showFeedback(`Maximum deposit is ${formatKES(MAX_DEPOSIT)}`, 'err')
    if (!validatePhone(dPhone))      return showFeedback('Enter a valid Kenyan phone number', 'err')

    setDStage('sending')
    setDStatusMsg('Sending request to M-Pesa...')

    try {
      const result = await deposit(amt, formatPhoneNumber(dPhone))
      if (result?.success && result.data?.checkoutRequestId) {
        setDCheckoutId(result.data.checkoutRequestId)
        setDStage('waiting')
        setDStatusMsg('Check your phone — enter your M-Pesa PIN to confirm')
        startPolling(result.data.checkoutRequestId)
      } else {
        setDStage('failed')
        setDStatusMsg(result?.message || 'Could not start M-Pesa payment')
      }
    } catch (err) {
      setDStage('failed')
      setDStatusMsg(err?.response?.data?.error || err?.message || 'Deposit failed')
    }
  }

  const startPolling = (checkoutId) => {
    clearAllTimers()
    startTimeRef.current = Date.now()
    setDElapsed(0)

    elapsedRef.current = setInterval(() => {
      if (!isMountedRef.current) return
      setDElapsed(Date.now() - startTimeRef.current)
    }, 1000)

    pollRef.current = setInterval(async () => {
      if (!isMountedRef.current) { clearAllTimers(); return }
      const elapsed = Date.now() - startTimeRef.current
      if (elapsed >= POLL_MAX_MS) {
        clearAllTimers()
        setDStage('failed')
        setDStatusMsg("We haven't heard back from M-Pesa yet. Use 'Check status' below or try again.")
        return
      }

      try {
        const result = await querySTKStatus(checkoutId)
        if (!isMountedRef.current) return

        if (result.status === 'COMPLETED') {
          clearAllTimers()
          setDStage('success')
          setDStatusMsg(`Wallet credited with ${formatKES(dAmount)}`)
          fetchBalance()
          fetchTransactions()
        } else if (result.status === 'FAILED') {
          clearAllTimers()
          setDStage('failed')
          setDStatusMsg(result.failureReason || result.resultDesc || 'Payment failed')
        } else if (result.status === 'CANCELLED') {
          clearAllTimers()
          setDStage('failed')
          setDStatusMsg('Payment was cancelled')
        }
      } catch (err) {
        // Continue polling
        console.warn('Status check error', err)
      }
    }, POLL_INTERVAL_MS)
  }

  const manualStatusCheck = async () => {
    if (!dCheckoutId) return
    setDStage('waiting')
    setDStatusMsg('Checking status...')
    startPolling(dCheckoutId)
  }

  const resetDeposit = () => {
    clearAllTimers()
    setDStage('idle')
    setDAmount('')
    setDStatusMsg('')
    setDCheckoutId(null)
    setDElapsed(0)
  }

  // ── Withdraw flow ─────────────────────────────────────────
  const submitWithdraw = async () => {
    const amt = floorKES(wAmount)
    if (!amt || amt < MIN_WITHDRAW)  return showFeedback(`Minimum withdrawal is ${formatKES(MIN_WITHDRAW)}`, 'err')
    if (amt > balance)               return showFeedback('Insufficient balance', 'err')
    if (!validatePhone(wPhone))      return showFeedback('Enter a valid Kenyan phone number', 'err')

    setWStage('sending')
    setWStatusMsg('Submitting withdrawal request...')

    try {
      const result = await withdraw(amt, formatPhoneNumber(wPhone))
      if (result?.success !== false) {
        setWStage('success')
        setWStatusMsg(`Withdrawal of ${formatKES(amt)} submitted. M-Pesa processes within 1–24 hours.`)
        await Promise.all([fetchBalance(), fetchTransactions()])
      } else {
        setWStage('failed')
        setWStatusMsg(result?.message || 'Withdrawal failed')
      }
    } catch (err) {
      setWStage('failed')
      setWStatusMsg(err?.response?.data?.error || err?.message || 'Withdrawal failed')
    }
  }

  const resetWithdraw = () => {
    setWStage('idle')
    setWAmount('')
    setWStatusMsg('')
  }

  // ── Derived data ──────────────────────────────────────────
  const filteredTxs = useMemo(() => {
    if (typeFilter === 'all') return transactions
    return transactions.filter(t => t.type === typeFilter)
  }, [transactions, typeFilter])

  const groupedTxs = useMemo(() => groupByDay(filteredTxs), [filteredTxs])

  const monthlySummary = useMemo(() => {
    const now = new Date()
    const thisMonth = transactions.filter(t => {
      const d = new Date(t.createdAt)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        && txStatus(t) === 'COMPLETED'
    })
    const sum = (type) => thisMonth.filter(t => t.type === type).reduce((s, t) => s + (t.amount || 0), 0)
    const deposited = sum('DEPOSIT')
    const won       = sum('PRIZE')
    const spent     = sum('ENTRY_FEE')
    const withdrew  = sum('WITHDRAWAL')
    const net       = deposited + won - spent - withdrew
    return { deposited, won, spent, withdrew, net }
  }, [transactions])

  const remainingPoll = useMemo(() => {
    const left = POLL_MAX_MS - dElapsed
    if (left <= 0) return '0:00'
    const s = Math.floor(left / 1000)
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  }, [dElapsed])

  return (
    <div className="pp-page">
      <Container fluid className="pp-container">
        {/* Header */}
        <div className="pp-header wp-header">
          <div className="pp-header-top">
            <div className="pp-header-titleblock">
              <h1 className="pp-title">
                <Wallet size={20} style={{ marginRight: 10, verticalAlign: 'middle', color: '#C53030' }} />
                Wallet
              </h1>
              <p className="pp-subtitle">Manage your funds and view transactions</p>
            </div>

            <div className="wp-balance">
              <div className="wp-balance-label">Available Balance</div>
              <div className="wp-balance-value">
                {isLoading ? <Spinner animation="border" size="sm" /> : formatKES(balance)}
              </div>
              <button
                type="button"
                onClick={fetchBalance}
                disabled={isLoading}
                className="wp-balance-refresh"
                title="Refresh"
                aria-label="Refresh balance"
              >
                <RefreshCw size={13} className={isLoading ? 'pp-spin' : ''} />
              </button>
            </div>
          </div>

          {error && (
            <div className="tp-feedback tp-feedback--err" style={{ marginTop: 14 }}>
              <AlertCircle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              {error}
            </div>
          )}

          {feedback && (
            <div className={`tp-feedback tp-feedback--${feedback.type}`} style={{ marginTop: 14 }}>
              {feedback.msg}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="pp-maintabs">
          <button
            type="button"
            className={`pp-maintab ${tab === 'activity' ? 'active' : ''}`}
            onClick={() => setTab('activity')}
          >
            <Activity size={15} /> <span>Activity</span>
          </button>
          <button
            type="button"
            className={`pp-maintab ${tab === 'deposit' ? 'active' : ''}`}
            onClick={() => { setTab('deposit'); resetDeposit() }}
          >
            <ArrowDown size={15} /> <span>Deposit</span>
          </button>
          <button
            type="button"
            className={`pp-maintab ${tab === 'withdraw' ? 'active' : ''}`}
            onClick={() => { setTab('withdraw'); resetWithdraw() }}
          >
            <ArrowUp size={15} /> <span>Withdraw</span>
          </button>
        </div>

        <div className="pp-layout">
          <div className="pp-main">

            {/* ── DEPOSIT TAB ───────────────────────────── */}
            {tab === 'deposit' && (
              <div className="wp-card">
                {dStage === 'idle' && (
                  <>
                    <div className="wp-form-head">
                      <ArrowDown size={16} color="#5BC58A" />
                      <h3>Deposit via M-Pesa</h3>
                    </div>
                    <p className="wp-form-hint">
                      <ShieldCheck size={12} /> You'll receive an STK push on your phone — enter your PIN to confirm.
                    </p>

                    <div className="wp-field">
                      <label className="wp-label">M-Pesa Phone Number</label>
                      <div className="wp-input-prefix">
                        <span className="wp-input-prefix-icon"><Phone size={14} /></span>
                        <input
                          type="tel"
                          className="wp-input"
                          placeholder="0712 345 678"
                          value={dPhone}
                          onChange={e => setDPhone(e.target.value)}
                          maxLength={15}
                          autoComplete="tel"
                        />
                      </div>
                    </div>

                    <div className="wp-field">
                      <label className="wp-label">Amount (KES)</label>
                      <div className="wp-input-prefix">
                        <span className="wp-input-prefix-icon-text">KES</span>
                        <input
                          type="number"
                          className="wp-input wp-input--big"
                          placeholder="0"
                          value={dAmount}
                          onChange={e => setDAmount(e.target.value)}
                          min={MIN_DEPOSIT}
                          max={MAX_DEPOSIT}
                          step="1"
                        />
                      </div>
                      <div className="wp-quick-pills">
                        {QUICK_AMOUNTS.map(a => (
                          <button
                            type="button"
                            key={a}
                            className={`wp-quick-pill ${dAmount === String(a) ? 'active' : ''}`}
                            onClick={() => setDAmount(String(a))}
                          >
                            +{a}
                          </button>
                        ))}
                      </div>
                      <p className="wp-help">
                        Min {formatKES(MIN_DEPOSIT)} · Max {formatKES(MAX_DEPOSIT)}
                      </p>
                    </div>

                    {dAmount && parseFloat(dAmount) > 0 && (
                      <div className="wp-summary">
                        <div className="wp-summary-row">
                          <span>You'll receive</span>
                          <strong>{formatKES(dAmount)}</strong>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      className="pp-btn pp-btn-primary wp-submit"
                      onClick={submitDeposit}
                      disabled={!dAmount || !dPhone || isLoading}
                    >
                      <ArrowDown size={14} />
                      Deposit
                    </button>
                  </>
                )}

                {dStage !== 'idle' && (
                  <div className="wp-stage">
                    {dStage === 'sending' && (
                      <>
                        <Spinner animation="border" style={{ color: '#C53030', width: 48, height: 48, borderWidth: 4 }} />
                        <h3 className="wp-stage-title">Contacting M-Pesa...</h3>
                        <p className="wp-stage-msg">{dStatusMsg}</p>
                      </>
                    )}
                    {dStage === 'waiting' && (
                      <>
                        <Spinner animation="border" style={{ color: '#C53030', width: 48, height: 48, borderWidth: 4 }} />
                        <h3 className="wp-stage-title">Waiting for confirmation</h3>
                        <p className="wp-stage-msg">{dStatusMsg}</p>
                        <div className="wp-timer">
                          <Clock size={13} /> {remainingPoll} remaining
                        </div>
                        <button
                          type="button"
                          className="pp-btn pp-btn-ghost"
                          onClick={resetDeposit}
                          style={{ marginTop: 16 }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {dStage === 'success' && (
                      <>
                        <div className="wp-stage-icon wp-stage-icon--ok">
                          <CheckCircle size={48} color="#5BC58A" />
                        </div>
                        <h3 className="wp-stage-title" style={{ color: '#5BC58A' }}>Deposit Successful</h3>
                        <p className="wp-stage-msg">{dStatusMsg}</p>
                        <button type="button" className="pp-btn pp-btn-primary" onClick={resetDeposit} style={{ marginTop: 16 }}>
                          New Deposit
                        </button>
                      </>
                    )}
                    {dStage === 'failed' && (
                      <>
                        <div className="wp-stage-icon wp-stage-icon--err">
                          <AlertCircle size={48} color="#E08888" />
                        </div>
                        <h3 className="wp-stage-title" style={{ color: '#E08888' }}>Payment Issue</h3>
                        <p className="wp-stage-msg">{dStatusMsg}</p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                          {dCheckoutId && (
                            <button type="button" className="pp-btn pp-btn-ghost" onClick={manualStatusCheck}>
                              <RefreshCw size={14} /> Check status
                            </button>
                          )}
                          <button type="button" className="pp-btn pp-btn-primary" onClick={resetDeposit}>
                            Try Again
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── WITHDRAW TAB ──────────────────────────── */}
            {tab === 'withdraw' && (
              <div className="wp-card">
                {wStage === 'idle' && (
                  <>
                    <div className="wp-form-head">
                      <ArrowUp size={16} color="#E08888" />
                      <h3>Withdraw to M-Pesa</h3>
                    </div>
                    <p className="wp-form-hint">
                      <Clock size={12} /> Processing time: 1–24 hours via M-Pesa B2C.
                    </p>

                    {/* Pochi La Biashara notice */}
                    <div className="wp-pochi">
                      <div className="wp-pochi-head">
                        <Info size={14} color="#F6AD55" />
                        <span>
                          Make sure <strong>Pochi La Biashara</strong> is activated on the number you're withdrawing to —
                          payouts can fail if it's not.
                        </span>
                      </div>
                      <button
                        type="button"
                        className={`wp-pochi-toggle ${showPochiGuide ? 'open' : ''}`}
                        onClick={() => setShowPochiGuide(v => !v)}
                      >
                        How to activate Pochi La Biashara
                        <ChevronDown size={13} />
                      </button>

                      {showPochiGuide && (
                        <div className="wp-pochi-guide">
                          <div className="wp-pochi-method">
                            <div className="wp-pochi-method-label">Option 1 — USSD (any phone)</div>
                            <ol className="wp-pochi-steps">
                              <li>Dial <code>*334#</code> on your M-Pesa number</li>
                              <li>Select <strong>"My Account"</strong></li>
                              <li>Choose <strong>"Pochi La Biashara"</strong></li>
                              <li>Select <strong>"Activate"</strong></li>
                              <li>Accept the terms and enter your M-Pesa PIN</li>
                              <li>You'll get an SMS confirming activation</li>
                            </ol>
                          </div>

                          <div className="wp-pochi-method">
                            <div className="wp-pochi-method-label">Option 2 — M-Pesa App</div>
                            <ol className="wp-pochi-steps">
                              <li>Open the <strong>M-Pesa</strong> app</li>
                              <li>Tap <strong>"Grow your Business"</strong> or <strong>"Pochi La Biashara"</strong></li>
                              <li>Tap <strong>"Activate"</strong></li>
                              <li>Accept terms and confirm with your M-Pesa PIN</li>
                            </ol>
                          </div>

                          <p className="wp-pochi-foot">
                            Activation is free and takes under a minute. Once activated, your number can receive
                            business-to-customer (B2C) payouts like withdrawals from GameArena.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="wp-field">
                      <label className="wp-label">M-Pesa Phone Number</label>
                      <div className="wp-input-prefix">
                        <span className="wp-input-prefix-icon"><Phone size={14} /></span>
                        <input
                          type="tel"
                          className="wp-input"
                          placeholder="0712 345 678"
                          value={wPhone}
                          onChange={e => setWPhone(e.target.value)}
                          maxLength={15}
                          autoComplete="tel"
                        />
                      </div>
                    </div>

                    <div className="wp-field">
                      <label className="wp-label">Amount (KES)</label>
                      <div className="wp-input-prefix">
                        <span className="wp-input-prefix-icon-text">KES</span>
                        <input
                          type="number"
                          className="wp-input wp-input--big"
                          placeholder="0"
                          value={wAmount}
                          onChange={e => setWAmount(e.target.value)}
                          min={MIN_WITHDRAW}
                          max={balance}
                          step="1"
                        />
                      </div>
                      <p className="wp-help">
                        Min {formatKES(MIN_WITHDRAW)} · Available {formatKES(balance)}
                      </p>
                    </div>

                    {wAmount && parseFloat(wAmount) > 0 && (
                      <div className="wp-summary">
                        <div className="wp-summary-row">
                          <span>Amount</span>
                          <strong>{formatKES(wAmount)}</strong>
                        </div>
                        <div className="wp-summary-row">
                          <span>Processing fee</span>
                          <strong>{formatKES(0)}</strong>
                        </div>
                        <div className="wp-summary-row wp-summary-row--total">
                          <span>You'll receive</span>
                          <strong style={{ color: '#5BC58A' }}>{formatKES(wAmount)}</strong>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      className="pp-btn pp-btn-primary wp-submit"
                      onClick={submitWithdraw}
                      disabled={!wAmount || !wPhone || isLoading || parseFloat(wAmount) > balance}
                    >
                      <ArrowUp size={14} />
                      Withdraw to Pochi
                    </button>
                  </>
                )}

                {wStage !== 'idle' && (
                  <div className="wp-stage">
                    {wStage === 'sending' && (
                      <>
                        <Spinner animation="border" style={{ color: '#C53030', width: 48, height: 48, borderWidth: 4 }} />
                        <h3 className="wp-stage-title">Submitting...</h3>
                        <p className="wp-stage-msg">{wStatusMsg}</p>
                      </>
                    )}
                    {wStage === 'success' && (
                      <>
                        <div className="wp-stage-icon wp-stage-icon--ok">
                          <CheckCircle size={48} color="#5BC58A" />
                        </div>
                        <h3 className="wp-stage-title" style={{ color: '#5BC58A' }}>Withdrawal Submitted</h3>
                        <p className="wp-stage-msg">{wStatusMsg}</p>
                        <button type="button" className="pp-btn pp-btn-primary" onClick={resetWithdraw} style={{ marginTop: 16 }}>
                          Done
                        </button>
                      </>
                    )}
                    {wStage === 'failed' && (
                      <>
                        <div className="wp-stage-icon wp-stage-icon--err">
                          <AlertCircle size={48} color="#E08888" />
                        </div>
                        <h3 className="wp-stage-title" style={{ color: '#E08888' }}>Withdrawal Failed</h3>
                        <p className="wp-stage-msg">{wStatusMsg}</p>
                        <button type="button" className="pp-btn pp-btn-primary" onClick={resetWithdraw} style={{ marginTop: 16 }}>
                          Try Again
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── ACTIVITY TAB ──────────────────────────── */}
            {tab === 'activity' && (
              <>
                <div className="pp-filterbar">
                  <div className="pp-status-pills">
                    {TYPE_FILTERS.map(f => (
                      <button
                        key={f.key}
                        type="button"
                        className={`pp-status-pill ${typeFilter === f.key ? 'active' : ''}`}
                        onClick={() => setTypeFilter(f.key)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredTxs.length === 0 ? (
                  <div className="pp-empty">
                    <Receipt size={42} color="#3A3A3A" />
                    <h5>No transactions yet</h5>
                    <p>Deposits, withdrawals, prizes, and entry fees will show up here.</p>
                    <button type="button" className="pp-btn pp-btn-primary" onClick={() => setTab('deposit')}>
                      <Plus size={14} /> Make a Deposit
                    </button>
                  </div>
                ) : (
                  <div className="wp-tx-list">
                    {Object.entries(groupedTxs).map(([day, txs]) => (
                      <div key={day} className="wp-tx-group">
                        <div className="wp-tx-day">{day}</div>
                        {txs.map(tx => {
                          const meta   = TYPE_META[tx.type] || { label: tx.type, icon: Activity, sign: '', color: '#B0B0B0' }
                          const status = txStatus(tx)
                          const Icon   = meta.icon
                          return (
                            <div key={tx.id} className="wp-tx-row">
                              <div className="wp-tx-icon" style={{ background: `${meta.color}22`, color: meta.color }}>
                                <Icon size={16} />
                              </div>
                              <div className="wp-tx-info">
                                <div className="wp-tx-title">{meta.label}</div>
                                <div className="wp-tx-meta">
                                  {tx.meta?.MpesaReceiptNumber || tx.meta?.mpesaReceiptNumber || (tx.type === 'DEPOSIT' || tx.type === 'WITHDRAWAL' ? 'M-Pesa' : '—')}
                                  {' · '}
                                  {new Date(tx.createdAt).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                              <div className="wp-tx-right">
                                <div className="wp-tx-amount" style={{ color: meta.color }}>
                                  {meta.sign}{formatKES(tx.amount)}
                                </div>
                                <span
                                  className="wp-tx-status"
                                  style={{
                                    background: `${STATUS_COLOR[status] || '#B0B0B0'}22`,
                                    color: STATUS_COLOR[status] || '#B0B0B0',
                                    border: `1px solid ${STATUS_COLOR[status] || '#B0B0B0'}55`,
                                  }}
                                >
                                  {status}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Sidebar: This Month ───────────────────── */}
          <aside className="pp-aside">
            <div className="wp-side-card">
              <div className="wp-side-head">
                <TrendingUp size={14} color="#C53030" />
                <span>This Month</span>
              </div>
              <div className="wp-side-body">
                <div className="wp-month-row">
                  <span><ArrowDown size={12} color="#5BC58A" /> Deposited</span>
                  <strong>{formatKES(monthlySummary.deposited)}</strong>
                </div>
                <div className="wp-month-row">
                  <span><Trophy size={12} color="#F6AD55" /> Won (prizes)</span>
                  <strong>{formatKES(monthlySummary.won)}</strong>
                </div>
                <div className="wp-month-row">
                  <span><Gamepad2 size={12} color="#B0B0B0" /> Entry fees</span>
                  <strong style={{ color: '#E08888' }}>−{formatKES(monthlySummary.spent)}</strong>
                </div>
                <div className="wp-month-row">
                  <span><ArrowUp size={12} color="#E08888" /> Withdrew</span>
                  <strong style={{ color: '#E08888' }}>−{formatKES(monthlySummary.withdrew)}</strong>
                </div>
                <div className="wp-month-row wp-month-row--total">
                  <span>Net</span>
                  <strong style={{ color: monthlySummary.net >= 0 ? '#5BC58A' : '#E08888' }}>
                    {monthlySummary.net >= 0 ? '+' : ''}{formatKES(monthlySummary.net)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="wp-side-card">
              <div className="wp-side-head">
                <ShieldCheck size={14} color="#3182CE" />
                <span>Quick Actions</span>
              </div>
              <div className="wp-side-actions">
                <button type="button" className="pp-btn pp-btn-primary" onClick={() => { setTab('deposit'); resetDeposit() }}>
                  <Plus size={14} /> Deposit
                </button>
                <button
                  type="button"
                  className="pp-btn pp-btn-ghost"
                  onClick={() => { setTab('withdraw'); resetWithdraw() }}
                  disabled={balance <= 0}
                >
                  <ArrowUp size={14} /> Withdraw
                </button>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  )
}

export default Deposit

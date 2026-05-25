import React, { useState, useEffect, useMemo } from 'react'
import { Container, Spinner } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus, Trophy, Users, Clock, Wallet, Lock, Globe, Calendar, AlertTriangle,
  Minus, ChevronRight, Check, Copy, Share2, Send, PartyPopper, Gamepad2,
  ChevronLeft, Info, Sparkles,
} from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import { useAuth } from '../contexts/AuthContext'
import { useWallet } from '../contexts/WalletContext'
import '../styles/MakeGame.css'

const formatKES = (n) =>
  `KES ${Number(n || 0).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

const formatRelative = (date) => {
  const diff = Math.round((date.getTime() - Date.now()) / 60000)
  if (diff < 1)    return 'starts now'
  if (diff < 60)   return `in ${diff} min`
  if (diff < 1440) return `in ${Math.round(diff / 60)} hr`
  return `in ${Math.round(diff / 1440)} day(s)`
}

const formatWhen = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-KE', {
    weekday: 'short', hour: '2-digit', minute: '2-digit',
  })
}

const formatDuration = (mins) => {
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

const QUICK_STARTS = [
  { label: 'In 5 min',  mins: 5 },
  { label: 'In 30 min', mins: 30 },
  { label: 'In 1 hour', mins: 60 },
  { label: 'In 2 hours',mins: 120 },
]
const DURATIONS = [
  { label: '30 min', mins: 30 },
  { label: '1 hour', mins: 60 },
  { label: '2 hours',mins: 120 },
  { label: '4 hours',mins: 240 },
]

const isoFromMinutesFromNow = (mins) => {
  const d = new Date(Date.now() + mins * 60000)
  d.setSeconds(0, 0)
  return d.toISOString().slice(0, 16)
}

const minutesBetween = (startIso, endIso) => {
  if (!startIso || !endIso) return 0
  return Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000)
}

const MakeGame = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { balance } = useWallet()
  const {
    games,
    loading,
    errors,
    createCompetition,
    invitePlayerByUsername,
  } = useGame()

  const [selectedGame, setSelectedGame] = useState(null)
  const [form, setForm] = useState({
    title: '',
    privacy: 'PRIVATE',
    maxPlayers: 4,
    entryFee: 0,
    startMins: 30,    // minutes from now
    durationMins: 120,
    customStart: '',  // when user chooses Custom
    customEnd: '',
  })
  const [errorsField, setErrorsField] = useState({})
  const [submitError, setSubmitError]   = useState(null)
  const [submitting, setSubmitting]     = useState(false)

  // Success state
  const [created, setCreated]           = useState(null)
  const [copied, setCopied]             = useState(false)
  const [inviteUsername, setInviteUsername] = useState('')
  const [inviting, setInviting]         = useState(false)
  const [inviteFeedback, setInviteFeedback] = useState(null)

  // Derived: start/end ISO from form state
  const startIso = useMemo(() => {
    if (form.startMins === 'custom') return form.customStart
    return isoFromMinutesFromNow(form.startMins)
  }, [form.startMins, form.customStart])

  const endIso = useMemo(() => {
    if (form.durationMins === 'custom') return form.customEnd
    if (!startIso) return ''
    const start = new Date(startIso)
    return new Date(start.getTime() + form.durationMins * 60000).toISOString().slice(0, 16)
  }, [form.durationMins, form.customEnd, startIso])

  // Derived: financials
  const fee          = parseFloat(form.entryFee) || 0
  const players      = parseInt(form.maxPlayers) || 0
  const pool         = fee * players
  const platformPct  = form.privacy === 'PRIVATE' ? 15 : 20
  const platformFee  = pool * (platformPct / 100)
  const prize        = pool - platformFee
  const walletAfter  = balance - fee

  const isSelected = !!selectedGame
  const minFee     = selectedGame?.minEntryFee || 0
  const minPlayers = selectedGame?.minPlayers || 2
  const maxPlayers = selectedGame?.maxPlayers || 8

  const handleSelectGame = (game) => {
    setSelectedGame(game)
    setForm(prev => ({
      ...prev,
      maxPlayers: Math.min(Math.max(prev.maxPlayers, game.minPlayers || 2), game.maxPlayers || 8),
      entryFee: Math.max(prev.entryFee, game.minEntryFee || 0),
    }))
    // smooth scroll to setup section
    setTimeout(() => {
      document.getElementById('mg-setup')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrorsField(prev => ({ ...prev, [field]: null }))
  }

  const adjustPlayers = (delta) => {
    const next = Math.max(minPlayers, Math.min(maxPlayers, players + delta))
    updateField('maxPlayers', next)
  }

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Tournament title is required'
    else if (form.title.length < 3) errs.title = 'Title must be at least 3 characters'

    if (!selectedGame) errs.gameId = 'Pick a game first'

    if (players < minPlayers) errs.maxPlayers = `Min ${minPlayers} players`
    if (players > maxPlayers) errs.maxPlayers = `Max ${maxPlayers} players`

    if (fee < 0) errs.entryFee = 'Entry fee cannot be negative'
    if (minFee > 0 && fee < minFee) errs.entryFee = `Minimum ${formatKES(minFee)}`
    if (fee > balance) errs.entryFee = `Insufficient balance (${formatKES(balance)})`

    if (!startIso) errs.startsAt = 'Pick a start time'
    else if (new Date(startIso) <= new Date()) errs.startsAt = 'Start must be in the future'

    if (!endIso) errs.endsAt = 'Pick an end time'
    else if (new Date(endIso) <= new Date(startIso)) errs.endsAt = 'End must be after start'
    else if (minutesBetween(startIso, endIso) < 15) errs.endsAt = 'Must last at least 15 minutes'

    setErrorsField(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    setSubmitError(null)
    if (!validate()) return

    try {
      setSubmitting(true)
      const result = await createCompetition({
        title: form.title.trim(),
        gameId: selectedGame.id,
        privacy: form.privacy,
        maxPlayers: players,
        entryFee: Math.round(fee),
        startsAt: new Date(startIso).toISOString(),
        endsAt:   new Date(endIso).toISOString(),
      })
      setCreated(result)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || 'Failed to create competition')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = async () => {
    if (!created?.code) return
    try {
      await navigator.clipboard.writeText(created.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleShare = async () => {
    if (!created?.code) return
    const url = `${window.location.origin}/play?code=${created.code}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: created.title,
          text: `Join my "${created.title}" competition on GameArena! Code: ${created.code}`,
          url,
        })
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {}
    }
  }

  const handleInvite = async (e) => {
    e?.preventDefault?.()
    if (!inviteUsername.trim() || inviting || !created) return
    try {
      setInviting(true)
      setInviteFeedback(null)
      await invitePlayerByUsername({
        competitionId: created.id,
        username: inviteUsername.trim(),
      })
      setInviteFeedback({ type: 'ok', msg: `Sent invite to ${inviteUsername.trim()}` })
      setInviteUsername('')
      setTimeout(() => setInviteFeedback(null), 4000)
    } catch (err) {
      setInviteFeedback({
        type: 'err',
        msg: err.response?.data?.message || err.message || 'Failed to send invite',
      })
    } finally {
      setInviting(false)
    }
  }

  const resetAll = () => {
    setSelectedGame(null)
    setForm({
      title: '', privacy: 'PRIVATE', maxPlayers: 4, entryFee: 0,
      startMins: 30, durationMins: 120, customStart: '', customEnd: '',
    })
    setErrorsField({})
    setSubmitError(null)
    setCreated(null)
    setInviteUsername('')
    setInviteFeedback(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Success state ──────────────────────────────────
  if (created) {
    return (
      <div className="mg-page">
        <Container fluid className="mg-container">
          <div className="mg-success">
            <div className="mg-success-icon">
              <PartyPopper size={48} color="#5BC58A" />
            </div>
            <h2 className="mg-success-title">Competition Created</h2>
            <p className="mg-success-sub">
              Your tournament <strong>"{created.title}"</strong> is live.
              Share the code below to invite players.
            </p>

            <div className="mg-share-card">
              <div className="mg-share-label">Competition Code</div>
              <div className="mg-share-code">{created.code}</div>
              <div className="mg-share-actions">
                <button type="button" className="mg-share-btn" onClick={handleCopy}>
                  {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy code</>}
                </button>
                <button type="button" className="mg-share-btn" onClick={handleShare}>
                  <Share2 size={15} /> Share link
                </button>
              </div>
            </div>

            <div className="mg-invite-block">
              <div className="mg-invite-label">Invite a friend by username</div>
              <form onSubmit={handleInvite} className="mg-invite-row">
                <input
                  type="text"
                  className="mg-input"
                  placeholder="username"
                  value={inviteUsername}
                  onChange={e => setInviteUsername(e.target.value)}
                />
                <button
                  type="submit"
                  className="mg-btn mg-btn-primary"
                  disabled={!inviteUsername.trim() || inviting}
                >
                  {inviting ? <Spinner animation="border" size="sm" /> : <Send size={15} />}
                  Send invite
                </button>
              </form>
              {inviteFeedback && (
                <p className={`mg-invite-feedback mg-invite-feedback--${inviteFeedback.type}`}>
                  {inviteFeedback.msg}
                </p>
              )}
            </div>

            <div className="mg-success-bottom">
              <button type="button" className="mg-btn mg-btn-ghost" onClick={resetAll}>
                <Plus size={15} /> Create Another
              </button>
              <button
                type="button"
                className="mg-btn mg-btn-primary"
                onClick={() => navigate('/play')}
              >
                View My Competitions <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  // ── Form state ─────────────────────────────────────
  return (
    <div className="mg-page">
      <Container fluid className="mg-container">
        {/* Header */}
        <div className="mg-header">
          <Link to="/play" className="mg-back-link">
            <ChevronLeft size={14} /> Back to Play
          </Link>
          <h1 className="mg-title">
            <Sparkles size={20} style={{ marginRight: 10, verticalAlign: 'middle', color: '#C53030' }} />
            Create Competition
          </h1>
          <p className="mg-subtitle">
            Pick a game, set the rules, and invite friends.
          </p>
        </div>

        <div className="mg-layout">
          <div className="mg-form">
            {/* ── ① GAME ── */}
            <section className="mg-section">
              <div className="mg-section-head">
                <span className="mg-step-num">01</span>
                <h2 className="mg-section-title">Pick a Game</h2>
              </div>

              {loading.games && (
                <div className="mg-loading">
                  <Spinner animation="border" style={{ color: '#C53030' }} />
                  <span>Loading games...</span>
                </div>
              )}

              {errors.games && (
                <div className="mg-error-banner">
                  <AlertTriangle size={16} /> {errors.games}
                </div>
              )}

              {!loading.games && !errors.games && (
                <div className="mg-game-grid">
                  {games.filter(g => g.isActive !== false).map(game => {
                    const isPicked = selectedGame?.id === game.id
                    return (
                      <button
                        type="button"
                        key={game.id}
                        className={`mg-game-card ${isPicked ? 'picked' : ''}`}
                        onClick={() => handleSelectGame(game)}
                      >
                        {isPicked && (
                          <span className="mg-game-check"><Check size={12} /></span>
                        )}
                        <div className="mg-game-img">
                          {game.imageUrl ? (
                            <img
                              src={game.imageUrl}
                              alt={game.name}
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                          ) : (
                            <Gamepad2 size={28} color="#7A7A7A" />
                          )}
                        </div>
                        <div className="mg-game-name">{game.name}</div>
                        <div className="mg-game-meta">
                          {game.minPlayers}-{game.maxPlayers} players · {game.level || 'Mixed'}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {errorsField.gameId && (
                <p className="mg-field-error">{errorsField.gameId}</p>
              )}
            </section>

            {/* ── ② SETUP ── */}
            <section
              id="mg-setup"
              className={`mg-section ${!isSelected ? 'mg-section--disabled' : ''}`}
            >
              <div className="mg-section-head">
                <span className="mg-step-num">02</span>
                <h2 className="mg-section-title">Tournament Details</h2>
              </div>

              <fieldset disabled={!isSelected} className="mg-fieldset">
                {/* Title */}
                <div className="mg-field">
                  <label className="mg-label">Tournament Title</label>
                  <input
                    type="text"
                    className={`mg-input ${errorsField.title ? 'mg-input--err' : ''}`}
                    placeholder="e.g. Friday Night Showdown"
                    value={form.title}
                    onChange={e => updateField('title', e.target.value)}
                    maxLength={50}
                  />
                  {errorsField.title && <p className="mg-field-error">{errorsField.title}</p>}
                </div>

                {/* Privacy */}
                <div className="mg-field">
                  <label className="mg-label">Privacy</label>
                  <div className="mg-privacy-toggle">
                    <button
                      type="button"
                      className={`mg-privacy-pill ${form.privacy === 'PRIVATE' ? 'active' : ''}`}
                      onClick={() => updateField('privacy', 'PRIVATE')}
                    >
                      <Lock size={14} />
                      <div className="mg-privacy-text">
                        <span className="mg-privacy-name">Private</span>
                        <span className="mg-privacy-fee">15% fee</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`mg-privacy-pill ${form.privacy === 'PUBLIC' ? 'active' : ''}`}
                      onClick={() => updateField('privacy', 'PUBLIC')}
                    >
                      <Globe size={14} />
                      <div className="mg-privacy-text">
                        <span className="mg-privacy-name">Public</span>
                        <span className="mg-privacy-fee">20% fee</span>
                      </div>
                    </button>
                  </div>
                  <p className="mg-help">
                    <Info size={12} />
                    {form.privacy === 'PRIVATE'
                      ? 'Invite-only. Share the code with friends to let them join.'
                      : 'Listed publicly. Anyone can browse and join from the Play page.'}
                  </p>
                </div>

                {/* Players + Entry fee */}
                <div className="mg-grid-2">
                  <div className="mg-field">
                    <label className="mg-label">Max Players</label>
                    <div className="mg-stepper">
                      <button
                        type="button"
                        className="mg-stepper-btn"
                        onClick={() => adjustPlayers(-1)}
                        disabled={players <= minPlayers}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="mg-stepper-val">{players}</span>
                      <button
                        type="button"
                        className="mg-stepper-btn"
                        onClick={() => adjustPlayers(1)}
                        disabled={players >= maxPlayers}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="mg-help">Range: {minPlayers}–{maxPlayers}</p>
                    {errorsField.maxPlayers && <p className="mg-field-error">{errorsField.maxPlayers}</p>}
                  </div>

                  <div className="mg-field">
                    <label className="mg-label">Entry Fee</label>
                    <div className="mg-input-prefix">
                      <span className="mg-input-prefix-label">KES</span>
                      <input
                        type="number"
                        className={`mg-input ${errorsField.entryFee ? 'mg-input--err' : ''}`}
                        placeholder="0"
                        min={minFee}
                        step="1"
                        value={form.entryFee}
                        onChange={e => updateField('entryFee', e.target.value)}
                      />
                    </div>
                    <p className="mg-help">Min: {formatKES(minFee)} · Wallet: {formatKES(balance)}</p>
                    {errorsField.entryFee && <p className="mg-field-error">{errorsField.entryFee}</p>}
                  </div>
                </div>
              </fieldset>
            </section>

            {/* ── ③ WHEN ── */}
            <section className={`mg-section ${!isSelected ? 'mg-section--disabled' : ''}`}>
              <div className="mg-section-head">
                <span className="mg-step-num">03</span>
                <h2 className="mg-section-title">When</h2>
              </div>

              <fieldset disabled={!isSelected} className="mg-fieldset">
                <div className="mg-field">
                  <label className="mg-label">Quick start</label>
                  <div className="mg-presets">
                    {QUICK_STARTS.map(p => (
                      <button
                        type="button"
                        key={p.mins}
                        className={`mg-preset ${form.startMins === p.mins ? 'active' : ''}`}
                        onClick={() => updateField('startMins', p.mins)}
                      >
                        {p.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`mg-preset ${form.startMins === 'custom' ? 'active' : ''}`}
                      onClick={() => updateField('startMins', 'custom')}
                    >
                      Custom
                    </button>
                  </div>
                  {form.startMins === 'custom' && (
                    <input
                      type="datetime-local"
                      className={`mg-input mg-input--datetime ${errorsField.startsAt ? 'mg-input--err' : ''}`}
                      value={form.customStart}
                      onChange={e => updateField('customStart', e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  )}
                  {errorsField.startsAt && <p className="mg-field-error">{errorsField.startsAt}</p>}
                </div>

                <div className="mg-field">
                  <label className="mg-label">Duration</label>
                  <div className="mg-presets">
                    {DURATIONS.map(p => (
                      <button
                        type="button"
                        key={p.mins}
                        className={`mg-preset ${form.durationMins === p.mins ? 'active' : ''}`}
                        onClick={() => updateField('durationMins', p.mins)}
                      >
                        {p.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`mg-preset ${form.durationMins === 'custom' ? 'active' : ''}`}
                      onClick={() => updateField('durationMins', 'custom')}
                    >
                      Custom
                    </button>
                  </div>
                  {form.durationMins === 'custom' && (
                    <input
                      type="datetime-local"
                      className={`mg-input mg-input--datetime ${errorsField.endsAt ? 'mg-input--err' : ''}`}
                      value={form.customEnd}
                      onChange={e => updateField('customEnd', e.target.value)}
                      min={startIso}
                    />
                  )}
                  {errorsField.endsAt && <p className="mg-field-error">{errorsField.endsAt}</p>}
                </div>

                {/* Summary timestamps */}
                {startIso && endIso && (
                  <div className="mg-time-summary">
                    <div className="mg-time-row">
                      <Calendar size={13} color="#7A7A7A" />
                      <span className="mg-time-label">Starts</span>
                      <span className="mg-time-value">
                        {formatWhen(startIso)} <em>({formatRelative(new Date(startIso))})</em>
                      </span>
                    </div>
                    <div className="mg-time-row">
                      <Clock size={13} color="#7A7A7A" />
                      <span className="mg-time-label">Ends</span>
                      <span className="mg-time-value">
                        {formatWhen(endIso)} <em>({formatDuration(minutesBetween(startIso, endIso))})</em>
                      </span>
                    </div>
                  </div>
                )}
              </fieldset>
            </section>

            {/* ── Submit ── */}
            {submitError && (
              <div className="mg-error-banner mg-error-banner--big">
                <AlertTriangle size={16} /> {submitError}
              </div>
            )}

            <div className="mg-actions">
              <button
                type="button"
                className="mg-btn mg-btn-ghost"
                onClick={() => navigate('/play')}
              >
                <ChevronLeft size={15} /> Cancel
              </button>
              <button
                type="button"
                className="mg-btn mg-btn-primary"
                onClick={handleSubmit}
                disabled={!isSelected || submitting || balance < fee}
              >
                {submitting
                  ? (<><Spinner animation="border" size="sm" /> Creating...</>)
                  : (<>Create Competition <ChevronRight size={15} /></>)}
              </button>
            </div>
          </div>

          {/* ── Sticky preview sidebar ── */}
          <aside className="mg-aside">
            <div className="mg-preview-card">
              <div className="mg-preview-label">Live Preview</div>

              <div className="mg-preview-pills">
                <span className={`mg-preview-pill mg-preview-pill--${form.privacy.toLowerCase()}`}>
                  {form.privacy === 'PRIVATE' ? <Lock size={11} /> : <Globe size={11} />}
                  {form.privacy === 'PRIVATE' ? 'Private' : 'Public'}
                </span>
                {selectedGame && (
                  <span className="mg-preview-pill mg-preview-pill--game">
                    {selectedGame.name}
                  </span>
                )}
              </div>

              <h3 className="mg-preview-title">
                {form.title.trim() || 'Your tournament name'}
              </h3>

              <div className="mg-preview-stats">
                <div className="mg-preview-stat">
                  <Users size={14} color="#3182CE" />
                  <span>0/{players} players</span>
                </div>
                <div className="mg-preview-stat">
                  <Trophy size={14} color="#C53030" />
                  <span>{formatKES(prize)} prize</span>
                </div>
                <div className="mg-preview-stat">
                  <Wallet size={14} color="#DD6B20" />
                  <span>{formatKES(fee)} entry</span>
                </div>
                {startIso && (
                  <div className="mg-preview-stat">
                    <Clock size={14} color="#38A169" />
                    <span>Starts {formatRelative(new Date(startIso))}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mg-breakdown">
              <div className="mg-breakdown-head">Prize Breakdown</div>
              <div className="mg-breakdown-row">
                <span>Pool ({players} × {formatKES(fee)})</span>
                <strong>{formatKES(pool)}</strong>
              </div>
              <div className="mg-breakdown-row">
                <span>Platform fee ({platformPct}%)</span>
                <strong style={{ color: '#E08888' }}>−{formatKES(platformFee)}</strong>
              </div>
              <div className="mg-breakdown-row mg-breakdown-row--total">
                <span>Prize pool</span>
                <strong style={{ color: '#5BC58A' }}>{formatKES(prize)}</strong>
              </div>
            </div>

            <div className="mg-breakdown">
              <div className="mg-breakdown-head">Your Wallet</div>
              <div className="mg-breakdown-row">
                <span>Balance</span>
                <strong>{formatKES(balance)}</strong>
              </div>
              <div className="mg-breakdown-row">
                <span>Pay to enter</span>
                <strong style={{ color: '#E08888' }}>−{formatKES(fee)}</strong>
              </div>
              <div className={`mg-breakdown-row mg-breakdown-row--total ${walletAfter < 0 ? 'mg-breakdown-row--err' : ''}`}>
                <span>Balance after</span>
                <strong style={{ color: walletAfter < 0 ? '#E08888' : '#F5F5F5' }}>
                  {formatKES(walletAfter)}
                </strong>
              </div>
              {walletAfter < 0 && (
                <Link to="/deposit" className="mg-deposit-link">
                  <AlertTriangle size={12} /> Top up wallet
                </Link>
              )}
            </div>
          </aside>
        </div>
      </Container>
    </div>
  )
}

export default MakeGame

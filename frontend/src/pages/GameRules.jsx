import React, { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import {
  Shield, Wallet, KeyRound, Sparkles, Trophy, Gamepad2, Scale,
  ShieldAlert, MessageCircle, AlertTriangle, ChevronLeft, ChevronRight,
} from 'lucide-react'
import '../styles/PlayPage.css'
import '../styles/GameRules.css'

const SECTIONS = [
  {
    id: 'getting-started',
    Icon: Sparkles,
    title: 'Getting Started',
    intro: 'How GameArena works and what you need to play.',
    rules: [
      {
        h: 'Create your account',
        p: 'Sign up free with your email and username. No deposit needed to register or to use Training mode.',
      },
      {
        h: 'Training is always free',
        p: 'The Practice Arena (/train) lets you play every game with no entry fee, no prize, and no risk. Use it to learn games before competing.',
      },
      {
        h: 'Real competitions need a wallet',
        p: 'Joining or creating real-money competitions requires you to deposit KES into your GameArena wallet via M-Pesa.',
      },
      {
        h: 'You must be 18+',
        p: 'Players must be at least 18 years old (or the legal gambling age in their jurisdiction) to participate in paid competitions.',
      },
    ],
  },
  {
    id: 'wallet',
    Icon: Wallet,
    title: 'Wallet, Deposits & Withdrawals',
    intro: 'How money moves into and out of your GameArena account.',
    rules: [
      {
        h: 'Deposits via M-Pesa STK Push',
        p: 'Deposits use an M-Pesa STK push to your phone. Enter the amount and your number, approve the prompt with your M-Pesa PIN, and funds appear in your wallet usually within seconds.',
      },
      {
        h: 'Deposit limits',
        p: 'Minimum deposit is KES 1. Maximum deposit is KES 150,000 per transaction. Both limits are set by GameArena and may change.',
      },
      {
        h: 'Withdrawals via Pochi La Biashara',
        p: 'Withdrawals are sent to your M-Pesa number via the Pochi La Biashara service. Your number must have Pochi activated to receive payouts — see the Wallet page for activation steps.',
      },
      {
        h: 'Withdrawal minimum & processing',
        p: 'Minimum withdrawal is KES 100. Processing time is 1–24 hours via M-Pesa B2C. You can submit multiple withdrawal requests but each is processed separately.',
      },
      {
        h: 'Fees',
        p: 'GameArena does not charge a fee for deposits or withdrawals. Standard M-Pesa transaction charges apply as per Safaricom\'s rates.',
      },
    ],
  },
  {
    id: 'joining',
    Icon: KeyRound,
    title: 'Joining Competitions',
    intro: 'Two ways to find competitions: browse public ones, or use a code.',
    rules: [
      {
        h: 'Browse public competitions',
        p: 'The Play page lists all public competitions that are Live Now or Upcoming. Anyone can join provided they have enough wallet balance for the entry fee.',
      },
      {
        h: 'Join by code',
        p: 'Private competitions require an invite code. Get a code from the creator, click "Join by Code" on the Play page, and enter it.',
      },
      {
        h: 'Accepting an invite',
        p: 'If a friend invites you directly by username, the invite appears under the Mail icon on the Play page. Accept to join; decline to pass.',
      },
      {
        h: 'Entry fee is taken upfront',
        p: 'The entry fee is deducted from your wallet the moment you confirm joining a competition. If your balance is short, you must top up first.',
      },
      {
        h: 'You can leave before the game starts',
        p: 'You may leave a competition you joined and get a full refund as long as nobody (including you) has played a game yet. Once anyone has started playing, you can no longer leave.',
      },
    ],
  },
  {
    id: 'creating',
    Icon: Trophy,
    title: 'Creating Competitions',
    intro: 'Set the rules and the prize pool. Invite friends or open it to the public.',
    rules: [
      {
        h: 'Pick a game and set the details',
        p: 'On the Create page, pick a game, set a title, choose Private or Public, set max players (within the game\'s range), set the entry fee (≥ the game\'s minimum), and pick a start time + duration.',
      },
      {
        h: 'Platform fees: 15% private, 20% public',
        p: 'GameArena retains a platform fee from the total prize pool — 15% for Private competitions (invite-only by code), and 20% for Public competitions (listed on the Play page).',
      },
      {
        h: 'Prize pool math',
        p: 'Prize pool = (entry fee × players who join) × (1 − platform fee). Example: 4 players × KES 100 entry fee in a Private competition = KES 400 collected × 0.85 = KES 340 prize.',
      },
      {
        h: 'Custom start and duration',
        p: 'Pick a start time (now, in 5 min, in 30 min, etc., or any custom date/time) and a duration (30 min, 1 hr, 2 hr, 4 hr, or custom). Minimum duration is 15 minutes.',
      },
      {
        h: 'Your entry fee is taken at creation',
        p: 'The creator is automatically the first player and pays the entry fee on creation. The competition code is generated immediately — share it with friends to invite them.',
      },
    ],
  },
  {
    id: 'playing',
    Icon: Gamepad2,
    title: 'Playing & Scoring',
    intro: 'How a competition plays out and how the winner is decided.',
    rules: [
      {
        h: 'Highest score wins',
        p: 'Whoever has the highest score at the end of the competition window wins the prize pool. Scores are submitted automatically when you finish your game.',
      },
      {
        h: 'One play per player',
        p: 'Each player gets one attempt per competition. Make it count — you cannot retry to improve your score.',
      },
      {
        h: 'Tied scores split the prize',
        p: 'If two or more players tie at the top, the prize pool is split equally among the tied players.',
      },
      {
        h: 'Non-participants forfeit their entry',
        p: 'If you join a competition but never actually play before it ends, you score zero. Your entry fee is added to the prize pool for the players who did play.',
      },
      {
        h: 'Game starts must be on time',
        p: 'You can play any time between the start time and the end time. Once the competition ends, no more plays are accepted — even if you joined and paid.',
      },
    ],
  },
  {
    id: 'prizes',
    Icon: Trophy,
    title: 'Prizes & Payouts',
    intro: 'When and how your winnings reach your wallet.',
    rules: [
      {
        h: 'Winners credited instantly',
        p: 'When a competition ends, the prize pool is automatically credited to the winner\'s wallet within seconds of the final score being recorded.',
      },
      {
        h: 'Withdraw to M-Pesa anytime',
        p: 'Your winnings are real KES in your wallet. Withdraw to your M-Pesa number from the Wallet page — processed within 1–24 hours via Pochi La Biashara.',
      },
      {
        h: 'Verification may delay payouts',
        p: 'Suspicious activity or unusually large wins may trigger a verification hold. We\'ll contact you if so. Standard payouts go through without delay.',
      },
    ],
  },
  {
    id: 'refunds',
    Icon: Scale,
    title: 'Refunds & Cancellations',
    intro: 'What happens when a competition doesn\'t go as planned.',
    rules: [
      {
        h: 'No other players joined',
        p: 'If a competition ends with only the creator and nobody else joined, the full entry fee is refunded to the creator\'s wallet and the competition is closed.',
      },
      {
        h: 'Joined but nobody played',
        p: 'If players joined but none of them (including the creator) actually played, the platform commission is deducted and the remaining 85–80% is refunded proportionally to all participants.',
      },
      {
        h: 'Leaving before play',
        p: 'You may leave a competition and receive a full refund of your entry fee, provided no player (including yourself) has started a game yet.',
      },
      {
        h: 'Technical failures',
        p: 'If GameArena experiences a technical failure that affects competition integrity, we will cancel the affected competition and refund all participants in full.',
      },
    ],
  },
  {
    id: 'fair-play',
    Icon: ShieldAlert,
    title: 'Fair Play & Compliance',
    intro: 'Rules that keep the platform safe for everyone.',
    rules: [
      {
        h: 'No cheating, hacking, or exploits',
        p: 'Modifying game code, automating gameplay, exploiting bugs to gain unfair scores, or using third-party tools is strictly prohibited. Violators are permanently banned and forfeit all funds.',
      },
      {
        h: 'One account per person',
        p: 'You may only operate one GameArena account. Creating additional accounts to evade bans, collude in competitions, or claim multiple bonuses is prohibited.',
      },
      {
        h: 'Responsible gaming',
        p: 'Only deposit what you can afford to lose. If you feel your gaming is becoming a problem, contact support to set spending limits or request self-exclusion.',
      },
      {
        h: 'Jurisdictional compliance',
        p: 'You are responsible for confirming that participation in real-money gaming is legal in your country. GameArena does not operate in jurisdictions where this is prohibited.',
      },
      {
        h: 'Account security',
        p: 'Keep your password and M-Pesa PIN private. Any action taken from your logged-in account is your responsibility. Report suspicious activity to support immediately.',
      },
    ],
  },
  {
    id: 'disputes',
    Icon: MessageCircle,
    title: 'Disputes & Support',
    intro: 'When something goes wrong, here\'s how we resolve it.',
    rules: [
      {
        h: 'File within 24 hours',
        p: 'Disputes must be filed within 24 hours of competition completion via support. Late disputes may not be considered.',
      },
      {
        h: 'Provide evidence',
        p: 'Include screenshots, timestamps, and a clear description of the issue. False or malicious disputes can result in account penalties.',
      },
      {
        h: '3–5 business days to investigate',
        p: 'Our moderation team reviews disputes thoroughly. Most are resolved within 3–5 business days. Decisions are final.',
      },
      {
        h: 'Privacy and data',
        p: 'Your personal data is protected. We never share it with third parties without your consent. M-Pesa transaction data is handled per Safaricom\'s privacy policies.',
      },
      {
        h: 'Rule updates',
        p: 'These rules may be updated. Material changes are announced on the platform. Continued use after a change means you accept the new terms.',
      },
    ],
  },
]

const GameRules = () => {
  const [activeId, setActiveId] = useState(SECTIONS[0].id)

  useEffect(() => {
    const ids = SECTIONS.map(s => s.id)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-15% 0px -65% 0px', threshold: 0 }
    )
    ids.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const jumpTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div className="pp-page">
      <Container fluid className="pp-container">
        {/* Header */}
        <div className="pp-header">
          <div className="pp-header-top">
            <div className="pp-header-titleblock">
              <Link to="/" className="pp-back-link">
                <ChevronLeft size={14} /> Back to Home
              </Link>
              <h1 className="pp-title">
                <Shield size={20} style={{ marginRight: 10, verticalAlign: 'middle', color: '#C53030' }} />
                Game Rules
              </h1>
              <p className="pp-subtitle">
                Read these before you compete. By joining or creating a competition, you agree to abide by them.
              </p>
            </div>
          </div>

          <div className="gr-notice">
            <AlertTriangle size={16} color="#F6AD55" />
            <div>
              <strong>Real money disclosure.</strong> Entry fees are taken from your wallet upfront and are
              non-refundable once any player has started a game in the competition. Make sure you
              understand the rules before joining or creating.
            </div>
          </div>
        </div>

        <div className="pp-layout gr-layout">
          {/* Sidebar TOC */}
          <aside className="gr-toc">
            <div className="gr-toc-head">On this page</div>
            <nav className="gr-toc-list">
              {SECTIONS.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className={`gr-toc-item ${activeId === s.id ? 'active' : ''}`}
                  onClick={() => jumpTo(s.id)}
                >
                  <span className="gr-toc-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="gr-toc-text">{s.title}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Sections */}
          <div className="pp-main">
            {SECTIONS.map((s, i) => (
              <section key={s.id} id={s.id} className="gr-section">
                <div className="gr-section-head">
                  <div className="gr-section-num">{String(i + 1).padStart(2, '0')}</div>
                  <div className="gr-section-icon">
                    <s.Icon size={18} />
                  </div>
                  <div className="gr-section-titles">
                    <h2 className="gr-section-title">{s.title}</h2>
                    <p className="gr-section-intro">{s.intro}</p>
                  </div>
                </div>

                <div className="gr-rules">
                  {s.rules.map((r, j) => (
                    <div key={j} className="gr-rule">
                      <h4 className="gr-rule-h">{r.h}</h4>
                      <p className="gr-rule-p">{r.p}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Footer */}
            <div className="gr-foot">
              <div className="gr-foot-icon">
                <MessageCircle size={20} color="#C53030" />
              </div>
              <h3>Need help?</h3>
              <p>
                If anything in these rules is unclear, contact support before you join or create
                a competition. Our team is happy to walk you through it.
              </p>
              <div className="gr-foot-actions">
                <Link to="/play" className="pp-btn pp-btn-primary">
                  Browse Competitions <ChevronRight size={14} />
                </Link>
                <Link to="/" className="pp-btn pp-btn-ghost">
                  Back to Home
                </Link>
              </div>
              <p className="gr-foot-stamp">
                Last updated: May 2026 · Version 2.0
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default GameRules

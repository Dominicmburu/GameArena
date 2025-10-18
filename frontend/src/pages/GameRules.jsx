import React from 'react'
import { Shield, DollarSign, Clock, Users, AlertTriangle, CheckCircle, Award, Info } from 'lucide-react'

const GameRules = () => {
  const rulesSections = [
    {
      icon: DollarSign,
      color: '#00FF85',
      title: 'Payment & Entry Fees',
      rules: [
        {
          subtitle: 'Competition Creation',
          text: 'When creating a competition, the entry fee amount is immediately deducted from your wallet balance. For example, if you set an entry fee of $100, your wallet will be reduced by $100 upon competition creation.'
        },
        {
          subtitle: 'Upfront Payment Policy',
          text: 'All payments are processed upfront. When accepting an invite to play or joining a game by code, the entry fee is deducted from your wallet immediately before participation is confirmed.'
        },
        {
          subtitle: 'No Refund After Gameplay',
          text: 'Once a player has started participating in the competition, entry fees become non-refundable except under the specific refund conditions outlined in these rules.'
        }
      ]
    },
    {
      icon: Clock,
      color: '#00F0FF',
      title: 'Competition Duration & Expiration',
      rules: [
        {
          subtitle: 'One Hour Time Limit',
          text: 'All competitions automatically expire one (1) hour after creation. Players must join and complete their gameplay within this timeframe.'
        },
        {
          subtitle: 'Expired Competition - No Players',
          text: 'If a competition expires with only the creator and no other players have joined, the competition is automatically deleted and the full entry fee is returned to the creator\'s wallet.'
        },
        {
          subtitle: 'Expired Competition - With Players',
          text: 'If a competition expires and players have joined but none have participated/played, a 15% platform commission is deducted and the remaining 85% is returned proportionally to all participants\' wallets.'
        }
      ]
    },
    {
      icon: Users,
      color: '#9B00FF',
      title: 'Player Participation & Scoring',
      rules: [
        {
          subtitle: 'Non-Participation Penalty',
          text: 'If a competition is created and some players do not participate or play, those players receive a score of zero (0) and forfeit their entry fee. The prize pool is awarded to participating players based on their scores.'
        },
        {
          subtitle: 'Highest Score Winner',
          text: 'The player with the highest score at the end of the competition period is declared the winner and receives the full prize pool minus platform fees.'
        },
        {
          subtitle: 'Tied Scores',
          text: 'If two or more players achieve the same highest score, the prize pool is divided equally among all tied winners. Each tied winner receives their proportional share of the total prize.'
        },
        {
          subtitle: 'All Players Leave Before Start',
          text: 'If all players leave the competition before any player has started playing the game, the competition is cancelled and full refunds are issued to all participants, minus a processing fee.'
        }
      ]
    },
    {
      icon: Award,
      color: '#FFD700',
      title: 'Prize Distribution',
      rules: [
        {
          subtitle: 'Prize Pool Calculation',
          text: 'The total prize pool consists of 85% of all collected entry fees. A 15% platform commission is retained for operational costs, security, and platform maintenance.'
        },
        {
          subtitle: 'Winner Payout',
          text: 'Prize money is credited to the winner\'s wallet immediately upon competition completion and score verification. Winners can withdraw their earnings subject to platform withdrawal policies.'
        },
        {
          subtitle: 'Payout Verification',
          text: 'All payouts are subject to verification to prevent fraud and ensure compliance with gaming regulations. In cases of suspicious activity, payouts may be temporarily held pending investigation.'
        }
      ]
    },
    {
      icon: Shield,
      color: '#FF003C',
      title: 'Fair Play & Compliance',
      rules: [
        {
          subtitle: 'Anti-Cheating Policy',
          text: 'Any form of cheating, hacking, or exploiting game mechanics is strictly prohibited. Players found violating this policy will be permanently banned and forfeit all entry fees and prizes.'
        },
        {
          subtitle: 'Age Restriction',
          text: 'Players must be 18 years of age or older (or the legal gambling age in their jurisdiction) to participate in paid competitions. Age verification may be required before withdrawal of winnings.'
        },
        {
          subtitle: 'Responsible Gaming',
          text: 'We promote responsible gaming. Players should only wager amounts they can afford to lose. Self-exclusion tools and spending limits are available upon request through platform settings.'
        },
        {
          subtitle: 'Jurisdictional Compliance',
          text: 'Players are responsible for ensuring that their participation complies with local, state, and federal laws. The platform is not available in jurisdictions where online gaming for money is prohibited.'
        },
        {
          subtitle: 'Account Security',
          text: 'Users are responsible for maintaining the security of their accounts. Any activity from your account is considered your responsibility. Report suspicious activity immediately to platform support.'
        }
      ]
    },
    {
      icon: AlertTriangle,
      color: '#FFA500',
      title: 'Dispute Resolution',
      rules: [
        {
          subtitle: 'Dispute Filing',
          text: 'Disputes must be filed within 24 hours of competition completion through the official support channels. Late disputes may not be considered.'
        },
        {
          subtitle: 'Investigation Process',
          text: 'All disputes are investigated thoroughly by our moderation team. Investigations typically conclude within 3-5 business days. Decisions made by the moderation team are final.'
        },
        {
          subtitle: 'Evidence Requirements',
          text: 'Players filing disputes must provide relevant evidence including screenshots, timestamps, and detailed descriptions. False or malicious disputes may result in account penalties.'
        }
      ]
    },
    {
      icon: Info,
      color: '#00F0FF',
      title: 'General Terms & Conditions',
      rules: [
        {
          subtitle: 'Platform Rights',
          text: 'The platform reserves the right to cancel, modify, or refuse any competition that violates terms of service or raises security concerns. Affected users will be notified and refunded appropriately.'
        },
        {
          subtitle: 'Rule Changes',
          text: 'These rules may be updated periodically. Users will be notified of significant changes via email and platform notifications. Continued use of the platform constitutes acceptance of updated rules.'
        },
        {
          subtitle: 'Technical Issues',
          text: 'In the event of technical difficulties or server outages that affect competition integrity, the platform may cancel affected competitions and issue full refunds to all participants.'
        },
        {
          subtitle: 'Data Privacy',
          text: 'All player data, gameplay statistics, and financial transactions are protected under our privacy policy and applicable data protection regulations. Data is never shared with third parties without explicit consent.'
        },
        {
          subtitle: 'Tax Obligations',
          text: 'Winners are responsible for reporting and paying any applicable taxes on their winnings according to their local tax laws. The platform may provide tax documentation upon request where required by law.'
        }
      ]
    }
  ]

  return (
    <div className="game-rules-page" style={{ minHeight: '100vh', paddingBottom: '60px' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div className="page-header cyber-card" style={{ padding: '40px', textAlign: 'center', marginBottom: '40px' }}>
          <Shield size={48} color="#00FF85" style={{ marginBottom: '20px' }} />
          <h1 className="cyber-text text-neon" style={{ marginBottom: '20px' }}>
            Game Rules & Regulations
          </h1>
          <p className="text-white" style={{ maxWidth: '800px', margin: '0 auto' }}>
            Please read and understand all rules before participating in any competition. 
            By creating or joining a competition, you agree to abide by these regulations.
          </p>
        </div>

        {/* Important Notice */}
        <div className="alert-box" style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <AlertTriangle size={24} className="text-cyber-red" style={{ marginRight: '15px', marginTop: '5px', flexShrink: 0 }} />
            <div>
              <h5 className="text-cyber-red" style={{ marginBottom: '10px' }}>Important Notice</h5>
              <p className="text-white" style={{ margin: 0 }}>
                All entry fees are deducted upfront and are non-refundable once gameplay has started. 
                Please ensure you understand all rules and have sufficient funds before participating.
              </p>
            </div>
          </div>
        </div>

        {/* Rules Sections */}
        {rulesSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="cyber-card" style={{ marginBottom: '30px' }}>
            <div style={{ padding: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px' }}>
                <div 
                  className="icon-wrapper" 
                  style={{ 
                    background: `${section.color}20`,
                    padding: '12px',
                    borderRadius: '8px',
                    border: `2px solid ${section.color}`,
                    marginRight: '15px'
                  }}
                >
                  <section.icon size={28} color={section.color} />
                </div>
                <h3 style={{ color: section.color, margin: 0 }}>
                  {section.title}
                </h3>
              </div>

              <div className="rules-content">
                {section.rules.map((rule, ruleIndex) => (
                  <div 
                    key={ruleIndex} 
                    className="rule-item"
                    style={{ 
                      marginBottom: '25px',
                      paddingBottom: '20px',
                      borderBottom: ruleIndex < section.rules.length - 1 
                        ? '1px solid rgba(255, 255, 255, 0.1)' 
                        : 'none' 
                    }}
                  >
                    <h5 className="text-white" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                      <CheckCircle size={18} color={section.color} style={{ marginRight: '10px' }} />
                      {rule.subtitle}
                    </h5>
                    <p className="text-white" style={{ margin: 0, marginLeft: '28px', lineHeight: '1.6' }}>
                      {rule.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Footer Notice */}
        <div className="cyber-card" style={{ padding: '30px', textAlign: 'center' }}>
          <Info size={32} color="#00F0FF" style={{ marginBottom: '15px' }} />
          <h5 className="text-neon" style={{ marginBottom: '15px' }}>Questions or Concerns?</h5>
          <p className="text-white" style={{ marginBottom: '15px' }}>
            If you have any questions about these rules or need clarification, 
            please contact our support team before participating in any competition.
          </p>
          <p className="text-white-50" style={{ fontSize: '0.875rem', margin: 0 }}>
            Last Updated: October 2025 | Version 1.0
          </p>
        </div>
      </div>

      <style jsx>{`
        .game-rules-page {
          background: linear-gradient(135deg, #0E0E10 0%, #1a1a2e 50%, #16213e 100%);
          background-attachment: fixed;
        }

        .cyber-card {
          background: rgba(31, 31, 35, 0.7);
          border: 1px solid rgba(0, 240, 255, 0.2);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .cyber-card:hover {
          border-color: rgba(0, 240, 255, 0.4);
          box-shadow: 0 8px 32px rgba(0, 240, 255, 0.15);
        }

        .cyber-text {
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .text-neon {
          color: #00FF85;
        }

        .text-cyber-red {
          color: #FF003C;
        }

        .text-white {
          color: #ffffff;
        }

        .text-white-50 {
          color: rgba(255, 255, 255, 0.5);
        }

        .alert-box {
          padding: 25px;
          background: rgba(255, 0, 60, 0.15);
          border: 2px solid rgba(255, 0, 60, 0.4);
          border-radius: 8px;
          animation: pulseGlow 2s ease-in-out infinite;
        }

        .rule-item {
          transition: all 0.2s ease;
        }

        .rule-item:hover {
          transform: translateX(5px);
        }

        .icon-wrapper {
          transition: all 0.3s ease;
          }

        .cyber-card:hover .icon-wrapper {
          transform: scale(1.05);
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(255, 0, 60, 0.2);
          }
          50% {
            box-shadow: 0 0 20px rgba(255, 0, 60, 0.4);
          }
        }

        @media (max-width: 768px) {
          .page-header h1 {
            font-size: 1.75rem;
          }
          
          .cyber-card {
            margin-bottom: 1rem;
          }

          .container {
            padding: 20px 15px !important;
          }
        }
      `}</style>
    </div>
  )
}

export default GameRules
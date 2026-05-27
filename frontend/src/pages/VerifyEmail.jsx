import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { Mail, Shield, RefreshCw, CheckCircle2 } from 'lucide-react'
import '../styles/auth.css'

const CODE_LENGTH = 6
const RESEND_COOLDOWN_SECONDS = 60

const VerifyEmail = () => {
    const { verifyEmail, resendVerification } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const params = new URLSearchParams(location.search)
    const queryEmail = params.get('email') || ''

    const [email, setEmail] = useState(queryEmail)
    const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''))
    const [isLoading, setIsLoading] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [error, setError] = useState('')
    const [info, setInfo] = useState('')
    const [cooldown, setCooldown] = useState(0)
    const inputsRef = useRef([])

    useEffect(() => {
        if (cooldown <= 0) return
        const t = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000)
        return () => clearInterval(t)
    }, [cooldown])

    useEffect(() => {
        inputsRef.current[0]?.focus()
    }, [])

    const handleDigitChange = (index, value) => {
        const cleaned = value.replace(/\D/g, '')
        if (!cleaned) {
            const next = [...digits]
            next[index] = ''
            setDigits(next)
            return
        }
        const next = [...digits]
        next[index] = cleaned[0]
        setDigits(next)
        if (index < CODE_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus()
        }
        setError('')
    }

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputsRef.current[index - 1]?.focus()
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            inputsRef.current[index - 1]?.focus()
        }
        if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus()
        }
    }

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
        if (!pasted) return
        e.preventDefault()
        const next = Array(CODE_LENGTH).fill('')
        for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
        setDigits(next)
        const focusTo = Math.min(pasted.length, CODE_LENGTH - 1)
        inputsRef.current[focusTo]?.focus()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const code = digits.join('')

        if (!email) {
            setError('Email is required')
            return
        }
        if (code.length !== CODE_LENGTH) {
            setError(`Enter the ${CODE_LENGTH}-digit code from your email`)
            return
        }

        setIsLoading(true)
        setError('')
        setInfo('')

        try {
            await verifyEmail({ email, code })
            navigate('/')
        } catch (err) {
            setError(err.message || 'Verification failed')
            if (err.code === 'EXPIRED' || err.code === 'TOO_MANY_ATTEMPTS' || err.code === 'NO_CODE') {
                setDigits(Array(CODE_LENGTH).fill(''))
                inputsRef.current[0]?.focus()
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleResend = async () => {
        if (!email) {
            setError('Enter your email first')
            return
        }
        if (cooldown > 0) return

        setIsResending(true)
        setError('')
        setInfo('')

        try {
            await resendVerification(email)
            setInfo('A new code has been sent. Check your inbox.')
            setCooldown(RESEND_COOLDOWN_SECONDS)
        } catch (err) {
            if (err.code === 'RATE_LIMITED' && err.data?.retryAfter) {
                setCooldown(err.data.retryAfter)
                setError(err.message)
            } else {
                setError(err.message || 'Failed to resend code')
            }
        } finally {
            setIsResending(false)
        }
    }

    return (
        <div className="min-vh-100 d-flex align-items-center">
            <Container>
                <Row className="justify-content-center">
                    <Col lg={5} md={7} sm={9}>
                        <Card
                            className="border-0 shadow-lg"
                            style={{
                                background: 'rgba(31, 31, 35, 0.95)',
                                border: '1px solid rgba(49, 130, 206, 0.3)',
                                borderRadius: '20px',
                                backdropFilter: 'blur(20px)',
                                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <Card.Body className="p-4 p-md-5 position-relative">
                                <div className="text-center mb-4">
                                    <div className="d-inline-flex p-3 rounded-circle mb-3"
                                        style={{
                                            background: 'rgba(49, 130, 206, 0.15)',
                                            border: '1px solid rgba(49, 130, 206, 0.4)'
                                        }}>
                                        <Mail size={28} color="#3182CE" />
                                    </div>
                                    <h3 className="text-white fw-bold mb-1">Verify your email</h3>
                                    <p className="text-grey small mb-0">
                                        We sent a 6-digit code to{' '}
                                        <span className="text-white fw-medium">{email || 'your email'}</span>
                                    </p>
                                </div>

                                <Form onSubmit={handleSubmit}>
                                    {error && (
                                        <Alert
                                            className="border-0 mb-3"
                                            style={{
                                                background: 'rgba(197, 48, 48, 0.1)',
                                                border: '1px solid rgba(197, 48, 48, 0.3)',
                                                color: '#C53030',
                                                borderRadius: '12px'
                                            }}
                                        >
                                            <div className="d-flex align-items-center">
                                                <Shield size={16} className="me-2" />
                                                {error}
                                            </div>
                                        </Alert>
                                    )}

                                    {info && (
                                        <Alert
                                            className="border-0 mb-3"
                                            style={{
                                                background: 'rgba(56, 161, 105, 0.1)',
                                                border: '1px solid rgba(56, 161, 105, 0.3)',
                                                color: '#48BB78',
                                                borderRadius: '12px'
                                            }}
                                        >
                                            <div className="d-flex align-items-center">
                                                <CheckCircle2 size={16} className="me-2" />
                                                {info}
                                            </div>
                                        </Alert>
                                    )}

                                    {!queryEmail && (
                                        <Form.Group className="mb-3">
                                            <Form.Label className="text-white fw-medium mb-2">
                                                <Mail size={16} className="me-2" />
                                                Email Address
                                            </Form.Label>
                                            <Form.Control
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter your email"
                                                disabled={isLoading}
                                                className="py-3"
                                                style={{
                                                    background: 'rgba(20, 20, 25, 0.8)',
                                                    border: '1px solid rgba(49, 130, 206, 0.3)',
                                                    borderRadius: '12px',
                                                    color: 'white',
                                                    fontSize: '1rem'
                                                }}
                                            />
                                        </Form.Group>
                                    )}

                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-white fw-medium mb-2">
                                            Verification Code
                                        </Form.Label>
                                        <div className="d-flex justify-content-between gap-2" onPaste={handlePaste}>
                                            {digits.map((d, i) => (
                                                <Form.Control
                                                    key={i}
                                                    ref={el => (inputsRef.current[i] = el)}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={d}
                                                    onChange={(e) => handleDigitChange(i, e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                                    disabled={isLoading}
                                                    className="text-center fw-bold"
                                                    style={{
                                                        background: 'rgba(20, 20, 25, 0.8)',
                                                        border: '1px solid rgba(49, 130, 206, 0.3)',
                                                        borderRadius: '12px',
                                                        color: 'white',
                                                        fontSize: '1.5rem',
                                                        height: '56px',
                                                        width: '100%',
                                                        padding: '0'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </Form.Group>

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-100 py-3 fw-bold text-uppercase mb-3"
                                        style={{
                                            background: 'linear-gradient(45deg, #3182CE, #805AD5)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            color: '#0E0E10',
                                            fontSize: '1rem',
                                            boxShadow: '0 5px 15px rgba(49, 130, 206, 0.3)'
                                        }}
                                    >
                                        {isLoading ? (
                                            <div className="d-flex align-items-center justify-content-center">
                                                <Spinner animation="border" size="sm" className="me-2"
                                                    style={{ width: '18px', height: '18px' }} />
                                                Verifying...
                                            </div>
                                        ) : (
                                            <div className="d-flex align-items-center justify-content-center">
                                                <CheckCircle2 size={18} className="me-2" />
                                                Verify & Continue
                                            </div>
                                        )}
                                    </Button>

                                    <div className="text-center">
                                        <span className="text-white me-2">Didn't get the code?</span>
                                        <Button
                                            variant="link"
                                            onClick={handleResend}
                                            disabled={isResending || cooldown > 0 || !email}
                                            className="p-0 fw-bold"
                                            style={{
                                                color: cooldown > 0 ? '#6c757d' : '#3182CE',
                                                textDecoration: 'none',
                                                border: 'none'
                                            }}
                                        >
                                            {isResending ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-1"
                                                        style={{ width: '14px', height: '14px' }} />
                                                    Sending...
                                                </>
                                            ) : cooldown > 0 ? (
                                                `Resend in ${cooldown}s`
                                            ) : (
                                                <>
                                                    <RefreshCw size={14} className="me-1" />
                                                    Resend code
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    <div className="text-center mt-3">
                                        <Link
                                            to="/auth"
                                            className="text-grey small"
                                            style={{ textDecoration: 'none' }}
                                        >
                                            Back to sign in
                                        </Link>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default VerifyEmail

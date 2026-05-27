import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { Mail, Shield, CheckCircle2, ArrowLeft } from 'lucide-react'
import authService from '../services/authService'
import '../styles/auth.css'

const RESEND_COOLDOWN_SECONDS = 60

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [sent, setSent] = useState(false)
    const [cooldown, setCooldown] = useState(0)

    useEffect(() => {
        if (cooldown <= 0) return
        const t = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000)
        return () => clearInterval(t)
    }, [cooldown])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email) {
            setError('Email is required')
            return
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email')
            return
        }
        if (cooldown > 0) return

        setIsLoading(true)
        setError('')

        try {
            await authService.forgotPassword(email)
            setSent(true)
            setCooldown(RESEND_COOLDOWN_SECONDS)
        } catch (err) {
            if (err.code === 'RATE_LIMITED' && err.data?.retryAfter) {
                setCooldown(err.data.retryAfter)
                setError(err.message)
            } else {
                setError(err.message || 'Failed to send reset link')
            }
        } finally {
            setIsLoading(false)
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
                                    <h3 className="text-white fw-bold mb-1">Forgot password?</h3>
                                    <p className="text-grey small mb-0">
                                        Enter your email and we'll send you a reset link
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

                                    {sent && (
                                        <Alert
                                            className="border-0 mb-3"
                                            style={{
                                                background: 'rgba(56, 161, 105, 0.1)',
                                                border: '1px solid rgba(56, 161, 105, 0.3)',
                                                color: '#48BB78',
                                                borderRadius: '12px'
                                            }}
                                        >
                                            <div className="d-flex align-items-start">
                                                <CheckCircle2 size={16} className="me-2 mt-1 flex-shrink-0" />
                                                <div className="small">
                                                    If an account exists for <span className="fw-bold">{email}</span>,
                                                    a password reset link has been sent. Check your inbox
                                                    (and spam folder). The link expires in 1 hour.
                                                </div>
                                            </div>
                                        </Alert>
                                    )}

                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-white fw-medium mb-2">
                                            <Mail size={16} className="me-2" />
                                            Email Address
                                        </Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setError('') }}
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

                                    <Button
                                        type="submit"
                                        disabled={isLoading || cooldown > 0}
                                        className="w-100 py-3 fw-bold text-uppercase mb-3"
                                        style={{
                                            background: cooldown > 0
                                                ? 'rgba(108, 117, 125, 0.5)'
                                                : 'linear-gradient(45deg, #3182CE, #805AD5)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            color: '#0E0E10',
                                            fontSize: '1rem',
                                            boxShadow: cooldown > 0 ? 'none' : '0 5px 15px rgba(49, 130, 206, 0.3)'
                                        }}
                                    >
                                        {isLoading ? (
                                            <div className="d-flex align-items-center justify-content-center">
                                                <Spinner animation="border" size="sm" className="me-2"
                                                    style={{ width: '18px', height: '18px' }} />
                                                Sending...
                                            </div>
                                        ) : cooldown > 0 ? (
                                            `Resend in ${cooldown}s`
                                        ) : sent ? (
                                            'Resend link'
                                        ) : (
                                            'Send reset link'
                                        )}
                                    </Button>

                                    <div className="text-center">
                                        <Link
                                            to="/auth"
                                            className="d-inline-flex align-items-center text-grey small"
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <ArrowLeft size={14} className="me-1" />
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

export default ForgotPassword

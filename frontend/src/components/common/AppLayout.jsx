import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { useAuth } from '../../contexts/AuthContext'

const HIDE_LAYOUT_ROUTES = ['/auth']

const AppLayout = () => {
  const { isLoading } = useAuth()
  const { pathname } = useLocation()

  // Auth page renders alone, no Header/Footer (regardless of auth state)
  if (HIDE_LAYOUT_ROUTES.includes(pathname)) return <Outlet />

  // Hide everything while auth is still resolving (avoids flash of guest UI for logged-in users)
  if (isLoading) return <Outlet />

  // Otherwise show the shared chrome. Header handles guest vs authenticated state itself.
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default AppLayout

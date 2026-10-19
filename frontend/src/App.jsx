import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import Sidebar from './components/organisms/Sidebar'
import LoginForm from './components/organisms/LoginForm'
import TicketDetails from './components/organisms/TicketDetails'

import { loginUser, getCurrentUser, logoutUser } from './services/authService'
import {
  getCustomerTickets,
  getAssignedTickets,
  createCustomerTicket,
  updateCustomerTicket,
  updateAssignedTicketStatus,
  updateAdminTicketStatus,
} from './services/ticketService'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminTickets from './pages/admin/AdminTickets'
import AgentDashboard from './pages/agent/AgentDashboard'
import AgentTickets from './pages/agent/AgentTickets'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import CustomerTickets from './pages/customer/CustomerTickets'

import './App.css'

function App() {
  const queryClient = useQueryClient()

  // Authentication state
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState('')

  // Selected ticket
  const [selectedTicket, setSelectedTicket] = useState(null)

  // Create ticket state
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  // Navigation state for each role
  const [activeAdminPage, setActiveAdminPage] = useState('Dashboard')
  const [activeAgentPage, setActiveAgentPage] = useState('Dashboard')
  const [activeCustomerPage, setActiveCustomerPage] =
    useState('Dashboard')

  // Load the current user using the HttpOnly session cookie
  async function loadCurrentUser() {
    setUserLoading(true)
    setUserError('')

    try {
      const user = await getCurrentUser()
      setCurrentUser(user)
    } catch (error) {
      setCurrentUser(null)

      // A missing or invalid session should show the login form.
      if (
        error.message.includes('401') ||
        error.message.includes('403')
      ) {
        setUserError('')
      } else {
        setUserError(error.message)
      }
    } finally {
      setUserLoading(false)
    }
  }

  // Check the existing session when the app starts.
  useEffect(() => {
    loadCurrentUser()
  }, [])

  // Customer tickets
  const {
    data: tickets = [],
    isLoading: ticketsLoading,
    error: ticketsQueryError,
  } = useQuery({
    queryKey: ['customerTickets'],
    queryFn: getCustomerTickets,
    enabled: currentUser?.role === 'customer',
  })

  const ticketsError = ticketsQueryError?.message ?? ''

  // Agent tickets
  const {
    data: assignedTickets = [],
    isLoading: assignedTicketsLoading,
    error: assignedTicketsQueryError,
  } = useQuery({
    queryKey: ['assignedTickets'],
    queryFn: getAssignedTickets,
    enabled: currentUser?.role === 'agent',
  })

  const assignedTicketsError =
    assignedTicketsQueryError?.message ?? ''

  // Login
  async function handleLogin(email, password) {
    setLoginLoading(true)
    setLoginError('')
    setUserError('')

    try {
      await loginUser(email, password)

      const user = await getCurrentUser()

      setCurrentUser(user)
      setSelectedTicket(null)

      await queryClient.invalidateQueries()
    } catch (error) {
      setCurrentUser(null)
      setLoginError(error.message)
    } finally {
      setUserLoading(false)
      setLoginLoading(false)
    }
  }

  // Logout
  async function handleLogout() {
    try {
      await logoutUser()
    } catch (error) {
      console.error('Backend logout failed:', error)
    } finally {
      setCurrentUser(null)
      setUserLoading(false)
      setUserError('')
      setLoginError('')
      setSelectedTicket(null)
      setCreateError('')
      setCreateSuccess('')

      queryClient.clear()
    }
  }

  // Customer creates a ticket
  async function handleCreateTicket(ticketData) {
    setCreateLoading(true)
    setCreateError('')
    setCreateSuccess('')

    try {
      await createCustomerTicket(ticketData)

      await queryClient.invalidateQueries({
        queryKey: ['customerTickets'],
      })

      setCreateSuccess('Ticket created successfully!')
      return true
    } catch (error) {
      setCreateError(error.message)
      return false
    } finally {
      setCreateLoading(false)
    }
  }

  // Admin or agent updates ticket status
  async function handleStatusUpdated(ticketId, status) {
    let updatedTicket

    if (currentUser.role === 'admin') {
      updatedTicket = await updateAdminTicketStatus(ticketId, status)
    } else if (currentUser.role === 'agent') {
      updatedTicket = await updateAssignedTicketStatus(ticketId, status)
    } else {
      throw new Error('You are not allowed to update ticket status.')
    }

    await queryClient.invalidateQueries()
    setSelectedTicket(updatedTicket)

    return updatedTicket
  }

  // Customer updates ticket information
  async function handleUpdateTicket(ticketId, ticketData) {
    const updatedTicket = await updateCustomerTicket(
      ticketId,
      ticketData
    )

    await queryClient.invalidateQueries({
      queryKey: ['customerTickets'],
    })

    setSelectedTicket(updatedTicket)

    return updatedTicket
  }

  // Show loading while checking the session.
  if (userLoading) {
    return <p>Loading user...</p>
  }

  // No authenticated user: use the reusable LoginForm component.
  if (!currentUser) {
    return (
      <LoginForm
        onLogin={handleLogin}
        loading={loginLoading}
        error={loginError}
        connectionError={userError}
        onRetry={loadCurrentUser}
      />
    )
  }

  // Determine the user's role.
  const isCustomer = currentUser.role === 'customer'
  const isAgent = currentUser.role === 'agent'

  // Determine the active page for the current role.
  const activePage = isCustomer
    ? activeCustomerPage
    : isAgent
      ? activeAgentPage
      : activeAdminPage

  const setActivePage = isCustomer
    ? setActiveCustomerPage
    : isAgent
      ? setActiveAgentPage
      : setActiveAdminPage

  // Authenticated application layout
  return (
    <div className="min-h-screen text-slate-800">
      <Sidebar
        currentUser={currentUser}
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <main className="min-w-0 px-4 py-6 sm:px-6 min-[651px]:ml-[210px] min-[1001px]:ml-[250px] lg:px-9 lg:py-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="m-0 text-[11px] font-bold tracking-[1.1px] text-slate-400">
              SUPPORT WORKSPACE
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
              {selectedTicket ? 'Ticket Details' : activePage}
            </h1>
          </div>

          <div className="flex items-center gap-3 text-sm font-semibold">
            <span className="hidden text-slate-600 sm:inline">
              {currentUser.email}
            </span>

            <button
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              type="button"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </header>

        {selectedTicket ? (
          <TicketDetails
            ticket={selectedTicket}
            currentUser={currentUser}
            onBack={() => setSelectedTicket(null)}
            onTicketUpdated={handleUpdateTicket}
            onStatusUpdated={handleStatusUpdated}
          />
        ) : (
          <>
            <section className="my-7">
              <div>
                <p className="m-0 text-[11px] font-bold tracking-[1.1px] text-slate-400">
                  {isCustomer
                    ? 'CUSTOMER WORKSPACE'
                    : isAgent
                      ? 'AGENT WORKSPACE'
                      : 'ADMIN WORKSPACE'}
                </p>

                <h2 className="my-2 text-2xl font-bold tracking-tight text-slate-800">
                  Welcome back!
                </h2>

                <p className="m-0 text-sm text-slate-500">
                  {isCustomer
                    ? 'Here is an overview of your support tickets.'
                    : isAgent
                      ? 'Review and manage tickets assigned to you.'
                      : 'Welcome to the support workspace.'}
                </p>
              </div>
            </section>

            {isCustomer ? (
              activeCustomerPage === 'My Tickets' ? (
                <CustomerTickets
                  tickets={tickets}
                  loading={ticketsLoading}
                  error={ticketsError}
                  onCreate={handleCreateTicket}
                  createLoading={createLoading}
                  createError={createError}
                  createSuccess={createSuccess}
                  onViewDetails={setSelectedTicket}
                />
              ) : (
                <CustomerDashboard
                  tickets={tickets}
                  loading={ticketsLoading}
                  error={ticketsError}
                />
              )
            ) : isAgent ? (
              activeAgentPage === 'My Tickets' ? (
                <AgentTickets
                  assignedTickets={assignedTickets}
                  loading={assignedTicketsLoading}
                  error={assignedTicketsError}
                  onViewDetails={setSelectedTicket}
                />
              ) : (
                <AgentDashboard
                  assignedTickets={assignedTickets}
                  loading={assignedTicketsLoading}
                  error={assignedTicketsError}
                />
              )
            ) : activeAdminPage === 'Tickets' ? (
              <AdminTickets onViewDetails={setSelectedTicket} />
            ) : (
              <AdminDashboard />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import Sidebar from './components/organisms/Sidebar'
import LoginForm from './components/organisms/LoginForm'
import TicketDetails from './components/organisms/TicketDetails'
import RoleWorkspace from './components/sections/RoleWorkspace'

import useAuth from './hooks/useAuth'

import {
  getCustomerTickets,
  getAssignedTickets,
  createCustomerTicket,
  updateCustomerTicket,
  updateAssignedTicketStatus,
  updateAdminTicketStatus,
} from './services/ticketService'

import './App.css'

function App() {
  const queryClient = useQueryClient()

  const {
    currentUser,
    userLoading,
    userError,
    loginLoading,
    loginError,
    loadCurrentUser,
    handleLogin,
    handleLogout,
  } = useAuth()

  const [selectedTicket, setSelectedTicket] = useState(null)

  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  const [activeAdminPage, setActiveAdminPage] = useState('Dashboard')
  const [activeAgentPage, setActiveAgentPage] = useState('Dashboard')
  const [activeCustomerPage, setActiveCustomerPage] = useState('Dashboard')

  // Fetch customer tickets.
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

  // Fetch assigned agent tickets.
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

  // Customer creates a ticket.
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

  // Admin or agent updates ticket status.
  async function handleStatusUpdated(ticketId, status) {
    let updatedTicket

    if (currentUser.role === 'admin') {
      updatedTicket = await updateAdminTicketStatus(ticketId, status)
    } else if (currentUser.role === 'agent') {
      updatedTicket = await updateAssignedTicketStatus(ticketId, status)
    } else {
      throw new Error('You are not allowed to update ticket status.')
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['customerTickets'] }),
      queryClient.invalidateQueries({ queryKey: ['assignedTickets'] }),
      queryClient.invalidateQueries({ queryKey: ['adminDashboardSummary'] }),
      queryClient.invalidateQueries({ queryKey: ['adminAgentPerformance'] }),
      queryClient.invalidateQueries({ queryKey: ['adminTicketTrends'] }),
    ])

    setSelectedTicket(updatedTicket)
    return updatedTicket
  }

  // Customer updates ticket information.
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

  // Preserve application cleanup when logging out.
  async function handleAppLogout() {
    await handleLogout()

    setSelectedTicket(null)
    setCreateError('')
    setCreateSuccess('')

    queryClient.clear()
  }

  if (userLoading) {
    return <p>Loading user...</p>
  }

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

  const isCustomer = currentUser.role === 'customer'
  const isAgent = currentUser.role === 'agent'

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
              onClick={handleAppLogout}
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

            <RoleWorkspace
              currentUser={currentUser}
              activePage={activePage}
              tickets={tickets}
              ticketsLoading={ticketsLoading}
              ticketsError={ticketsError}
              assignedTickets={assignedTickets}
              assignedTicketsLoading={assignedTicketsLoading}
              assignedTicketsError={assignedTicketsError}
              onCreateTicket={handleCreateTicket}
              createLoading={createLoading}
              createError={createError}
              createSuccess={createSuccess}
              onViewDetails={setSelectedTicket}
            />
          </>
        )}
      </main>
    </div>
  )
}

export default App

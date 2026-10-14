import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import Sidebar from './components/organisms/Sidebar'
import LoginForm from './components/organisms/LoginForm'
import StatCard from './components/molecules/StatCard'
import SearchBar from './components/molecules/SearchBar'
import TicketTable from './components/organisms/TicketTable'
import CreateTicketForm from './components/organisms/CreateTicketForm'
import TicketDetails from './components/organisms/TicketDetails'

import { loginUser, getAccessToken, getCurrentUser, logoutUser } from './services/authService'
import { getCustomerTickets, getAssignedTickets, createCustomerTicket, updateCustomerTicket, updateAssignedTicketStatus } from './services/ticketService'

import './App.css'

function App() {
  const queryClient = useQueryClient()

  const [token, setToken] = useState(() => getAccessToken())
  const [search, setSearch] = useState('')

  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [selectedTicket, setSelectedTicket] = useState(null)

  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  const [currentUser, setCurrentUser] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState('')

  const {
    data: tickets = [],
    isLoading: ticketsLoading,
    error: ticketsQueryError,
  } = useQuery({
    queryKey: ['customerTickets', token],
    queryFn: async () => {
      try {
        return await getCustomerTickets(token)
      } catch (error) {
        if (error.message.includes('401')) {
          logoutUser()
          setToken(null)
          setCurrentUser(null)
          setSelectedTicket(null)
        }

        throw error
      }
    },
    enabled: Boolean(token && currentUser?.role === 'customer'),
  })

  const ticketsError = ticketsQueryError?.message ?? ''

  const {
    data: assignedTickets = [],
    isLoading: assignedTicketsLoading,
    error: assignedTicketsQueryError,
  } = useQuery({
    queryKey: ['assignedTickets', token],
    queryFn: () => getAssignedTickets(token),
    enabled: Boolean(token && currentUser?.role === 'agent'),
  })
  const assignedTicketsError = assignedTicketsQueryError?.message ?? ''

  async function handleLogin(email, password) {
    setLoginLoading(true)
    setLoginError('')
    setUserError('')
    setUserLoading(true)
    setCurrentUser(null)

    try {
      const data = await loginUser(email, password)
      setToken(data.access_token)
    } catch (error) {
      setLoginError(error.message)
      setUserLoading(false)
    } finally {
      setLoginLoading(false)
    }
  }

  function handleLogout() {
    logoutUser()
    setToken(null)
    setCurrentUser(null)
    setUserLoading(false)
    setUserError('')
    setSearch('')
    setSelectedTicket(null)
    setCreateError('')
    setCreateSuccess('')

    queryClient.removeQueries({
      queryKey: ['customerTickets'],
    })

    queryClient.removeQueries({
      queryKey: ['assignedTickets'],
    })
  }

  async function handleCreateTicket(ticketData) {
    setCreateLoading(true)
    setCreateError('')
    setCreateSuccess('')

    try {
      await createCustomerTicket(ticketData, token)

      await queryClient.invalidateQueries({
        queryKey: ['customerTickets', token],
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

  async function handleUpdateTicket(ticketId, ticketData) {
    const updatedTicket = await updateCustomerTicket(
      ticketId,
      ticketData,
      token
    )

    await queryClient.invalidateQueries({
      queryKey: ['customerTickets', token],
    })

    setSelectedTicket(updatedTicket)

    return updatedTicket
  }

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    async function loadCurrentUser() {
      setUserLoading(true)
      setUserError('')

      try {
        const user = await getCurrentUser(token)

        if (!cancelled) {
          setCurrentUser(user)
        }
      } catch (error) {
        if (!cancelled) {
          setUserError(error.message)
          setCurrentUser(null)

          if (error.message.includes('401')) {
            logoutUser()
            setToken(null)
          }
        }
      } finally {
        if (!cancelled) {
          setUserLoading(false)
        }
      }
    }

    loadCurrentUser()

    return () => {
      cancelled = true
    }
  }, [token])

  const filteredTickets = tickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(search.toLowerCase())
  )

  if (!token) {
    return (
      <LoginForm
        onLogin={handleLogin}
        loading={loginLoading}
        error={loginError}
      />
    )
  }

  if (userLoading) {
    return <p>Loading user...</p>
  }

  if (userError || !currentUser) {
    return (
      <div className="app-layout">
        <main className="main-content">
          <p className="api-error">
            {userError || 'Could not load user information.'}
          </p>

          <button
            className="logout-button"
            type="button"
            onClick={handleLogout}
          >
            Log out
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">SUPPORT WORKSPACE</p>
            <h1>Dashboard</h1>
          </div>

          <div className="topbar-user">
            <span>{currentUser.email}</span>
            <button
              className="logout-button"
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
            token={token}
            onBack={() => setSelectedTicket(null)}
            onTicketUpdated={handleUpdateTicket}
          />
        ) : (
          <>
            <section className="welcome-section">
              <div>
                <p className="eyebrow">TICKET WORKSPACE</p>
                <h2>Welcome back!</h2>
                <p>Here is an overview of your support tickets.</p>
              </div>
            </section>

            {ticketsError && (
              <p className="api-error">
                Could not load tickets: {ticketsError}
              </p>
            )}

            {currentUser.role === 'customer' ? (
              <>
                <section className="stats-grid">
                  <StatCard
                    title="Total tickets"
                    value={tickets.length}
                    description="Tickets loaded from backend"
                  />

                  <StatCard
                    title="Open"
                    value={
                      tickets.filter(
                        (ticket) => ticket.status === 'Open'
                      ).length
                    }
                    description="Waiting for action"
                  />

                  <StatCard
                    title="In progress"
                    value={
                      tickets.filter(
                        (ticket) => ticket.status === 'In Progress'
                      ).length
                    }
                    description="Currently being handled"
                  />

                  <StatCard
                    title="Resolved"
                    value={
                      tickets.filter(
                        (ticket) => ticket.status === 'Resolved'
                      ).length
                    }
                    description="Completed tickets"
                  />
                </section>

                <CreateTicketForm
                  onCreate={handleCreateTicket}
                  loading={createLoading}
                  error={createError}
                  success={createSuccess}
                />

                <section className="tickets-section">
                  <div className="section-heading">
                    <div>
                      <h2>Recent tickets</h2>
                      <p>Review and search support requests.</p>
                    </div>

                    <SearchBar
                      value={search}
                      onChange={setSearch}
                    />
                  </div>

                  {ticketsLoading ? (
                    <p>Loading tickets...</p>
                  ) : (
                    <TicketTable
                      tickets={filteredTickets}
                      onViewDetails={setSelectedTicket}
                    />
                  )}
                </section>
              </>
            ) : (
              <section className="welcome-section">
                <div>
                  <p className="eyebrow">YOUR ACCOUNT</p>
                  <h2>Welcome back!</h2>
                  <p>Logged in as {currentUser.role}.</p>
                  <p>
                    The customer dashboard is available only to customer
                    accounts. Agent and admin dashboards can be added using
                    their existing backend permissions and routes.
                  </p>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App

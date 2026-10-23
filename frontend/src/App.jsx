import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Navigate, Route, Routes, useLocation, useNavigate, useParams, } from 'react-router'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Sidebar from './components/organisms/Sidebar'
import LoginForm from './components/organisms/LoginForm'
import TicketDetails from './components/organisms/TicketDetails'
import RoleWorkspace from './components/sections/RoleWorkspace'
import useAuth from './hooks/useAuth'
import {
  getCustomerTickets,
  getAssignedTickets,
  getCustomerTicket,
  getAgentTicket,
  getAdminTicket,
  createCustomerTicket,
  updateCustomerTicket,
  updateAssignedTicketStatus,
  updateAdminTicketStatus,
} from './services/ticketService'
import './App.css'

function TicketDetailsRoute({ currentUser, onTicketUpdated, onStatusUpdated }) {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const validTicketId = /^\d+$/.test(ticketId ?? '') && Number(ticketId) > 0

  const ticketQuery = useQuery({
    queryKey: ['ticketDetails', currentUser.role, Number(ticketId)],
    queryFn: () => {
      if (currentUser.role === 'customer') return getCustomerTicket(ticketId)
      if (currentUser.role === 'agent') return getAgentTicket(ticketId)
      return getAdminTicket(ticketId)
    },
    enabled: validTicketId,
  })

  const backToTickets = () => navigate(location.state?.from || `/${currentUser.role}/tickets`)

  if (!validTicketId) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="mb-4">Invalid ticket ID.</p>
        <Button variant="outline" onClick={backToTickets}>Back to tickets</Button>
      </div>
    )
  }

  if (ticketQuery.isLoading) return <p>Loading ticket...</p>

  if (ticketQuery.isError || !ticketQuery.data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="mb-4">Ticket could not be found or you don't have permission to view it.</p>
        <Button variant="outline" onClick={backToTickets}>Back to tickets</Button>
      </div>
    )
  }

  return (
    <TicketDetails
      ticket={ticketQuery.data}
      currentUser={currentUser}
      onBack={backToTickets}
      onTicketUpdated={onTicketUpdated}
      onStatusUpdated={onStatusUpdated}
    />
  )
}

function App() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
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

  const [customerPage, setCustomerPage] = useState(1)
  const [agentPage, setAgentPage] = useState(1)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const pageSize = 10

  const {
    data: customerTicketsData,
    isLoading: ticketsLoading,
    error: ticketsQueryError,
  } = useQuery({
    queryKey: ['customerTickets', customerPage, pageSize],
    queryFn: () => getCustomerTickets(customerPage, pageSize),
    enabled: currentUser?.role === 'customer',
  })

  const tickets = customerTicketsData?.items ?? []
  const customerTotalPages = customerTicketsData?.pages ?? 0
  const customerTotalTickets = customerTicketsData?.total ?? 0
  const ticketsError = ticketsQueryError?.message ?? ''

  const {
    data: assignedTicketsData,
    isLoading: assignedTicketsLoading,
    error: assignedTicketsQueryError,
  } = useQuery({
    queryKey: ['assignedTickets', agentPage, pageSize],
    queryFn: () => getAssignedTickets(agentPage, pageSize),
    enabled: currentUser?.role === 'agent' && location.pathname === '/agent/tickets',
  })

  const assignedTickets = assignedTicketsData?.items ?? []
  const agentTotalPages = assignedTicketsData?.pages ?? 0
  const agentTotalTickets = assignedTicketsData?.total ?? 0
  const assignedTicketsError = assignedTicketsQueryError?.message ?? ''

  async function handleLoginAndNavigate(email, password) {
    const user = await handleLogin(email, password)
    navigate(`/${user.role}/dashboard`, { replace: true })
    return user
  }

  async function handleCreateTicket(ticketData) {
    setCreateLoading(true)
    setCreateError('')
    setCreateSuccess('')
    try {
      await createCustomerTicket(ticketData)
      await queryClient.invalidateQueries({ queryKey: ['customerTickets'] })
      setCreateSuccess('Ticket created successfully!')
      return true
    } catch (error) {
      setCreateError(error.message)
      return false
    } finally {
      setCreateLoading(false)
    }
  }

  async function handleStatusUpdated(ticketId, status) {
    const updatedTicket = currentUser.role === 'admin'
      ? await updateAdminTicketStatus(ticketId, status)
      : currentUser.role === 'agent'
        ? await updateAssignedTicketStatus(ticketId, status)
        : null

    if (!updatedTicket) throw new Error('You are not allowed to update ticket status.')

    queryClient.setQueryData(
      ['ticketDetails', currentUser.role, Number(ticketId)],
      updatedTicket,
    )

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['customerTickets'] }),
      queryClient.invalidateQueries({ queryKey: ['assignedTickets'] }),
      queryClient.invalidateQueries({ queryKey: ['adminDashboardSummary'] }),
      queryClient.invalidateQueries({ queryKey: ['adminAgentPerformance'] }),
      queryClient.invalidateQueries({ queryKey: ['adminTicketTrends'] }),
    ])

    return updatedTicket
  }

  async function handleUpdateTicket(ticketId, ticketData) {
    const updatedTicket = await updateCustomerTicket(ticketId, ticketData)
    queryClient.setQueryData(
      ['ticketDetails', currentUser.role, Number(ticketId)],
      updatedTicket,
    )
    await queryClient.invalidateQueries({ queryKey: ['customerTickets'] })
    return updatedTicket
  }

  async function handleAppLogout() {
    await handleLogout()
    setCreateError('')
    setCreateSuccess('')
    queryClient.clear()
    navigate('/login', { replace: true })
  }

  if (userLoading) return <p>Loading user...</p>

  if (!currentUser) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <LoginForm
              onLogin={handleLoginAndNavigate}
              loading={loginLoading}
              error={loginError}
              connectionError={userError}
              onRetry={loadCurrentUser}
            />
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  const role = currentUser.role
  const dashboardPath = `/${role}/dashboard`
  const ticketsPath = `/${role}/tickets`
  const workspaceProps = {
    currentUser,
    tickets,
    ticketsLoading,
    ticketsError,
    assignedTickets,
    assignedTicketsLoading,
    assignedTicketsError,
    customerPage,
    setCustomerPage,
    customerTotalPages,
    customerTotalTickets,
    agentPage,
    setAgentPage,
    agentTotalPages,
    agentTotalTickets,
    onCreateTicket: handleCreateTicket,
    createLoading,
    createError,
    createSuccess,
    onViewDetails: (ticket) => navigate(`${ticketsPath}/${ticket.id}`, { state: { from: location.pathname } }),
  }

  return (
    <div className="min-h-screen text-slate-800">
      <Sidebar currentUser={currentUser} />
      <main className="min-w-0 px-4 py-6 sm:px-6 min-[651px]:ml-[210px] min-[1001px]:ml-[250px] lg:px-9 lg:py-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3" />
          <div className="flex items-center gap-3 text-sm">
            <div className="hidden text-right sm:block">
              <p className="font-semibold text-slate-800">{currentUser.email}</p>
              <p className="mt-0.5 text-xs text-slate-500">Signed in</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAppLogout}
              className="rounded-xl border-slate-200 text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut size={16} />
              Log out
            </Button>
          </div>
        </header>
        <Routes>
          <Route
            path={dashboardPath}
            element={<RoleWorkspace {...workspaceProps} activePage="Dashboard" />}
          />
          <Route
            path={ticketsPath}
            element={
              <RoleWorkspace
                {...workspaceProps}
                activePage={role === 'admin' ? 'Tickets' : 'My Tickets'}
              />
            }
          />
          <Route
            path={`${ticketsPath}/:ticketId`}
            element={
              <TicketDetailsRoute
                currentUser={currentUser}
                onTicketUpdated={handleUpdateTicket}
                onStatusUpdated={handleStatusUpdated}
              />
            }
          />
          <Route path="*" element={<Navigate to={dashboardPath} replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

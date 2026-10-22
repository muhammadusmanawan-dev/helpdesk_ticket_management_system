import AdminDashboard from '../../pages/admin/AdminDashboard'
import AdminTickets from '../../pages/admin/AdminTickets'
import AgentDashboard from '../../pages/agent/AgentDashboard'
import AgentTickets from '../../pages/agent/AgentTickets'
import CustomerDashboard from '../../pages/customer/CustomerDashboard'
import CustomerTickets from '../../pages/customer/CustomerTickets'

function RoleWorkspace({
    currentUser,
    activePage,
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
    onCreateTicket,
    createLoading,
    createError,
    createSuccess,
    onViewDetails,
}) {
    const role = currentUser.role

    if (role === 'customer') {
        if (activePage === 'My Tickets') {
            return (
                <CustomerTickets
                    tickets={tickets}
                    loading={ticketsLoading}
                    error={ticketsError}
                    page={customerPage}
                    setPage={setCustomerPage}
                    totalPages={customerTotalPages}
                    totalTickets={customerTotalTickets}
                    onCreate={onCreateTicket}
                    createLoading={createLoading}
                    createError={createError}
                    createSuccess={createSuccess}
                    onViewDetails={onViewDetails}
                />
            )
        }

        return (
            <CustomerDashboard
                tickets={tickets}
                loading={ticketsLoading}
                error={ticketsError}
            />
        )
    }

    if (role === 'agent') {
        if (activePage === 'My Tickets') {
            return (
                <AgentTickets
                    assignedTickets={assignedTickets}
                    loading={assignedTicketsLoading}
                    error={assignedTicketsError}
                    page={agentPage}
                    setPage={setAgentPage}
                    totalPages={agentTotalPages}
                    totalTickets={agentTotalTickets}
                    onViewDetails={onViewDetails}
                />
            )
        }

        return (
            <AgentDashboard
                assignedTickets={assignedTickets}
                loading={assignedTicketsLoading}
                error={assignedTicketsError}
            />
        )
    }

    if (activePage === 'Tickets') {
        return <AdminTickets onViewDetails={onViewDetails} />
    }

    return <AdminDashboard />
}

export default RoleWorkspace

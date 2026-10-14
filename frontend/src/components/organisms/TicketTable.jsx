import StatusBadge from '../atoms/StatusBadge'

function TicketTable({
    tickets,
    onViewDetails,
    agents,
    onAssign,
    onDelete,
    assigningTicketId,
    deletingTicketId,
}) {
    const showAdminActions = Boolean(onAssign || onDelete)

    return (
        <div className="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Ticket</th>
                        <th>Customer</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Action</th>
                        {showAdminActions && <th>Admin Actions</th>}
                    </tr>
                </thead>

                <tbody>
                    {tickets.map((ticket) => {
                        const assignedAgentId =
                            ticket.assigned_agent_id ??
                            ticket.assigned_to_id ??
                            ticket.agent_id ??
                            ''

                        return (
                            <tr key={ticket.id}>
                                <td>
                                    <strong>{ticket.title}</strong>
                                    <small>#{ticket.id}</small>
                                </td>

                                <td>{ticket.customer ?? 'Customer'}</td>

                                <td>
                                    <span
                                        className={`priority ${(ticket.priority ?? 'low').toLowerCase()}`}
                                    >
                                        {ticket.priority ?? 'Low'}
                                    </span>
                                </td>

                                <td>
                                    <StatusBadge status={ticket.status ?? 'Open'} />
                                </td>

                                <td>
                                    <button
                                        type="button"
                                        onClick={() => onViewDetails?.(ticket)}
                                    >
                                        View Details
                                    </button>
                                </td>

                                {showAdminActions && (
                                    <td>
                                        <div className="flex flex-col gap-2">
                                            {onAssign && (
                                                <select
                                                    value={assignedAgentId}
                                                    disabled={assigningTicketId === ticket.id}
                                                    onChange={(event) =>
                                                        onAssign(ticket.id, event.target.value)
                                                    }
                                                    aria-label={`Assign agent to ${ticket.title}`}
                                                >
                                                    <option value="">
                                                        Select agent
                                                    </option>

                                                    {(agents ?? []).map((agent) => (
                                                        <option
                                                            key={agent.id}
                                                            value={agent.id}
                                                        >
                                                            {agent.email}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}

                                            {onDelete && (
                                                <button
                                                    type="button"
                                                    disabled={deletingTicketId === ticket.id}
                                                    onClick={() => onDelete(ticket)}
                                                >
                                                    {deletingTicketId === ticket.id
                                                        ? 'Deleting...'
                                                        : 'Delete'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        )
                    })}

                    {tickets.length === 0 && (
                        <tr>
                            <td
                                colSpan={showAdminActions ? 6 : 5}
                                className="empty-state"
                            >
                                No matching tickets found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default TicketTable

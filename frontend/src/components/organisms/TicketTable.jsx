
import StatusBadge from '../atoms/StatusBadge'

function TicketTable({ tickets }) {
    return (
        <div className="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Ticket</th>
                        <th>Customer</th>
                        <th>Priority</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    {tickets.map((ticket) => (
                        <tr key={ticket.id}>
                            <td>
                                <strong>{ticket.title}</strong>
                                <small>#{ticket.id}</small>
                            </td>

                            <td>{ticket.customer}</td>

                            <td>
                                <span className={`priority ${ticket.priority.toLowerCase()}`}>
                                    {ticket.priority}
                                </span>
                            </td>

                            <td>
                                <StatusBadge status={ticket.status} />
                            </td>
                        </tr>
                    ))}

                    {tickets.length === 0 && (
                        <tr>
                            <td colSpan="4" className="empty-state">
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

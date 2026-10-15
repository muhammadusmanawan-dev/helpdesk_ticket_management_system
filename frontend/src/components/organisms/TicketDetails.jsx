
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getTicketComments,
    createTicketComment,
} from '../../services/ticketService'

function TicketDetails({ ticket, token, currentUser, onBack, onTicketUpdated, onStatusUpdated }) {
    const isCustomer = currentUser?.role === 'customer'
    const isAgent = currentUser?.role === 'agent'
    const isAdmin = currentUser?.role === 'admin'

    const canViewComments = isCustomer || isAgent

    const currentStatus = ticket.status.toLowerCase().replaceAll(' ', '_')

    const statusOptions = isAdmin
        ? {
            open: ['assigned'],
            assigned: ['open', 'in_progress'],
            in_progress: ['open', 'assigned', 'resolved'],
            resolved: ['open', 'assigned', 'in_progress', 'closed'],
            closed: ['open'],
        }
        : {
            assigned: ['in_progress'],
            in_progress: ['resolved'],
        }

    const availableStatuses = statusOptions[currentStatus] ?? []

    const queryClient = useQueryClient()

    const {
        data: comments = [],
        isLoading: commentsLoading,
        error: commentsQueryError,
    } = useQuery({
        queryKey: ['ticketComments', ticket.id, token],
        queryFn: () => getTicketComments(ticket.id, token),
        enabled: Boolean(token) && Boolean(ticket.id) && canViewComments,
    })
    const commentsError = commentsQueryError?.message ?? ''

    const [content, setContent] = useState('')
    const [submitError, setSubmitError] = useState('')

    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState(ticket.title)
    const [editDescription, setEditDescription] = useState(ticket.description ?? '')
    const [editPriority, setEditPriority] = useState(ticket.priority.toLowerCase())
    const [saving, setSaving] = useState(false)
    const [editError, setEditError] = useState('')
    const [editSuccess, setEditSuccess] = useState('')

    const [statusValue, setStatusValue] = useState(ticket.status.toLowerCase().replaceAll(' ', '_'))
    const [statusSaving, setStatusSaving] = useState(false)
    const [statusError, setStatusError] = useState('')
    const [statusSuccess, setStatusSuccess] = useState('')

    useEffect(() => {
        setEditTitle(ticket.title)
        setEditDescription(ticket.description ?? '')
        setEditPriority(ticket.priority.toLowerCase())
        setStatusValue(ticket.status.toLowerCase().replaceAll(' ', '_'))
        setIsEditing(false)
        setEditError('')
        setEditSuccess('')
        setStatusError('')
        setStatusSuccess('')
    }, [ticket.id, ticket.title, ticket.description, ticket.priority, ticket.status])

    function formatDate(date) {
        if (!date) {
            return 'Not available'
        }

        return new Date(date).toLocaleString()
    }

    async function handleEditSubmit(event) {
        event.preventDefault()

        setSaving(true)
        setEditError('')
        setEditSuccess('')

        try {
            await onTicketUpdated(ticket.id, {
                title: editTitle.trim(),
                description: editDescription.trim(),
                priority: editPriority,
            })

            setIsEditing(false)
            setEditSuccess('Ticket updated successfully!')
        } catch (error) {
            setEditError(error.message)
        } finally {
            setSaving(false)
        }
    }

    const createCommentMutation = useMutation({
        mutationFn: ({ ticketId, content }) =>
            createTicketComment(ticketId, content, token),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['ticketComments', ticket.id, token],
            })

            setContent('')
            setSubmitError('')
        },

        onError: (error) => {
            setSubmitError(error.message)
        },
    })

    async function handleSubmit(event) {
        event.preventDefault()

        const trimmedContent = content.trim()

        if (!trimmedContent) {
            return
        }

        setSubmitError('')

        createCommentMutation.mutate({
            ticketId: ticket.id,
            content: trimmedContent,
        })
    }
    async function handleStatusChange(event) {
        const newStatus = event.target.value

        setStatusValue(newStatus)
        setStatusError('')
        setStatusSuccess('')

        if (newStatus === ticket.status.toLowerCase().replaceAll(' ', '_')) {
            return
        }

        setStatusSaving(true)

        try {
            await onStatusUpdated(ticket.id, newStatus)
            setStatusSuccess('Ticket status updated successfully!')
        } catch (error) {
            setStatusValue(
                ticket.status.toLowerCase().replaceAll(' ', '_')
            )
            setStatusError(error.message)
        } finally {
            setStatusSaving(false)
        }
    }

    return (
        <section className="ticket-details-section">
            <button type="button" onClick={onBack}>
                ← Back to tickets
            </button>

            <div className="ticket-details-header">
                <div>
                    <p className="eyebrow">TICKET #{ticket.id}</p>
                    <h2>{ticket.title}</h2>
                </div>

                <span
                    className={`priority ${ticket.priority.toLowerCase()}`}
                >
                    {ticket.priority}
                </span>
            </div>

            <div className="ticket-information">
                <div className="ticket-information-heading">
                    <h3>Ticket information</h3>

                    {isCustomer && !isEditing && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditTitle(ticket.title)
                                setEditDescription(
                                    ticket.description ?? ''
                                )
                                setEditPriority(
                                    ticket.priority.toLowerCase()
                                )
                                setEditError('')
                                setEditSuccess('')
                                setIsEditing(true)
                            }}
                        >
                            Edit Ticket
                        </button>
                    )}
                </div>

                {editSuccess && (
                    <p className="success-message">{editSuccess}</p>
                )}

                {isEditing && isCustomer ? (
                    <form
                        className="edit-ticket-form"
                        onSubmit={handleEditSubmit}
                    >
                        <label htmlFor="edit-title">Title</label>
                        <input
                            id="edit-title"
                            value={editTitle}
                            onChange={(event) =>
                                setEditTitle(event.target.value)
                            }
                            maxLength={200}
                            required
                        />

                        <label htmlFor="edit-description">
                            Description
                        </label>
                        <textarea
                            id="edit-description"
                            value={editDescription}
                            onChange={(event) =>
                                setEditDescription(event.target.value)
                            }
                            rows={4}
                            required
                        />

                        <label htmlFor="edit-priority">Priority</label>
                        <select
                            id="edit-priority"
                            value={editPriority}
                            onChange={(event) =>
                                setEditPriority(event.target.value)
                            }
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>

                        {editError && (
                            <p className="api-error">{editError}</p>
                        )}

                        <div className="edit-ticket-actions">
                            <button type="submit" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>

                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => {
                                    setIsEditing(false)
                                    setEditError('')
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <p>
                            <strong>Description:</strong>
                        </p>
                        <p>{ticket.description}</p>

                        <p>
                            <strong>Status:</strong> {ticket.status}
                        </p>

                        {(isAgent || isAdmin) && (
                            <div className="status-update-form">
                                <label htmlFor="ticket-status">
                                    {isAdmin ? 'Manage ticket status' : 'Update ticket status'}
                                </label>

                                <select
                                    id="ticket-status"
                                    value={statusValue}
                                    onChange={handleStatusChange}
                                    disabled={statusSaving || availableStatuses.length === 0}
                                >
                                    <option value={currentStatus}>
                                        {ticket.status}
                                    </option>

                                    {availableStatuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status.replaceAll('_', ' ')}
                                        </option>
                                    ))}
                                </select>

                                {statusSaving && <p>Updating status...</p>}

                                {statusError && (
                                    <p className="api-error">{statusError}</p>
                                )}

                                {statusSuccess && (
                                    <p className="success-message">{statusSuccess}</p>
                                )}
                            </div>
                        )}

                        <p>
                            <strong>Created:</strong>{' '}
                            {formatDate(ticket.created_at)}
                        </p>

                        <p>
                            <strong>Last updated:</strong>{' '}
                            {formatDate(ticket.updated_at)}
                        </p>
                    </>
                )}
            </div>

            {canViewComments && (
                <div className="ticket-comments">
                    <h3>Comments and conversation</h3>

                    {commentsLoading && <p>Loading comments...</p>}

                    {commentsError && (
                        <p className="api-error">
                            Could not load comments: {commentsError}
                        </p>
                    )}

                    {!commentsLoading &&
                        !commentsError &&
                        comments.length === 0 && (
                            <p>No comments yet. Start the conversation.</p>
                        )}

                    {comments.map((comment) => (
                        <article
                            className="comment-card"
                            key={comment.id}
                        >
                            <p>{comment.content}</p>
                            <small>{formatDate(comment.created_at)}</small>
                        </article>
                    ))}

                    <form
                        className="comment-form"
                        onSubmit={handleSubmit}
                    >
                        <label htmlFor="new-comment">Add a comment</label>

                        <textarea
                            id="new-comment"
                            value={content}
                            onChange={(event) =>
                                setContent(event.target.value)
                            }
                            placeholder="Write your message..."
                            rows={3}
                            maxLength={5000}
                            required
                        />

                        {submitError && (
                            <p className="api-error">{submitError}</p>
                        )}

                        <button
                            type="submit"
                            disabled={createCommentMutation.isPending || !content.trim()}
                        >
                            {createCommentMutation.isPending ? 'Sending...' : 'Send comment'}
                        </button>

                    </form>
                </div>
            )}
        </section>
    )
}

export default TicketDetails

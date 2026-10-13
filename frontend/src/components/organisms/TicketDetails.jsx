
import { useEffect, useState } from 'react'
import {
    getTicketComments,
    createTicketComment,
} from '../../services/ticketService'

function TicketDetails({ ticket, token, onBack, onTicketUpdated }) {
    const [comments, setComments] = useState([])
    const [commentsLoading, setCommentsLoading] = useState(true)
    const [commentsError, setCommentsError] = useState('')
    const [content, setContent] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')

    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState(ticket.title)
    const [editDescription, setEditDescription] = useState(
        ticket.description ?? ''
    )
    const [editPriority, setEditPriority] = useState(
        ticket.priority.toLowerCase()
    )
    const [saving, setSaving] = useState(false)
    const [editError, setEditError] = useState('')
    const [editSuccess, setEditSuccess] = useState('')

    useEffect(() => {
        let cancelled = false

        async function loadComments() {
            setComments([])
            setCommentsLoading(true)
            setCommentsError('')

            try {
                const data = await getTicketComments(ticket.id, token)

                if (!cancelled) {
                    setComments(Array.isArray(data) ? data : [])
                }
            } catch (error) {
                if (!cancelled) {
                    setCommentsError(error.message)
                }
            } finally {
                if (!cancelled) {
                    setCommentsLoading(false)
                }
            }
        }

        loadComments()

        return () => {
            cancelled = true
        }
    }, [ticket.id, token])

    async function handleSubmit(event) {
        event.preventDefault()

        const trimmedContent = content.trim()

        if (!trimmedContent) {
            return
        }

        setSubmitting(true)
        setSubmitError('')

        try {
            const newComment = await createTicketComment(
                ticket.id,
                trimmedContent,
                token
            )

            setComments((currentComments) => [
                ...currentComments,
                newComment,
            ])

            setContent('')
        } catch (error) {
            setSubmitError(error.message)
        } finally {
            setSubmitting(false)
        }
    }

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

                    {!isEditing && (
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

                {isEditing ? (
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
                        </select>

                        {editError && (
                            <p className="api-error">{editError}</p>
                        )}

                        <div className="edit-ticket-actions">
                            <button type="submit" disabled={saving}>
                                {saving
                                    ? 'Saving...'
                                    : 'Save Changes'}
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
                        <p>
                            No comments yet. Start the conversation.
                        </p>
                    )}

                {comments.map((comment) => (
                    <article
                        className="comment-card"
                        key={comment.id}
                    >
                        <p>{comment.content}</p>

                        <small>
                            {formatDate(comment.created_at)}
                        </small>
                    </article>
                ))}

                <form
                    className="comment-form"
                    onSubmit={handleSubmit}
                >
                    <label htmlFor="new-comment">
                        Add a comment
                    </label>

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
                        disabled={submitting || !content.trim()}
                    >
                        {submitting
                            ? 'Sending...'
                            : 'Send comment'}
                    </button>
                </form>
            </div>
        </section>
    )
}

export default TicketDetails

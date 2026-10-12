import { useEffect, useState } from 'react'
import {
    getTicketComments,
    createTicketComment,
} from '../../services/ticketService'

function TicketDetails({ ticket, token, onBack }) {
    const [comments, setComments] = useState([])
    const [commentsLoading, setCommentsLoading] = useState(true)
    const [commentsError, setCommentsError] = useState('')
    const [content, setContent] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')

    useEffect(() => {
        let cancelled = false

        async function loadComments() {
            setComments([])
            setCommentsLoading(true)
            setCommentsError('')

            try {
                const data = await getTicketComments(ticket.id, token)

                if (!cancelled) {
                    setComments(data)
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

        if (!trimmedContent) return

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
        if (!date) return 'Not available'

        return new Date(date).toLocaleString()
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
                <h3>Ticket information</h3>

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
            </div>

            <div className="ticket-comments">
                <h3>Conversation</h3>

                {commentsLoading && <p>Loading comments...</p>}

                {commentsError && (
                    <p className="api-error">
                        Could not load comments: {commentsError}
                    </p>
                )}

                {!commentsLoading &&
                    !commentsError &&
                    comments.length === 0 && (
                        <p>No comments yet. Start the conversation below.</p>
                    )}

                {!commentsLoading &&
                    comments.map((comment) => (
                        <article
                            className="comment-card"
                            key={comment.id}
                        >
                            <p>{comment.content}</p>

                            <small>
                                User · {formatDate(comment.created_at)}
                            </small>
                        </article>
                    ))}

                <form
                    className="comment-form"
                    onSubmit={handleSubmit}
                >
                    <label htmlFor="comment-content">
                        Add a comment
                    </label>

                    <textarea
                        id="comment-content"
                        value={content}
                        onChange={(event) =>
                            setContent(event.target.value)
                        }
                        placeholder="Write your message..."
                        rows={4}
                        required
                    />

                    {submitError && (
                        <p className="api-error">{submitError}</p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting || !content.trim()}
                    >
                        {submitting ? 'Sending...' : 'Send comment'}
                    </button>
                </form>
            </div>
        </section>
    )
}

export default TicketDetails

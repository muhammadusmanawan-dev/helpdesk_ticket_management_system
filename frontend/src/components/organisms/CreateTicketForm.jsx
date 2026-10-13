
import { useState } from 'react'

function CreateTicketForm({ onCreate, loading, error, success }) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState('low')

    async function handleSubmit(event) {
        event.preventDefault()

        const created = await onCreate({
            title: title.trim(),
            description: description.trim(),
            priority,
        })

        if (created) {
            setTitle('')
            setDescription('')
            setPriority('low')
        }
    }

    return (
        <section className="create-ticket-section">
            <h2>Create a support ticket</h2>
            <p>Describe your issue and our support team will help you.</p>

            <form onSubmit={handleSubmit} className="create-ticket-form">
                <label htmlFor="ticket-title">Title</label>
                <input
                    id="ticket-title"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. Unable to access my account"
                    maxLength={200}
                    required
                />

                <label htmlFor="ticket-description">Description</label>
                <textarea
                    id="ticket-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Explain the issue you are experiencing..."
                    rows={4}
                    required
                />

                <label htmlFor="ticket-priority">Priority</label>
                <select
                    id="ticket-priority"
                    value={priority}
                    onChange={(event) => setPriority(event.target.value)}
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>

                {error && <p className="api-error">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Creating ticket...' : 'Create ticket'}
                </button>
            </form>
        </section>
    )
}

export default CreateTicketForm

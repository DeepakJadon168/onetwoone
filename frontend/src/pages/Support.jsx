import { useEffect, useState } from "react";
import api from "../api/axios";

const emptyForm = { subject: "", category: "General", message: "" };
const statusColor = { open: "status-pending", "in-progress": "status-confirmed", resolved: "status-completed", closed: "status-cancelled" };

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
    try {
      const { data } = await api.get("/tickets/my");
      setTickets(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/tickets", form);
      setForm(emptyForm);
      loadTickets();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create the ticket");
    }
  };

  const openTicket = async (ticketId) => {
    const { data } = await api.get(`/tickets/${ticketId}`);
    setActiveTicket(data);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    const { data } = await api.post(`/tickets/${activeTicket._id}/reply`, { message: replyText });
    setActiveTicket(data);
    setReplyText("");
    loadTickets();
  };

  if (loading) return <p className="info-text">Loading...</p>;

  return (
    <div>
      <h2 className="page-title">Support / Help Center</h2>

      <div className="admin-grid">
        <form className="admin-form" onSubmit={handleSubmit}>
          <h3>Raise a New Ticket</h3>
          {error && <p className="error-text">{error}</p>}
          <input name="subject" placeholder="Subject (e.g. Refund not received)" value={form.subject} onChange={handleChange} required />
          <select name="category" value={form.category} onChange={handleChange}>
            <option>General</option>
            <option>Booking Issue</option>
            <option>Payment Issue</option>
            <option>Vehicle Issue</option>
            <option>Other</option>
          </select>
          <textarea name="message" placeholder="Describe your issue in detail..." value={form.message} onChange={handleChange} required rows={5} />
          <div className="form-actions">
            <button type="submit" className="btn-primary">Submit Ticket</button>
          </div>
        </form>

        <div className="admin-list">
          <h3 style={{ marginBottom: "10px" }}>Your Tickets</h3>
          {tickets.length === 0 && <p className="info-text">You have no tickets yet.</p>}
          {tickets.map((t) => (
            <div className="admin-list-item" key={t._id} style={{ cursor: "pointer" }} onClick={() => openTicket(t._id)}>
              <div>
                <h4>{t.subject} <span className="tag">{t.category}</span></h4>
                <p>{t.messages?.length} message(s) • last update {new Date(t.updatedAt).toLocaleString("en-IN")}</p>
              </div>
              <span className={`status-badge ${statusColor[t.status]}`}>{t.status}</span>
            </div>
          ))}
        </div>
      </div>

      {activeTicket && (
        <div className="ticket-thread">
          <div className="ticket-thread-header">
            <h3>{activeTicket.subject}</h3>
            <button className="btn-secondary" onClick={() => setActiveTicket(null)}>Close</button>
          </div>
          <div className="ticket-messages">
            {activeTicket.messages.map((m, i) => (
              <div key={i} className={`ticket-msg ${m.sender === "admin" ? "from-admin" : "from-user"}`}>
                <strong>{m.sender === "admin" ? "Support Team" : m.senderName || "You"}</strong>
                <p>{m.text}</p>
                <span className="ticket-msg-time">{new Date(m.createdAt).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
          {activeTicket.status !== "closed" && (
            <div className="ticket-reply-box">
              <textarea placeholder="Write a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} />
              <button className="btn-primary" onClick={handleReply}>Send Reply</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Support;

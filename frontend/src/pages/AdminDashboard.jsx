import { useEffect, useState } from "react";
import api from "../api/axios";

const emptyForm = { name: "", brand: "", type: "Scooty", pricePerHour: "", pricePerDay: "", location: "", description: "", fuelType: "Petrol", seats: 2, imageUrl: "", images: [] };
const emptyCoupon = { code: "", discountPercent: "", minAmount: 0 };
const ticketStatusColor = { open: "status-pending", "in-progress": "status-confirmed", resolved: "status-completed", closed: "status-cancelled" };

const AdminDashboard = () => {
  const [tab, setTab] = useState("vehicles");
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [couponForm, setCouponForm] = useState(emptyCoupon);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [couponError, setCouponError] = useState("");
  const [uploading, setUploading] = useState(false);

  // Tickets
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [ticketReply, setTicketReply] = useState("");

  // QR Verify (manual token entry, alternative to scanning)
  const [verifyToken, setVerifyToken] = useState("");
  const [verifyInfo, setVerifyInfo] = useState(null);
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const loadVehicles = async () => { const { data } = await api.get("/vehicles"); setVehicles(data); };
  const loadBookings = async () => { const { data } = await api.get("/bookings"); setBookings(data); };
  const loadCoupons = async () => { const { data } = await api.get("/coupons"); setCoupons(data); };
  const loadStats = async () => { const { data } = await api.get("/analytics/dashboard"); setStats(data); };
  const loadTickets = async () => { const { data } = await api.get("/tickets"); setTickets(data); };

  useEffect(() => { loadVehicles(); loadBookings(); loadCoupons(); loadStats(); loadTickets(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleCouponChange = (e) => setCouponForm({ ...couponForm, [e.target.name]: e.target.value });

  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) await api.put(`/vehicles/${editingId}`, form);
      else await api.post("/vehicles", form);
      resetForm();
      loadVehicles();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (vehicle) => {
    setForm({ name: vehicle.name, brand: vehicle.brand, type: vehicle.type, pricePerHour: vehicle.pricePerHour, pricePerDay: vehicle.pricePerDay, location: vehicle.location, description: vehicle.description, fuelType: vehicle.fuelType, seats: vehicle.seats, imageUrl: vehicle.imageUrl, images: vehicle.images || [] });
    setEditingId(vehicle._id);
    setTab("vehicles");
  };

  const handleDelete = async (id) => { if (!confirm("Are you sure you want to delete this?")) return; await api.delete(`/vehicles/${id}`); loadVehicles(); };
  const handleStatusChange = async (id, status) => { await api.put(`/bookings/${id}/status`, { status }); loadBookings(); loadVehicles(); };

  // --- Multiple image / cloud upload ---
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("images", f));
      const { data } = await api.post("/uploads/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, images: [...prev.images, ...data.urls] }));
    } catch (err) {
      setError(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (url) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((i) => i !== url) }));
  };

  // --- Support tickets ---
  const openTicket = async (id) => { const { data } = await api.get(`/tickets/${id}`); setActiveTicket(data); };
  const handleTicketReply = async () => {
    if (!ticketReply.trim()) return;
    const { data } = await api.post(`/tickets/${activeTicket._id}/reply`, { message: ticketReply });
    setActiveTicket(data);
    setTicketReply("");
    loadTickets();
  };
  const handleTicketStatus = async (status) => {
    const { data } = await api.put(`/tickets/${activeTicket._id}/status`, { status });
    setActiveTicket(data);
    loadTickets();
  };

  // --- QR check-in verification ---
  const handleLookupToken = async () => {
    if (!verifyToken.trim()) return;
    setVerifyError("");
    setVerifyInfo(null);
    try {
      const { data } = await api.get(`/bookings/verify/${verifyToken.trim()}`);
      setVerifyInfo(data);
    } catch (err) {
      setVerifyError(err.response?.data?.message || "Invalid code");
    }
  };
  const handleMarkVerified = async () => {
    setVerifying(true);
    try {
      const { data } = await api.post(`/bookings/verify/${verifyToken.trim()}`);
      setVerifyInfo({ ...verifyInfo, verified: true, verifiedAt: new Date() });
      alert(data.message);
    } catch (err) {
      setVerifyError(err.response?.data?.message || "Could not verify");
    } finally {
      setVerifying(false);
    }
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    setCouponError("");
    try {
      await api.post("/coupons", couponForm);
      setCouponForm(emptyCoupon);
      loadCoupons();
    } catch (err) {
      setCouponError(err.response?.data?.message || "Could not add the coupon");
    }
  };

  const handleCouponDelete = async (id) => { if (!confirm("Are you sure you want to delete this coupon?")) return; await api.delete(`/coupons/${id}`); loadCoupons(); };

  return (
    <div>
      <h2 className="page-title">Admin Dashboard</h2>

      <div className="admin-tabs">
        <button className={tab === "vehicles" ? "tab active" : "tab"} onClick={() => setTab("vehicles")}>Vehicles</button>
        <button className={tab === "bookings" ? "tab active" : "tab"} onClick={() => setTab("bookings")}>Bookings</button>
        <button className={tab === "coupons" ? "tab active" : "tab"} onClick={() => setTab("coupons")}>Coupons</button>
        <button className={tab === "analytics" ? "tab active" : "tab"} onClick={() => setTab("analytics")}>Analytics</button>
        <button className={tab === "tickets" ? "tab active" : "tab"} onClick={() => setTab("tickets")}>
          Support Tickets {tickets.filter((t) => t.status === "open").length > 0 && <span className="tab-dot">{tickets.filter((t) => t.status === "open").length}</span>}
        </button>
        <button className={tab === "verify" ? "tab active" : "tab"} onClick={() => setTab("verify")}>Verify Booking (QR)</button>
      </div>

      {tab === "vehicles" && (
        <div className="admin-grid">
          <form className="admin-form" onSubmit={handleSubmit}>
            <h3>{editingId ? "Edit Vehicle" : "Add New Vehicle"}</h3>
            {error && <p className="error-text">{error}</p>}
            <input name="name" placeholder="Name (e.g. Activa 6G)" value={form.name} onChange={handleChange} required />
            <input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} required />
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="Scooty">Scooty</option><option value="Bike">Bike</option><option value="Car">Car</option>
            </select>
            <select name="fuelType" value={form.fuelType} onChange={handleChange}>
              <option value="Petrol">Petrol</option><option value="Diesel">Diesel</option><option value="Electric">Electric</option><option value="CNG">CNG</option>
            </select>
            <input name="pricePerHour" type="number" placeholder="Price per Hour" value={form.pricePerHour} onChange={handleChange} required />
            <input name="pricePerDay" type="number" placeholder="Price per Day" value={form.pricePerDay} onChange={handleChange} required />
            <input name="location" placeholder="Location (e.g. Vijay Nagar, Indore)" value={form.location} onChange={handleChange} required />
            <input name="seats" type="number" placeholder="Seats" value={form.seats} onChange={handleChange} />

            <label style={{ fontSize: "0.85rem", color: "var(--gray)" }}>Vehicle Images (multiple, cloud upload)</label>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
            {uploading && <p className="info-text">Uploading images...</p>}
            {form.images.length > 0 && (
              <div className="image-preview-row">
                {form.images.map((img) => (
                  <div className="image-preview-thumb" key={img}>
                    <img src={img} alt="preview" />
                    <button type="button" className="remove-img-btn" onClick={() => removeImage(img)}>✕</button>
                  </div>
                ))}
              </div>
            )}

            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
            <div className="form-actions">
              <button type="submit" className="btn-primary">{editingId ? "Update" : "Add Vehicle"}</button>
              {editingId && <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>}
            </div>
          </form>

          <div className="admin-list">
            {vehicles.map((v) => (
              <div className="admin-list-item" key={v._id}>
                {v.imageUrl && <img src={v.imageUrl} alt={v.name} className="admin-list-thumb" />}
                <div>
                  <h4>{v.name} <span className="tag">{v.type}</span></h4>
                  <p>{v.brand} • ₹{v.pricePerHour}/hr • ₹{v.pricePerDay}/day • {v.location}</p>
                  <p>{v.available ? "✅ Available" : "🚫 Booked"} {v.images?.length > 0 && `• ${v.images.length} photo(s)`}</p>
                </div>
                <div className="form-actions">
                  <button className="btn-secondary" onClick={() => handleEdit(v)}>Edit</button>
                  <button className="btn-danger" onClick={() => handleDelete(v._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "bookings" && (
        <div className="booking-list">
          {bookings.length === 0 && <p className="info-text">No bookings yet.</p>}
          {bookings.map((b) => (
            <div className="booking-item" key={b._id}>
              <div>
                <h4>{b.vehicle?.name} ({b.vehicle?.type})</h4>
                <p>Customer: {b.user?.name} • {b.user?.phone}</p>
                <p>{new Date(b.startTime).toLocaleString()} → {new Date(b.endTime).toLocaleString()}</p>
                <p>Total: ₹{b.totalPrice} • Payment: <strong>{b.paymentStatus}</strong> {b.verified && "• ✅ Checked-in"}</p>
              </div>
              <select value={b.status} onChange={(e) => handleStatusChange(b._id, e.target.value)}>
                <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
              </select>
            </div>
          ))}
        </div>
      )}

      {tab === "coupons" && (
        <div className="admin-grid">
          <form className="admin-form" onSubmit={handleCouponSubmit}>
            <h3>Add New Coupon</h3>
            {couponError && <p className="error-text">{couponError}</p>}
            <input name="code" placeholder="Code (e.g. FIRST50)" value={couponForm.code} onChange={handleCouponChange} required />
            <input name="discountPercent" type="number" placeholder="Discount %" value={couponForm.discountPercent} onChange={handleCouponChange} required />
            <input name="minAmount" type="number" placeholder="Minimum Booking Amount" value={couponForm.minAmount} onChange={handleCouponChange} />
            <div className="form-actions"><button type="submit" className="btn-primary">Add Coupon</button></div>
          </form>

          <div className="admin-list">
            {coupons.length === 0 && <p className="info-text">No coupons yet.</p>}
            {coupons.map((c) => (
              <div className="admin-list-item" key={c._id}>
                <div>
                  <h4>{c.code} <span className="tag">{c.discountPercent}% off</span></h4>
                  <p>Min amount: ₹{c.minAmount} • {c.active ? "✅ Active" : "🚫 Inactive"}</p>
                </div>
                <button className="btn-danger" onClick={() => handleCouponDelete(c._id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "analytics" && (
        <div className="analytics-wrap">
          {!stats ? <p className="info-text">Loading...</p> : (
            <>
              <div className="analytics-grid">
                <div className="stat-card"><h3>₹{stats.totalRevenue}</h3><p>Total Revenue</p></div>
                <div className="stat-card"><h3>{stats.totalBookings}</h3><p>Total Bookings</p></div>
                <div className="stat-card"><h3>{stats.totalVehicles}</h3><p>Total Vehicles</p></div>
                <div className="stat-card"><h3>{stats.totalUsers}</h3><p>Registered Users</p></div>
                <div className="stat-card"><h3>{stats.bookingsThisMonth}</h3><p>Bookings This Month</p></div>
              </div>

              <h3 className="section-title" style={{ margin: "30px auto 14px" }}>Booking Status Breakdown</h3>
              <div className="status-breakdown">
                {Object.entries(stats.bookingsByStatus).map(([status, count]) => (
                  <div className="status-bar-row" key={status}>
                    <span className="status-bar-label">{status}</span>
                    <div className="status-bar-track">
                      <div className={`status-bar-fill ${status}`} style={{ width: `${stats.totalBookings ? (count / stats.totalBookings) * 100 : 0}%` }} />
                    </div>
                    <span className="status-bar-count">{count}</span>
                  </div>
                ))}
              </div>

              <h3 className="section-title" style={{ margin: "30px auto 14px" }}>Top Vehicles</h3>
              <div className="admin-list">
                {stats.topVehicles.length === 0 && <p className="info-text">No confirmed bookings yet.</p>}
                {stats.topVehicles.map((v, i) => (
                  <div className="admin-list-item" key={i}>
                    <div><h4>{v.name} <span className="tag">{v.type}</span></h4><p>{v.bookingCount} bookings • ₹{v.revenue} revenue</p></div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tab === "tickets" && (
        <div className="admin-grid">
          <div className="admin-list">
            <h3 style={{ marginBottom: "10px" }}>All Tickets</h3>
            {tickets.length === 0 && <p className="info-text">No tickets yet.</p>}
            {tickets.map((t) => (
              <div className="admin-list-item" key={t._id} style={{ cursor: "pointer" }} onClick={() => openTicket(t._id)}>
                <div>
                  <h4>{t.subject} <span className="tag">{t.category}</span></h4>
                  <p>{t.user?.name} • {t.user?.email} • {t.messages?.length} message(s)</p>
                </div>
                <span className={`status-badge ${ticketStatusColor[t.status]}`}>{t.status}</span>
              </div>
            ))}
          </div>

          {activeTicket ? (
            <div className="ticket-thread">
              <div className="ticket-thread-header">
                <h3>{activeTicket.subject}</h3>
                <select value={activeTicket.status} onChange={(e) => handleTicketStatus(e.target.value)}>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="ticket-messages">
                {activeTicket.messages.map((m, i) => (
                  <div key={i} className={`ticket-msg ${m.sender === "admin" ? "from-admin" : "from-user"}`}>
                    <strong>{m.sender === "admin" ? "You (Support)" : m.senderName || activeTicket.user?.name}</strong>
                    <p>{m.text}</p>
                    <span className="ticket-msg-time">{new Date(m.createdAt).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <div className="ticket-reply-box">
                <textarea placeholder="Write a reply..." value={ticketReply} onChange={(e) => setTicketReply(e.target.value)} />
                <button className="btn-primary" onClick={handleTicketReply}>Send Reply</button>
              </div>
            </div>
          ) : (
            <p className="info-text">Select a ticket to reply.</p>
          )}
        </div>
      )}

      {tab === "verify" && (
        <div className="verify-page" style={{ padding: "0 20px" }}>
          <div className="verify-card">
            <h3>Manual QR / Code Check-in</h3>
            <p className="info-text">Scan the customer's QR code and copy the token from the link that opens, or paste the QR content directly here.</p>
            <div className="coupon-row">
              <input placeholder="QR token / verification code" value={verifyToken} onChange={(e) => setVerifyToken(e.target.value)} />
              <button className="btn-secondary" onClick={handleLookupToken}>Lookup</button>
            </div>
            {verifyError && <p className="error-text">{verifyError}</p>}
            {verifyInfo && (
              <div style={{ marginTop: "14px" }}>
                <h4>{verifyInfo.vehicleName} <span className="tag">{verifyInfo.vehicleType}</span></h4>
                <p><strong>Customer:</strong> {verifyInfo.customerName} • {verifyInfo.customerPhone}</p>
                <p><strong>Duration:</strong> {new Date(verifyInfo.startTime).toLocaleString("en-IN")} → {new Date(verifyInfo.endTime).toLocaleString("en-IN")}</p>
                <p><strong>Payment:</strong> {verifyInfo.paymentStatus} • <strong>Status:</strong> {verifyInfo.status}</p>
                {verifyInfo.verified ? (
                  <p className="success-text">✅ Already checked-in</p>
                ) : (
                  <button className="btn-primary full-width" onClick={handleMarkVerified} disabled={verifying}>
                    {verifying ? "Verifying..." : "✅ Mark as Verified / Check-in"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
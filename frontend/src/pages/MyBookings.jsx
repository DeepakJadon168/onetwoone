import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const SUPPORT_PHONE = "+919294689832";
const SUPPORT_PHONE_DISPLAY = "+91 92946 89832";

const statusColor = { pending: "status-pending", confirmed: "status-confirmed", completed: "status-completed", cancelled: "status-cancelled" };
const paymentColor = { pending: "status-pending", paid: "status-completed", failed: "status-cancelled", refunded: "status-confirmed" };

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewedBookingIds, setReviewedBookingIds] = useState([]);
  const [msg, setMsg] = useState("");
  const [payingId, setPayingId] = useState(null);
  const [qrMap, setQrMap] = useState({}); // bookingId -> qr data url
  const [waLinkMap, setWaLinkMap] = useState({}); // bookingId -> wa.me link

  const fetchBookings = async () => {
    try {
      const { data } = await api.get("/bookings/my");
      setBookings(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Could not cancel the booking");
    }
  };

  const buildWhatsAppMessage = (b) => (
    `✅ Booking Confirmed - One To One Rental\n` +
    `Vehicle: ${b.vehicle?.name} (${b.vehicle?.type})\n` +
    `Pickup: ${b.vehicle?.location}\n` +
    `Start: ${new Date(b.startTime).toLocaleString("en-IN")}\n` +
    `End: ${new Date(b.endTime).toLocaleString("en-IN")}\n` +
    `Amount Paid: ₹${b.totalPrice}\n` +
    `Booking ID: ${b._id}`
  );

  const handlePayNow = async (booking) => {
    setPayingId(booking._id);
    try {
      const { data: order } = await api.post("/payments/create-order", { bookingId: booking._id });
      if (!window.Razorpay) {
        alert("Payment gateway failed to load. Please refresh the page and try again.");
        setPayingId(null);
        return;
      }
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "One To One Car & Bike Rental",
        description: `${booking.vehicle?.name || "Vehicle"} booking`,
        order_id: order.orderId,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: "#0f9d58" },
        handler: async (response) => {
          try {
            const { data: verifyData } = await api.post("/payments/verify", {
              bookingId: booking._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setQrMap((prev) => ({ ...prev, [booking._id]: verifyData.qrCodeDataUrl }));
            setWaLinkMap((prev) => ({ ...prev, [booking._id]: verifyData.whatsappLink }));
            setMsg("✅ Payment successful, your booking is confirmed!");
            fetchBookings();
          } catch (err) {
            alert(err.response?.data?.message || "Payment could not be verified");
          } finally {
            setPayingId(null);
          }
        },
        modal: { ondismiss: () => setPayingId(null) },
      });
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.message || "Could not start the payment");
      setPayingId(null);
    }
  };

  const handleShowQR = async (booking) => {
    if (qrMap[booking._id]) {
      setQrMap((prev) => { const copy = { ...prev }; delete copy[booking._id]; return copy; });
      return;
    }
    try {
      const { data } = await api.get(`/bookings/${booking._id}/qr`);
      setQrMap((prev) => ({ ...prev, [booking._id]: data.qrCodeDataUrl }));
      setWaLinkMap((prev) => ({ ...prev, [booking._id]: `https://wa.me/?text=${encodeURIComponent(buildWhatsAppMessage(booking))}` }));
    } catch (err) {
      alert(err.response?.data?.message || "Could not load the QR code");
    }
  };

  const submitReview = async (bookingId) => {
    setMsg("");
    try {
      await api.post("/reviews", { bookingId, rating: reviewRating, comment: reviewComment });
      setReviewedBookingIds((prev) => [...prev, bookingId]);
      setReviewingId(null);
      setReviewComment("");
      setReviewRating(5);
      setMsg("Thank you, your review has been submitted! 🙌");
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not submit the review");
    }
  };

  if (loading) return <p className="info-text">Loading...</p>;

  return (
    <div>
      <h2 className="page-title">My Bookings</h2>
      {msg && <p className="success-text" style={{ maxWidth: "1100px", margin: "0 auto 10px", padding: "0 20px" }}>{msg}</p>}
      {bookings.length === 0 ? (
        <p className="info-text">You haven't made any bookings yet.</p>
      ) : (
        <div className="booking-list">
          {bookings.map((b) => (
            <div className="booking-item" key={b._id} style={{ flexDirection: "column", alignItems: "stretch" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", width: "100%" }}>
                <div>
                  <h4>{b.vehicle?.name} ({b.vehicle?.type})</h4>
                  <p>📍 {b.vehicle?.location}</p>
                  <p>{new Date(b.startTime).toLocaleString()} → {new Date(b.endTime).toLocaleString()}</p>
                  <p>
                    Total: ₹{b.totalPrice}
                    {b.discountAmount > 0 && <span style={{ color: "var(--primary)" }}> (₹{b.discountAmount} saved with {b.couponCode})</span>}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
                  <span className={`status-badge ${statusColor[b.status]}`}>{b.status}</span>
                  <span className={`status-badge ${paymentColor[b.paymentStatus] || "status-pending"}`}>payment: {b.paymentStatus}</span>
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: "10px" }}>
                {b.paymentStatus === "pending" && ["pending", "confirmed"].includes(b.status) && (
                  <button className="btn-primary" onClick={() => handlePayNow(b)} disabled={payingId === b._id}>
                    {payingId === b._id ? "Processing..." : "💳 Pay Now"}
                  </button>
                )}
                {b.paymentStatus === "paid" && (
                  <button className="btn-secondary" onClick={() => handleShowQR(b)}>
                    {qrMap[b._id] ? "Hide QR" : "📱 Show QR / Verification Code"}
                  </button>
                )}
                {["pending", "confirmed"].includes(b.status) && (
                  <button className="btn-danger" onClick={() => handleCancel(b._id)}>Cancel Booking</button>
                )}
                {b.status === "completed" && !reviewedBookingIds.includes(b._id) && reviewingId !== b._id && (
                  <button className="btn-secondary" onClick={() => setReviewingId(b._id)}>Leave a Review</button>
                )}
                {b.status === "completed" && reviewedBookingIds.includes(b._id) && (
                  <span className="success-text">✅ Review submitted</span>
                )}
              </div>

              {b.paymentStatus === "pending" && ["pending", "confirmed"].includes(b.status) && (
                <a className="call-support-link" href={`tel:${SUPPORT_PHONE}`}>
                  📞 Prefer to pay over a call? Reach us at {SUPPORT_PHONE_DISPLAY}
                </a>
              )}

              {qrMap[b._id] && (
                <div className="qr-wrap">
                  <img src={qrMap[b._id]} alt="Booking QR" />
                  <p className="info-text">Show this QR code to the staff at pickup.</p>
                  {waLinkMap[b._id] && (
                    <a className="btn-primary" href={waLinkMap[b._id]} target="_blank" rel="noopener noreferrer">
                      💬 Share via WhatsApp
                    </a>
                  )}
                </div>
              )}

              {reviewingId === b._id && (
                <div className="review-form">
                  <label>Rating</label>
                  <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))}>
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
                  </select>
                  <textarea placeholder="Share your experience..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
                  <div className="form-actions">
                    <button className="btn-primary" onClick={() => submitReview(b._id)}>Submit Review</button>
                    <button className="btn-secondary" onClick={() => setReviewingId(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;

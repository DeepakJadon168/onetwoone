import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import StarRating from "../components/StarRating";

const SUPPORT_PHONE = "+919294689832";
const SUPPORT_PHONE_DISPLAY = "+91 92946 89832";

const VehicleDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [note, setNote] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [payingBooking, setPayingBooking] = useState(null); // booking waiting for payment
  const [paying, setPaying] = useState(false);
  const [successData, setSuccessData] = useState(null); // { qrCodeDataUrl, whatsappLink, booking }

  useEffect(() => {
    const fetchVehicle = async () => {
      const { data } = await api.get(`/vehicles/${id}`);
      setVehicle(data);
    };
    const fetchReviews = async () => {
      const { data } = await api.get(`/reviews/vehicle/${id}`);
      setReviews(data);
    };
    fetchVehicle();
    fetchReviews();
  }, [id]);

  const handleApplyCoupon = async () => {
    setCouponMsg("");
    setCouponDiscount(0);
    if (!couponCode) return;
    try {
      const { data } = await api.post("/coupons/validate", {
        code: couponCode,
        amount: vehicle.pricePerDay,
      });
      setCouponDiscount(data.discountPercent);
      setCouponMsg(`✅ Coupon applied! You get ${data.discountPercent}% off.`);
    } catch (err) {
      setCouponMsg(err.response?.data?.message || "Invalid coupon");
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSuccessData(null);
    if (!user) { navigate("/login"); return; }

    try {
      const { data } = await api.post("/bookings", {
        vehicleId: id,
        startTime,
        endTime,
        customerNote: note,
        couponCode: couponCode || undefined,
      });
      const savedMsg = data.discountAmount > 0 ? ` You saved ₹${data.discountAmount} with the coupon!` : "";
      setMessage(`Booking created! Please complete the payment to confirm it.${savedMsg}`);
      setPayingBooking(data);
      setCouponCode("");
      setCouponMsg("");
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed. Please try again.");
    }
  };

  const handlePayNow = async () => {
    if (!payingBooking) return;
    setPaying(true);
    setError("");
    try {
      const { data: order } = await api.post("/payments/create-order", { bookingId: payingBooking._id });

      if (!window.Razorpay) {
        setError("Payment gateway failed to load. Please check your internet connection and refresh the page.");
        setPaying(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "One To One Car & Bike Rental",
        description: `${vehicle.name} booking`,
        order_id: order.orderId,
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: "#0f9d58" },
        handler: async (response) => {
          try {
            const { data: verifyData } = await api.post("/payments/verify", {
              bookingId: payingBooking._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setSuccessData(verifyData);
            setPayingBooking(null);
            setMessage("");
          } catch (err) {
            setError(err.response?.data?.message || "Payment could not be verified.");
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || "Could not start the payment. Please try again.");
      setPaying(false);
    }
  };

  if (!vehicle) return <p className="info-text">Loading...</p>;

  const gallery = vehicle.images?.length > 0 ? vehicle.images : (vehicle.imageUrl ? [vehicle.imageUrl] : []);

  return (
    <div className="details-page">
      <div className="details-image">
        {gallery.length > 0 ? (
          <img src={gallery[activeImage] || gallery[0]} alt={vehicle.name} />
        ) : (
          <span className="emoji-placeholder large">
            {vehicle.type === "Car" ? "🚗" : vehicle.type === "Bike" ? "🏍️" : "🛵"}
          </span>
        )}
        {gallery.length > 1 && (
          <div className="thumb-row">
            {gallery.map((img, i) => (
              <img
                key={img + i}
                src={img}
                alt={`${vehicle.name} ${i + 1}`}
                className={`thumb ${i === activeImage ? "active" : ""}`}
                onClick={() => setActiveImage(i)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="details-info">
        <h2>{vehicle.name}</h2>
        <p className="brand-text">{vehicle.brand} • {vehicle.type} • {vehicle.fuelType} • {vehicle.seats} Seats</p>
        <StarRating rating={vehicle.rating} numReviews={vehicle.numReviews} />
        <p className="location-text">📍 {vehicle.location}</p>
        <p>{vehicle.description}</p>

        {vehicle.features?.length > 0 && (
          <div className="feature-tags">
            {vehicle.features.map((f) => <span key={f} className="feature-tag">✓ {f}</span>)}
          </div>
        )}

        <div className="price-row large">
          <span>₹{vehicle.pricePerHour} / hour</span>
          <span>₹{vehicle.pricePerDay} / day</span>
        </div>

        {!vehicle.available && <p className="error-text">This vehicle is currently unavailable. Please check back later.</p>}

        {successData && (
          <div className="payment-success-box">
            <h3>✅ Booking Confirmed!</h3>
            <p>Payment successful. A confirmation email has been sent (if SMTP is configured).</p>
            <div className="qr-wrap">
              <img src={successData.qrCodeDataUrl} alt="Booking QR" />
              <p className="info-text">Show this QR code at pickup for verification.</p>
            </div>
            <div className="form-actions">
              <a className="btn-primary" href={successData.whatsappLink} target="_blank" rel="noopener noreferrer">
                💬 Send via WhatsApp
              </a>
              <button className="btn-secondary" onClick={() => navigate("/my-bookings")}>View My Bookings</button>
            </div>
            <a className="call-support-link" href={`tel:${SUPPORT_PHONE}`}>
              📞 Need help? Call us directly at {SUPPORT_PHONE_DISPLAY}
            </a>
          </div>
        )}

        {!successData && vehicle.available && (
          <form className="booking-form" onSubmit={handleBooking}>
            <h3>Book This Vehicle</h3>
            {error && <p className="error-text">{error}</p>}
            {message && <p className="success-text">{message}</p>}

            {!payingBooking && (
              <>
                <label>Start Time</label>
                <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                <label>End Time</label>
                <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                <label>Note (optional)</label>
                <textarea placeholder="Any special request..." value={note} onChange={(e) => setNote(e.target.value)} />
                <label>Coupon Code (optional)</label>
                <div className="coupon-row">
                  <input type="text" placeholder="e.g. FIRST50" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
                  <button type="button" className="btn-secondary" onClick={handleApplyCoupon}>Apply</button>
                </div>
                {couponMsg && <p className={couponDiscount > 0 ? "success-text" : "error-text"}>{couponMsg}</p>}
                <button type="submit" className="btn-primary full-width">
                  {user ? "Book Now" : "Login to Book"}
                </button>
              </>
            )}

            {payingBooking && (
              <div className="pay-now-box">
                <p>Total Amount: <strong>₹{payingBooking.totalPrice}</strong></p>
                <button type="button" className="btn-primary full-width" onClick={handlePayNow} disabled={paying}>
                  {paying ? "Processing..." : "💳 Pay Now & Confirm Booking"}
                </button>
                <a className="call-support-link" href={`tel:${SUPPORT_PHONE}`}>
                  📞 Prefer to book over a call? Reach us at {SUPPORT_PHONE_DISPLAY}
                </a>
              </div>
            )}
          </form>
        )}

        <div className="reviews-section">
          <h3>Reviews ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <p className="info-text">No reviews yet. You can leave one after your booking is completed.</p>
          ) : (
            <div className="reviews-list">
              {reviews.map((r) => (
                <div className="review-item" key={r._id}>
                  <div className="review-item-top">
                    <strong>{r.user?.name || "User"}</strong>
                    <StarRating rating={r.rating} numReviews={null} />
                  </div>
                  {r.comment && <p>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;

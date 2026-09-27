import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const VerifyBooking = () => {
  const { token } = useParams();
  const { user } = useAuth();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedMsg, setVerifiedMsg] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get(`/bookings/verify/${token}`);
      setInfo(data);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired QR code");
    }
  };

  useEffect(() => { load(); }, [token]);

  const handleVerify = async () => {
    setVerifying(true);
    setError("");
    try {
      const { data } = await api.post(`/bookings/verify/${token}`);
      setVerifiedMsg(data.message);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not verify");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="verify-page">
      <h2 className="page-title">Booking Verification</h2>
      {error && <p className="error-text" style={{ textAlign: "center" }}>{error}</p>}
      {verifiedMsg && <p className="success-text" style={{ textAlign: "center" }}>{verifiedMsg}</p>}

      {info && (
        <div className="verify-card">
          <h3>{info.vehicleName} <span className="tag">{info.vehicleType}</span></h3>
          <p>📍 {info.location}</p>
          <p><strong>Customer:</strong> {info.customerName} • {info.customerPhone}</p>
          <p><strong>Duration:</strong> {new Date(info.startTime).toLocaleString("en-IN")} → {new Date(info.endTime).toLocaleString("en-IN")}</p>
          <p><strong>Booking Status:</strong> {info.status}</p>
          <p><strong>Payment:</strong> {info.paymentStatus}</p>

          {info.verified ? (
            <p className="success-text">✅ Already verified at {new Date(info.verifiedAt).toLocaleString("en-IN")}</p>
          ) : (
            <>
              {!user && <p className="info-text">Please log in with an admin account to mark the check-in.</p>}
              {user && user.role !== "admin" && <p className="info-text">Only admin/staff accounts can mark check-in.</p>}
              {user?.role === "admin" && (
                <button className="btn-primary full-width" onClick={handleVerify} disabled={verifying}>
                  {verifying ? "Verifying..." : "✅ Mark as Verified / Check-in"}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyBooking;

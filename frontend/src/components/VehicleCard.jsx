import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

const placeholderImg = { Scooty: "🛵", Bike: "🏍️", Car: "🚗" };

const VehicleCard = ({ vehicle }) => {
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const saved = isWishlisted(vehicle._id);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    await toggleWishlist(vehicle._id);
  };

  return (
    <div className="vehicle-card">
      <div className="vehicle-card-image">
        {vehicle.imageUrl ? (
          <img src={vehicle.imageUrl} alt={vehicle.name} loading="lazy" />
        ) : (
          <span className="emoji-placeholder">{placeholderImg[vehicle.type] || "🚘"}</span>
        )}
        {!vehicle.available && <span className="badge-unavailable">Booked</span>}
        <span className="badge-type">{vehicle.type}</span>
        {user && (
          <button className={`wishlist-btn ${saved ? "active" : ""}`} onClick={handleWishlist} aria-label="Wishlist" type="button">
            {saved ? "❤️" : "🤍"}
          </button>
        )}
      </div>
      <div className="vehicle-card-body">
        <div className="card-title-row"><h3>{vehicle.name}</h3></div>
        <p className="brand-text">{vehicle.brand} • {vehicle.fuelType}</p>
        <StarRating rating={vehicle.rating} numReviews={vehicle.numReviews} />
        <p className="location-text">📍 {vehicle.location}</p>
        {vehicle.features?.length > 0 && (
          <div className="feature-tags">
            {vehicle.features.slice(0, 2).map((f) => <span key={f} className="feature-tag">{f}</span>)}
          </div>
        )}
        <div className="price-row">
          <span>₹{vehicle.pricePerHour}/hr</span>
          <span>₹{vehicle.pricePerDay}/day</span>
        </div>
        <Link to={`/vehicle/${vehicle._id}`} className="btn-primary full-width">View & Book</Link>
      </div>
    </div>
  );
};

export default VehicleCard;
import { useEffect, useState } from "react";
import api from "../api/axios";
import VehicleCard from "../components/VehicleCard";

const Wishlist = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data } = await api.get("/users/wishlist");
        setVehicles(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  if (loading) return <p className="info-text">Loading...</p>;

  return (
    <div>
      <h2 className="page-title">My Wishlist</h2>
      {vehicles.length === 0 ? (
        <p className="info-text">You haven't saved any vehicles to your wishlist yet.</p>
      ) : (
        <div className="vehicle-grid" style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 20px 30px" }}>
          {vehicles.map((v) => (
            <VehicleCard key={v._id} vehicle={v} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
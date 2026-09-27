import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  const loadWishlist = async () => {
    if (!user) { setWishlist([]); return; }
    try {
      const { data } = await api.get("/users/wishlist");
      setWishlist(data.map((v) => v._id));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    loadWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggleWishlist = async (vehicleId) => {
    if (!user) return false;
    const { data } = await api.post(`/users/wishlist/${vehicleId}`);
    setWishlist(data.wishlist.map((id) => id.toString()));
    return data.added;
  };

  const isWishlisted = (vehicleId) => wishlist.includes(vehicleId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, loadWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
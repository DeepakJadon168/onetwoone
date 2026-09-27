import { useEffect, useState } from "react";
import api from "../api/axios";
import VehicleCard from "../components/VehicleCard";
import neeluPhoto from "../assets/neelu-awasthi.jpg";
import deepakPhoto from "../assets/deepak-singh-jadon.png";

const testimonials = [
  {
    name: "Rahul Sharma",
    text: "Super smooth experience — got my Activa instantly and it was in great condition. I'll definitely be renting from here again.",
    role: "College Student, Vijay Nagar",
  },
  {
    name: "Priya Verma",
    text: "Rented a Royal Enfield for a weekend trip — the bike was in mint condition and the team was really helpful throughout.",
    role: "Working Professional, Palasia",
  },
  {
    name: "Aman Khan",
    text: "Rented a Creta for a family trip. On-time delivery and fair pricing. Highly recommended!",
    role: "Business Owner, Rajwada",
  },
];

const howItWorks = [
  { icon: "🔍", title: "Choose a Vehicle", text: "Scooty, Bike or Car — pick whatever suits you from our listings." },
  { icon: "🗓️", title: "Set Your Date & Time", text: "Book by the hour or by the day, whichever works best for you." },
  { icon: "✅", title: "Instant Confirmation", text: "We confirm your booking right away and deliver the vehicle to your location." },
  { icon: "🚀", title: "Start Riding", text: "Hop on and enjoy a completely hassle-free ride!" },
];

const Home = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (locationFilter) params.location = locationFilter;
      const { data } = await api.get("/vehicles", { params });
      setVehicles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchVehicles();
  };

  const scrollToListing = () => {
    document.getElementById("listing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">📍 Indore's Trusted Rental Service</span>
          <h1>Rent a Scooty, Bike or Car — <span>One To One</span></h1>
          <p>Hourly or daily plans, zero deposit hassle, with doorstep delivery.</p>
          <div className="hero-actions">
            <button className="btn-primary btn-lg" onClick={scrollToListing}>Browse Vehicles</button>
            <a href="#how-it-works" className="btn-outline-light">How It Works</a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-bar">
        <div className="stat-item"><h3>500+</h3><p>Happy Customers</p></div>
        <div className="stat-item"><h3>10+</h3><p>Vehicles Available</p></div>
        <div className="stat-item"><h3>4.7★</h3><p>Average Rating</p></div>
        <div className="stat-item"><h3>24/7</h3><p>Support</p></div>
      </section>

      {/* FILTER + LISTING */}
      <div id="listing">
        <h2 className="section-title">Choose Your Ride</h2>
        <form className="filter-bar" onSubmit={handleFilter}>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="Scooty">Scooty</option>
            <option value="Bike">Bike</option>
            <option value="Car">Car</option>
          </select>
          <input
            type="text"
            placeholder="Area (e.g. Vijay Nagar)"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
          <button type="submit" className="btn-primary">Search</button>
        </form>

        {loading ? (
          <p className="info-text">Loading vehicles...</p>
        ) : vehicles.length === 0 ? (
          <p className="info-text">No vehicles found. Try changing the filters.</p>
        ) : (
          <div className="vehicle-grid">
            {vehicles.map((v) => (
              <VehicleCard key={v._id} vehicle={v} />
            ))}
          </div>
        )}
      </div>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-grid">
          {howItWorks.map((s, i) => (
            <div className="step-card" key={s.title}>
              <span className="step-icon">{s.icon}</span>
              <h4>{i + 1}. {s.title}</h4>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="why-us">
        <h2 className="section-title">Why Choose Us</h2>
        <div className="why-grid">
          <div className="why-item"><span>💰</span><div><h4>Best Prices</h4><p>Indore's most fair rental rates, with absolutely no hidden charges.</p></div></div>
          <div className="why-item"><span>🛠️</span><div><h4>Well Maintained</h4><p>Every vehicle is serviced and safety-checked before it's handed over.</p></div></div>
          <div className="why-item"><span>🚚</span><div><h4>Doorstep Delivery</h4><p>Vehicle delivered to and picked up from your location, hassle-free.</p></div></div>
          <div className="why-item"><span>📞</span><div><h4>24/7 Support</h4><p>Our team is always available, whenever you need us.</p></div></div>
        </div>
      </section>

      {/* FOUNDERS */}
      <section className="founders">
        <h2 className="section-title">Our Team</h2>
        <div className="founders-grid">
          <div className="founder-card">
            <div className="founder-avatar">
              <img src={neeluPhoto} alt="Mr. Neelu Awasthi" />
            </div>
            <h4>Mr. Neelu Awasthi</h4>
            <span>Founder</span>
          </div>
          <div className="founder-card">
            <div className="founder-avatar">
              <img src={deepakPhoto} alt="Mr. Deepak Singh Jadon" />
            </div>
            <h4>Mr. Deepak Singh Jadon</h4>
            <span>Co-Founder</span>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <h2 className="section-title">What Our Customers Say</h2>
        <div className="testimonial-grid">
          {testimonials.map((t) => (
            <div className="testimonial-card" key={t.name}>
              <p className="quote">"{t.text}"</p>
              <h4>{t.name}</h4>
              <span>{t.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <h2>Ready for your next ride?</h2>
        <p>Book now and explore Indore your way.</p>
        <button className="btn-primary btn-lg" onClick={scrollToListing}>Book Now</button>
      </section>
    </div>
  );
};

export default Home;

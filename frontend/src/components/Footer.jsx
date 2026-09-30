import logo from "../assets/one-to-one-logo.jpg";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h4 className="footer-brand"><img src={logo} alt="One To One Car & Bike Rental" className="footer-logo" /></h4>
          <p className="footer-sub">One-to-one deals on every ride — Scooty, Bike & Car rentals in Indore.</p>
          <p className="footer-founders"><b>Founder:</b> Mr. Neelu Awasthi</p>
          <p className="footer-founders"><b>Co-Founder:</b> Mr. Deepak Singh Jadon</p>
        </div>
        <div className="footer-contact">
          <p>📞 +91 89594 96650 </p>
          <p>📞 +91 92946 89832 </p>
          <p>✉️ deepakjadon137@gmail.com</p>
          <p>📍 Bhanwarkua Square, Indore, MP</p>
        </div>
      </div>
      <p className="footer-bottom">© {new Date().getFullYear()} One To One Car & Bike Rental. All rights reserved.</p>
    </footer>
  );
};

export default Footer;

const StarRating = ({ rating = 0, numReviews }) => {
  const full = Math.round(rating);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= full ? "star filled" : "star"}>★</span>
      ))}
      <span className="rating-number">{rating?.toFixed(1)}</span>
      {typeof numReviews === "number" && (
        <span className="rating-count">({numReviews} reviews)</span>
      )}
    </div>
  );
};

export default StarRating;

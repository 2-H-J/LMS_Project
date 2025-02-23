import React from 'react';
import '../css/StarRating.css';

export default function StarRating({ rateCount, setRateCount }) {
    return (
        <div className="star-rating">
            {[...Array(5)].map((_, index) => (
                <img
                    key={index}
                    src={`/img/${index < rateCount ? "rate-star-1.png" : "rate-star-2.png"}`}
                    alt={index < rateCount ? "filled star" : "empty star"}
                    className="star-icon"
                    onClick={() => setRateCount(index + 1)}
                />
            ))}
        </div>
    );
}
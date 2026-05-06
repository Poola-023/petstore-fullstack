import React, { useState, useEffect } from 'react';

const ReviewSection = ({ targetId, type = "PET" }) => { // type can be 'PET' or 'VENDOR'
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState('');
    const [rating, setRating] = useState(5);

    // Replace with your API endpoint
    const API_BASE = `http://${window.location.hostname}:8090/api/reviews`;

    useEffect(() => {
        // Fetch reviews
        // fetch(`${API_BASE}/${type}/${targetId}`).then(res => res.json()).then(setReviews);

        // Mock Data for display purposes
        setReviews([
            { id: 1, user: "Sarah M.", rating: 5, comment: "Absolutely wonderful experience! The pet was exactly as described and very healthy.", date: "2 days ago" },
            { id: 2, user: "Raj K.", rating: 4, comment: "Great communication from the boutique.", date: "1 week ago" }
        ]);
    }, [targetId, type]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newReview.trim()) return;

        const reviewData = {
            id: Date.now(),
            user: "You", // In reality, get from Context/LocalStorage
            rating: rating,
            comment: newReview,
            date: "Just now"
        };

        // POST to backend here
        setReviews([reviewData, ...reviews]);
        setNewReview('');
        setRating(5);
    };

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>Customer Reviews & Ratings</h3>

            {/* Review Form */}
            <form style={styles.formCard} onSubmit={handleSubmit}>
                <h4 style={styles.formTitle}>Leave a Review</h4>

                <div style={styles.starSelector}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <span
                            key={star}
                            onClick={() => setRating(star)}
                            style={{...styles.star, color: star <= rating ? '#F59E0B' : '#EAEAEA'}}
                        >
                            ★
                        </span>
                    ))}
                </div>

                <textarea
                    style={styles.textarea}
                    placeholder="Share your experience..."
                    rows="3"
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                />
                <button type="submit" style={styles.submitBtn}>Post Review</button>
            </form>

            {/* Review List */}
            <div style={styles.reviewList}>
                {reviews.map(review => (
                    <div key={review.id} style={styles.reviewCard}>
                        <div style={styles.reviewHeader}>
                            <div style={styles.reviewerInfo}>
                                <div style={styles.avatar}>{review.user.charAt(0)}</div>
                                <div>
                                    <h4 style={styles.reviewerName}>{review.user}</h4>
                                    <p style={styles.reviewDate}>{review.date}</p>
                                </div>
                            </div>
                            <div style={styles.starsDisplay}>
                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                            </div>
                        </div>
                        <p style={styles.reviewText}>{review.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: { marginTop: '40px', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    title: { fontSize: '1.5rem', fontWeight: '900', color: '#131921', marginBottom: '20px', borderBottom: '2px solid #EAEAEA', paddingBottom: '10px' },

    formCard: { backgroundColor: '#FAFAFA', padding: '25px', borderRadius: '20px', marginBottom: '30px', border: '1px solid #EAEAEA' },
    formTitle: { margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: '800', color: '#131921' },
    starSelector: { display: 'flex', gap: '5px', marginBottom: '15px', fontSize: '1.8rem', cursor: 'pointer' },
    star: { transition: 'color 0.2s' },
    textarea: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', marginBottom: '15px' },
    submitBtn: { padding: '12px 25px', backgroundColor: '#131921', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' },

    reviewList: { display: 'flex', flexDirection: 'column', gap: '20px' },
    reviewCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '20px', border: '1px solid #EAEAEA', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' },
    reviewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' },
    reviewerInfo: { display: 'flex', gap: '15px', alignItems: 'center' },
    avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FF9900', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem' },
    reviewerName: { margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#131921' },
    reviewDate: { margin: 0, fontSize: '0.8rem', color: '#9CA3AF', fontWeight: '600' },
    starsDisplay: { color: '#F59E0B', fontSize: '1.2rem', letterSpacing: '2px' },
    reviewText: { margin: 0, color: '#4B5563', fontSize: '0.95rem', lineHeight: '1.6', fontWeight: '500' }
};

export default ReviewSection;
import React, { useState, useEffect } from 'react';
import API_BASE from '../config';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import SubFooter from './SubFooter';

const PetDetails = ({ user, setUser, addToCart, cart }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [pet, setPet] = useState(null);
    const [relatedPets, setRelatedPets] = useState([]);
    const [reviews, setReviews] = useState([]);

    // Track selected gender
    const [selectedGender, setSelectedGender] = useState('');

    // ✨ NEW STATES: Review Form
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(5);
    const [submittingReview, setSubmittingReview] = useState(false);

    const [loading, setLoading] = useState(true);
    const [isAdded, setIsAdded] = useState(false);

    const currentUserId = user?.userId || user?.id;

    const formatDate = (dateString) => {
        if (!dateString) return "Unknown";
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const calculateAge = (dobString) => {
        if (!dobString) return "Unknown";
        const dob = new Date(dobString);
        const today = new Date();
        if (isNaN(dob.getTime())) return "Unknown";

        let months = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
        let days = today.getDate() - dob.getDate();

        if (days < 0) {
            months--;
            const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            days += prevMonth.getDate();
        }
        if (months < 0) return "Just born";
        let ageStr = [];
        if (months > 0) ageStr.push(`${months} Month${months > 1 ? 's' : ''}`);
        if (days > 0) ageStr.push(`${days} Day${days > 1 ? 's' : ''}`);
        return ageStr.length > 0 ? ageStr.join(', ') : "Born today";
    };

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = `
            .btn-hover { transition: all 0.3s ease; }
            .btn-hover:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(6, 78, 59, 0.2); }
            .card-hover { transition: all 0.3s ease; }
            .card-hover:hover { transform: translateY(-6px); box-shadow: 0 15px 35px rgba(0,0,0,0.08); border-color: #E5E7EB; }
        `;
        document.head.appendChild(styleSheet);
    }, []);

    useEffect(() => {
        if (!user) {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try { setUser(JSON.parse(savedUser)); }
                catch (e) { console.error("Session parse error"); }
            }
        }

        const fetchPetData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://${window.location.hostname}:8090/api/pets/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setPet(data);

                    const alreadyInCart = cart && cart.some(item => String(item.id) === String(id));
                    setIsAdded(alreadyInCart);

                    try {
                        const relatedRes = await fetch(`http://${window.location.hostname}:8090/api/pets/${id}/related`);
                        if (relatedRes.ok) setRelatedPets(await relatedRes.json());
                    } catch (relatedErr) { console.error("Error fetching related pets"); }

                    try {
                        const reviewRes = await fetch(`http://${window.location.hostname}:8090/api/reviews/pet/${id}`);
                        if (reviewRes.ok) setReviews(await reviewRes.json());
                    } catch (reviewErr) { console.error("Error fetching reviews"); }
                }
            } catch (err) {
                console.error("Error fetching details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPetData();
    }, [id, cart, user, setUser]);

    const basePrice = pet?.price || 0;
    const discount = pet?.discountPercentage || 0;
    const discountedPrice = discount > 0 ? basePrice - (basePrice * (discount / 100)) : basePrice;

    const handleAdoptNow = () => {
        if (!currentUserId) return navigate('/login');
        if (parseInt(pet.quantity) <= 0) return;

        if (!selectedGender) {
            alert("Please select whether you want to adopt a Male or Female companion first!");
            return;
        }

        navigate('/checkout', {
            state: { directPurchase: true, items: [{...pet, selectedGender}], totalAmount: discountedPrice }
        });
    };

    // ✨ FIXED: Added JWT Token to Authorization Header
        const handleAddToCart = async () => {
            if (!currentUserId) return navigate('/login');
            if (isAdded || parseInt(pet.quantity) <= 0) return;

            if (!selectedGender) {
                alert("Please select whether you want to adopt a Male or Female companion first!");
                return;
            }

            const token = localStorage.getItem('token'); // Get the secure token

            try {
                const response = await fetch(`http://${window.location.hostname}:8090/api/cart/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // ✨ Unlock the Spring Boot backend
                    },
                    body: JSON.stringify({ userId: currentUserId, petId: pet.id, selectedGender: selectedGender })
                });

                if (response.ok) {
                    addToCart({...pet, selectedGender});
                    setIsAdded(true);
                } else {
                    console.error("Failed to add to cart, backend rejected the token.");
                }
            } catch (error) { console.error("Cart error:", error); }
        };

    // ✨ NEW: Handle Review Submission
    // Inside your fetchPetData function in PetDetails.js
    const handleReviewSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/reviews/pet/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // ✨ This unlocks the 403!
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        }
    };

    if (loading) return <div style={styles.loader}>Connecting to boutique...</div>;
    if (!pet) return <div style={styles.loader}>Companion not found.</div>;

    const isOutOfStock = parseInt(pet.quantity) <= 0;
    const maleQty = parseInt(pet.maleQuantity) || 0;
    const femaleQty = parseInt(pet.femaleQuantity) || 0;

    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div style={styles.page}>
            <Navbar user={user} setUser={setUser} cart={cart} />

            <div style={styles.contentWrapper}>
                <div style={styles.mainLayout}>

                    <div style={styles.imageSection}>
                        <img
                            src={pet.image ? `data:image/jpeg;base64,${pet.image}` : "https://via.placeholder.com/800"}
                            alt={pet.breed}
                            style={styles.mainImage}
                        />
                        {isOutOfStock ? (
                            <div style={{...styles.imageBadge, color: '#ef4444'}}>Out of Stock</div>
                        ) : parseInt(pet.quantity) <= 5 ? (
                            <div style={{...styles.imageBadge, color: '#FF9900'}}>Only {pet.quantity} Left</div>
                        ) : (
                            <div style={styles.imageBadge}>Certified Health Check</div>
                        )}
                    </div>

                    <div style={styles.infoSection}>
                        <header style={styles.header}>
                            <div style={styles.metaTags}>
                                <span style={styles.tagPrimary}>{pet.category}</span>
                                <span style={styles.tagSecondary}>📍 Hyderabad</span>
                            </div>
                            <h1 style={styles.petName}>{pet.breed}</h1>

                            {reviews.length > 0 && (
                                <div style={styles.avgRatingRow}>
                                    <span style={styles.avgStar}>★</span>
                                    <span style={styles.avgScore}>{avgRating}</span>
                                    <span style={styles.reviewCountText}>({reviews.length} Reviews)</span>
                                </div>
                            )}
                        </header>

                        <div style={styles.aboutSection}>
                            <h3 style={styles.sectionHeading}>About the companion</h3>

                            <div style={styles.detailsGrid}>
                                <div style={styles.detailBlock}>
                                    <p style={styles.detailLabel}>Select Gender</p>
                                    {(femaleQty === 0 && maleQty === 0) ? (
                                        <p style={{color: '#ef4444', fontWeight: 'bold'}}>Sold Out</p>
                                    ) : (
                                        <div style={styles.genderBtnGroup}>
                                            <button
                                                style={{...styles.genderBtn,
                                                    borderColor: selectedGender === 'Female' ? '#ec4899' : '#EAEAEA',
                                                    backgroundColor: selectedGender === 'Female' ? '#fdf2f8' : '#fff',
                                                    opacity: femaleQty === 0 ? 0.5 : 1,
                                                    cursor: femaleQty === 0 ? 'not-allowed' : 'pointer'
                                                }}
                                                disabled={femaleQty === 0}
                                                onClick={() => setSelectedGender('Female')}
                                            >
                                                <span style={{color: '#ec4899', fontSize: '1.2rem'}}>♀</span> Female ({femaleQty})
                                            </button>

                                            <button
                                                style={{...styles.genderBtn,
                                                    borderColor: selectedGender === 'Male' ? '#3b82f6' : '#EAEAEA',
                                                    backgroundColor: selectedGender === 'Male' ? '#eff6ff' : '#fff',
                                                    opacity: maleQty === 0 ? 0.5 : 1,
                                                    cursor: maleQty === 0 ? 'not-allowed' : 'pointer'
                                                }}
                                                disabled={maleQty === 0}
                                                onClick={() => setSelectedGender('Male')}
                                            >
                                                <span style={{color: '#3b82f6', fontSize: '1.2rem'}}>♂</span> Male ({maleQty})
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div style={styles.detailBlock}>
                                    <p style={styles.detailLabel}>Age</p>
                                    <p style={styles.detailMainValue}>{calculateAge(pet.dob)}</p>
                                    <p style={styles.detailSubText}>(Born: {formatDate(pet.dob)})</p>
                                </div>
                                <div style={styles.detailBlock}>
                                    <p style={styles.detailLabel}>Colour</p>
                                    <p style={styles.detailMainValue}>{pet.color || 'Standard'}</p>
                                </div>
                                <div style={styles.detailBlock}>
                                    <p style={styles.detailLabel}>Vaccination Status</p>
                                    <p style={styles.detailMainValue}>{pet.isVaccinated === 'yes' ? `Vaccinated` : 'Not Yet'}</p>
                                    {pet.isVaccinated === 'yes' && pet.vaccinationDose && <p style={styles.detailSubText}>({pet.vaccinationDose})</p>}
                                </div>
                            </div>

                            <div style={styles.insuranceRow}>
                                <span style={styles.shieldIcon}>🛡️</span>
                                <span>Certified Health Check & Verified Partner Boutique</span>
                            </div>
                        </div>

                        <div style={styles.storySection}>
                            <h3 style={styles.sectionHeading}>The Bio</h3>
                            <p style={styles.descText}>
                                {pet.description || `Connect with our verified boutique partner to learn more. This beautiful ${pet.color ? pet.color.toLowerCase() : ''} ${pet.breed} is looking for a loving forever home.`}
                            </p>
                        </div>

                        <div style={styles.actionCard}>
                            <div style={{...styles.pricingHighlightBox, backgroundColor: discount > 0 ? '#ECFDF5' : '#F9FAFB', borderColor: discount > 0 ? '#A7F3D0' : '#EAEAEA'}}>
                                <p style={styles.priceLabel}>Adoption Fee</p>
                                <div style={styles.priceRow}>
                                    {discount > 0 && <span style={styles.oldPrice}>₹{basePrice.toLocaleString('en-IN')}</span>}
                                    <span style={{...styles.priceValue, color: discount > 0 ? '#059669' : '#111827'}}>₹{discountedPrice.toLocaleString('en-IN')}</span>
                                    {discount > 0 && <span style={styles.discountBadge}>{discount}% OFF</span>}
                                </div>
                                {discount > 0 && <p style={styles.savingsText}>✨ You save ₹{(basePrice - discountedPrice).toLocaleString('en-IN')} today!</p>}
                            </div>

                            <div style={styles.actionRow}>
                                <button style={isAdded || isOutOfStock ? styles.addedBtn : styles.cartBtn} onClick={handleAddToCart} disabled={isAdded || isOutOfStock} className={!isAdded && !isOutOfStock ? "btn-hover" : ""}>
                                    {isOutOfStock ? "Out of Stock" : (isAdded ? "✓ In your bag" : "Add to Bag")}
                                </button>
                                <button style={{...styles.buyBtn, backgroundColor: isOutOfStock ? '#EAEAEA' : '#064E3B', color: isOutOfStock ? '#9CA3AF' : '#FFF', cursor: isOutOfStock ? 'not-allowed' : 'pointer'}} onClick={handleAdoptNow} disabled={isOutOfStock} className={!isOutOfStock ? "btn-hover" : ""}>
                                    {isOutOfStock ? "Sold Out" : "Adopt Now"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ✨ REVIEWS SECTION */}
                <div style={styles.reviewsSection}>
                    <h2 style={styles.relatedHeader}>Guardian Reviews</h2>

                    {/* ✨ NEW: Leave a Review Form */}
                    <div style={styles.reviewFormCard}>
                        <h4 style={styles.reviewFormTitle}>Share your experience</h4>
                        <form onSubmit={handleReviewSubmit}>
                            <div style={styles.starSelector}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <span
                                        key={star}
                                        onClick={() => setRating(star)}
                                        style={{...styles.star, color: star <= rating ? '#FFB800' : '#EAEAEA'}}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <textarea
                                style={styles.textarea}
                                placeholder="Tell others about your experience adopting this companion..."
                                rows="3"
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                            />
                            <div style={styles.submitRow}>
                                <button type="submit" style={styles.submitReviewBtn} disabled={submittingReview}>
                                    {submittingReview ? 'Posting...' : 'Post Review'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {reviews.length === 0 ? (
                        <div style={styles.noReviewsBox}>
                            <p style={styles.noReviewsText}>There are no reviews for this companion yet. Be the first!</p>
                        </div>
                    ) : (
                        <div style={styles.reviewsGrid}>
                            {reviews.map((review) => {
                                const guardianName = review.userName || 'Valued Guardian';
                                const initial = guardianName.charAt(0).toUpperCase();

                                return (
                                    <div key={review.id} style={styles.reviewCard}>
                                        <div style={styles.reviewHeader}>

                                            <div style={styles.reviewerInfo}>
                                                <div style={styles.reviewerAvatar}>{initial}</div>
                                                <div>
                                                    <h4 style={styles.reviewerName}>{guardianName}</h4>
                                                    <div style={styles.reviewStars}>
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <span key={star} style={{color: star <= review.rating ? '#FFB800' : '#EAEAEA', fontSize: '0.9rem'}}>★</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <span style={styles.reviewDate}>
                                                {new Date(review.reviewDate).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <p style={styles.reviewBio}>"{review.bio}"</p>

                                        {review.image && (
                                            <div style={styles.reviewImgWrapper}>
                                                <img src={`data:image/jpeg;base64,${review.image}`} alt="Guardian Upload" style={styles.reviewImg} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
            <SubFooter user={user} setUser={setUser} cart={cart} />
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#FFFFFF', minHeight: '100vh', fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" },
    contentWrapper: { padding: '50px 6%', maxWidth: '1400px', margin: '0 auto' },
    mainLayout: { display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '70px', alignItems: 'start' },
    imageSection: { width: '100%', position: 'relative' },
    mainImage: { width: '100%', height: '700px', objectFit: 'cover', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.08)' },
    imageBadge: { position: 'absolute', top: '25px', left: '25px', backgroundColor: 'rgba(255,255,255,0.95)', padding: '12px 24px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '900', backdropFilter: 'blur(10px)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', color: '#064E3B' },
    infoSection: { padding: '10px 0', display: 'flex', flexDirection: 'column' },
    header: { marginBottom: '35px' },
    metaTags: { display: 'flex', gap: '10px', marginBottom: '15px' },
    tagPrimary: { backgroundColor: '#ECFDF5', color: '#059669', padding: '6px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' },
    tagSecondary: { backgroundColor: '#F3F4F6', color: '#4B5563', padding: '6px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700' },
    petName: { fontSize: '3.2rem', fontWeight: '900', color: '#064E3B', margin: '0 0 5px 0', lineHeight: 1.1, letterSpacing: '-1px' },
    locationText: { fontSize: '1.15rem', color: '#6B7280', fontWeight: '600', margin: 0 },
    avgRatingRow: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' },
    avgStar: { color: '#FFB800', fontSize: '1.2rem' },
    avgScore: { fontWeight: '800', fontSize: '1.1rem', color: '#131921' },
    reviewCountText: { color: '#6B7280', fontSize: '0.9rem', fontWeight: '600' },
    aboutSection: { marginBottom: '35px' },
    sectionHeading: { fontSize: '1.4rem', fontWeight: '800', color: '#064E3B', marginBottom: '20px' },
    detailsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '25px' },
    detailBlock: { backgroundColor: '#FAFAFA', padding: '20px', borderRadius: '16px', border: '1px solid #EAEAEA' },
    detailLabel: { fontSize: '0.9rem', color: '#064E3B', fontWeight: '800', margin: '0 0 12px 0', paddingBottom: '8px', borderBottom: '2px solid #F3F4F6' },
    detailMainValue: { fontSize: '1.15rem', color: '#111827', margin: '0 0 4px 0', fontWeight: '700' },
    detailSubText: { fontSize: '0.85rem', color: '#6B7280', margin: 0, fontWeight: '500' },

    genderBtnGroup: { display: 'flex', gap: '10px', marginTop: '10px' },
    genderBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '12px', border: '2px solid', fontWeight: '700', fontSize: '0.95rem', transition: 'all 0.2s' },

    insuranceRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 20px', backgroundColor: '#F0FDF4', borderRadius: '12px', border: '1px solid #DCFCE7', color: '#064E3B', fontWeight: '600', fontSize: '0.95rem' },
    shieldIcon: { fontSize: '1.3rem' },
    storySection: { marginBottom: '40px' },
    descText: { fontSize: '1.05rem', color: '#4B5563', lineHeight: '1.8' },
    actionCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #EAEAEA', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' },
    pricingHighlightBox: { padding: '20px 25px', borderRadius: '16px', border: '1px solid', marginBottom: '25px' },
    priceLabel: { fontSize: '1rem', color: '#4B5563', fontWeight: '700', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' },
    priceRow: { display: 'flex', alignItems: 'flex-end', gap: '15px' },
    oldPrice: { fontSize: '1.4rem', color: '#9CA3AF', textDecoration: 'line-through', fontWeight: '700', paddingBottom: '5px' },
    priceValue: { fontSize: '3.2rem', fontWeight: '900', margin: 0, lineHeight: 1, letterSpacing: '-1px' },
    discountBadge: { backgroundColor: '#059669', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800', marginBottom: '8px' },
    savingsText: { color: '#059669', fontSize: '0.95rem', fontWeight: '700', margin: '12px 0 0 0' },
    actionRow: { display: 'flex', gap: '15px' },
    cartBtn: { flex: 1, padding: '18px', borderRadius: '14px', backgroundColor: '#fff', border: '2px solid #064E3B', color: '#064E3B', fontWeight: '800', fontSize: '1.05rem', cursor: 'pointer' },
    addedBtn: { flex: 1, padding: '18px', borderRadius: '14px', backgroundColor: '#F3F4F6', border: '2px solid #E5E7EB', color: '#9CA3AF', fontWeight: '800', fontSize: '1.05rem', cursor: 'default' },
    buyBtn: { flex: 1, padding: '18px', borderRadius: '14px', border: 'none', fontWeight: '800', fontSize: '1.05rem' },

    // ✨ REVIEWS SECTION STYLES
    reviewsSection: { marginTop: '80px', paddingTop: '50px', borderTop: '2px solid #EAEAEA' },
    relatedHeader: { fontSize: '1.8rem', fontWeight: '900', color: '#064E3B', marginBottom: '30px' },

    reviewFormCard: { backgroundColor: '#FAFAFA', padding: '30px', borderRadius: '20px', border: '1px solid #EAEAEA', marginBottom: '40px' },
    reviewFormTitle: { margin: '0 0 15px 0', fontSize: '1.2rem', fontWeight: '800', color: '#064E3B' },
    starSelector: { display: 'flex', gap: '8px', marginBottom: '20px', fontSize: '2rem', cursor: 'pointer' },
    star: { transition: 'color 0.2s', userSelect: 'none' },
    textarea: { width: '100%', padding: '18px', borderRadius: '14px', border: '1px solid #D1D5DB', fontSize: '1rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', marginBottom: '20px', transition: 'border-color 0.2s' },
    submitRow: { display: 'flex', justifyContent: 'flex-end' },
    submitReviewBtn: { padding: '14px 30px', backgroundColor: '#064E3B', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s' },

    noReviewsBox: { backgroundColor: '#F9FAFB', padding: '40px', borderRadius: '20px', border: '1px dashed #EAEAEA', textAlign: 'center' },
    noReviewsText: { color: '#6B7280', fontSize: '1.1rem', fontWeight: '600', margin: 0 },
    reviewsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' },
    reviewCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '20px', border: '1px solid #EAEAEA', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' },
    reviewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' },
    reviewerInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
    reviewerAvatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem' },
    reviewerName: { margin: '0 0 3px 0', fontSize: '0.95rem', fontWeight: '800', color: '#131921' },
    reviewStars: { display: 'flex', gap: '2px' },
    reviewDate: { fontSize: '0.85rem', color: '#9CA3AF', fontWeight: '600', marginTop: '5px' },
    reviewBio: { fontSize: '0.95rem', color: '#374151', lineHeight: '1.6', margin: '0 0 20px 0', fontStyle: 'italic' },
    reviewImgWrapper: { width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden' },
    reviewImg: { width: '100%', height: '100%', objectFit: 'cover' },
    loader: { textAlign: 'center', padding: '150px', fontSize: '1.2rem', fontWeight: '900', color: '#064E3B' }
};

export default PetDetails;
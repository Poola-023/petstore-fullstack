import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const PublishStory = ({ user, setUser, cart }) => {
    const { petId } = useParams();
    const navigate = useNavigate();

    const [petName, setPetName] = useState('');
    const [storyContent, setStoryContent] = useState('');
    const [imageUrl, setImageUrl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchPet = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`http://${window.location.hostname}:8090/api/pets/${petId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setPetName(data.breed || data.name);
                }
            } catch (err) { console.error("Pet fetch failed"); }
        };
        if (petId) fetchPet();
    }, [petId]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImageUrl(reader.result.split(',')[1]);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!token) {
            alert("Security Error: No token found. Please login again.");
            return navigate('/login');
        }

        setIsSubmitting(true);

        const payload = {
            userId: user.userId || user.id,
            username: user.username || user.firstName,
            petId: petId,
            petName: petName,
            storyContent: storyContent,
            imageUrl: imageUrl,
            likes: 0
        };

        try {
             const res = await fetch(`http://localhost:8090/api/stories/add`, {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json',
                     'Authorization': `Bearer ${token}`
                 },
                 body: JSON.stringify(payload)
             });

            if (res.ok) {
                alert("✨ Story published successfully!");
                navigate('/success-stories');
            } else {
                alert(`Error ${res.status}: Check backend logs.`);
            }
        } catch (err) {
            alert("Connection to server failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.page}>
            <Navbar user={user} setUser={setUser} cart={cart} />

            <div style={styles.container}>
                <div style={styles.formCard}>
                    <header style={styles.formHeader}>
                        <h1 style={styles.title}>Share <span style={{color: '#FF9900'}}>{petName}'s</span> Story</h1>
                        <p style={styles.subtitle}>Document your journey and inspire the community.</p>
                    </header>

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.inputSection}>
                            <label style={styles.label}>Your Soulful Journey</label>
                            <textarea
                                style={styles.textarea}
                                placeholder="Describe the moment you met, their personality, or how they've changed your life..."
                                value={storyContent}
                                onChange={(e) => setStoryContent(e.target.value)}
                                required
                            />
                        </div>

                        <div style={styles.inputSection}>
                            <label style={styles.label}>Upload a Photo</label>
                            <div style={styles.uploadBox}>
                                <input type="file" accept="image/*" onChange={handleImageChange} style={styles.fileInput} />
                                {imageUrl && (
                                    <div style={styles.previewContainer}>
                                        <img src={`data:image/jpeg;base64,${imageUrl}`} alt="Preview" style={styles.previewImg} />
                                        <p style={styles.previewText}>Photo Preview</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button type="submit" style={styles.submitBtn} disabled={isSubmitting}>
                            {isSubmitting ? 'Publishing...' : 'Publish to Community Chronicles'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const styles = {

    page: {
        backgroundColor: '#F8FAFC',
        minHeight: '100vh',
        margin: 0,        // ✨ Ensure no margin
        display: 'flex',
        flexDirection: 'column'
    },


    container: { maxWidth: '850px', margin: '0 auto', padding: '40px 20px' },
    formCard: {
        backgroundColor: '#fff',
        padding: '50px',
        borderRadius: '35px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.04)',
        border: '1px solid #F1F5F9'
    },
    formHeader: { textAlign: 'center', marginBottom: '40px' },
    title: { fontSize: '2.5rem', fontWeight: '900', color: '#131921', marginBottom: '10px' },
    subtitle: { color: '#64748B', fontSize: '1.1rem', fontWeight: '500' },

    form: { display: 'flex', flexDirection: 'column', gap: '30px' },
    inputSection: { display: 'flex', flexDirection: 'column', gap: '12px' },
    label: { fontWeight: '800', fontSize: '0.9rem', color: '#131921', textTransform: 'uppercase', letterSpacing: '0.5px' },

    textarea: {
        padding: '20px',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        height: '220px',
        fontSize: '1.05rem',
        outline: 'none',
        fontFamily: 'inherit',
        lineHeight: '1.6',
        transition: '0.3s border-color'
    },

    uploadBox: {
        padding: '30px',
        border: '2px dashed #E2E8F0',
        borderRadius: '25px',
        textAlign: 'center',
        backgroundColor: '#F9FAFB'
    },
    fileInput: { marginBottom: '20px' },

    previewContainer: { marginTop: '10px', textAlign: 'center' },
    previewImg: { width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '15px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' },
    previewText: { fontSize: '0.8rem', color: '#94A3B8', marginTop: '8px', fontWeight: '700' },

    submitBtn: {
        padding: '20px',
        backgroundColor: '#131921',
        color: '#fff',
        border: 'none',
        borderRadius: '20px',
        fontWeight: '900',
        fontSize: '1.1rem',
        cursor: 'pointer',
        boxShadow: '0 10px 30px rgba(19, 25, 33, 0.2)',
        transition: '0.2s transform'
    }
};

export default PublishStory;
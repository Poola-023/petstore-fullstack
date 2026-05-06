import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const GrowthJournal = ({ user, setUser, cart }) => {
    const { petId } = useParams();
    const navigate = useNavigate();

    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [newEntry, setNewEntry] = useState({
        title: '',
        description: '',
        weight: '',
        image: null
    });

    const API_BASE = `http://${window.location.hostname}:8090/api/journal`;

    // ✨ FETCH TIMELINE
    const fetchTimeline = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/${petId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setEntries(data);
            }
        } catch (err) {
            console.error("Timeline sync failed");
        } finally {
            setLoading(false);
        }
    }, [petId, API_BASE]);

    useEffect(() => {
        if (!user) navigate('/login');
        fetchTimeline();
    }, [user, navigate, fetchTimeline]);

    // ✨ IMAGE HANDLER
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewEntry({ ...newEntry, image: reader.result.split(',')[1] });
            };
            reader.readAsDataURL(file);
        }
    };

    // ✨ SAVE MILESTONE
    const handleSaveEntry = async (e) => {
        e.preventDefault();
        const payload = {
            ...newEntry,
            petId: petId,
            userId: user.userId || user.id,
            entryDate: new Date().toISOString()
        };

        try {
            const res = await fetch(`${API_BASE}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowForm(false);
                setNewEntry({ title: '', description: '', weight: '', image: null });
                fetchTimeline(); // Refresh list
            }
        } catch (err) {
            alert("Cloud sync failed.");
        }
    };

    // ✨ DELETE MILESTONE
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this memory forever?")) return;

        try {
            const res = await fetch(`${API_BASE}/delete/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (res.ok) {
                setEntries(prev => prev.filter(entry => entry.id !== id));
            }
        } catch (err) {
            alert("Delete failed.");
        }
    };

    return (
        <div style={styles.page}>
            <Navbar user={user} setUser={setUser} cart={cart} />

            <div style={styles.hero}>
                <h1 style={styles.title}>Growth <span style={{color: '#FF9900'}}>Journal</span></h1>
                <p style={styles.subtitle}>Documenting every soulful pawprint on the timeline of life.</p>
            </div>

            <div style={styles.container}>
                <div style={styles.actionRow}>
                    <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
                        {showForm ? '✕ Close Form' : '+ New Milestone'}
                    </button>
                </div>

                {showForm && (
                    <div style={styles.formCard}>
                        <h3 style={{margin: '0 0 20px 0'}}>Capture a Moment</h3>
                        <form onSubmit={handleSaveEntry}>
                            <input
                                style={styles.input}
                                placeholder="Milestone Title (e.g. First Hike)"
                                value={newEntry.title}
                                onChange={e => setNewEntry({...newEntry, title: e.target.value})}
                                required
                            />
                            <textarea
                                style={styles.textarea}
                                placeholder="What made this moment special?"
                                value={newEntry.description}
                                onChange={e => setNewEntry({...newEntry, description: e.target.value})}
                                required
                            />
                            <div style={{display: 'flex', gap: '15px', marginBottom: '15px'}}>
                                <input
                                    style={{...styles.input, marginBottom: 0}}
                                    type="number"
                                    step="0.1"
                                    placeholder="Weight (kg)"
                                    value={newEntry.weight}
                                    onChange={e => setNewEntry({...newEntry, weight: e.target.value})}
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={styles.fileInput}
                                />
                            </div>
                            <button type="submit" style={styles.saveBtn}>Save to Timeline</button>
                        </form>
                    </div>
                )}

                <div style={styles.timelineContainer}>
                    {loading ? (
                        <p style={styles.empty}>Syncing records...</p>
                    ) : entries.length === 0 ? (
                        <div style={styles.emptyBox}>
                            <span style={{fontSize: '3rem'}}>📸</span>
                            <p>No milestones logged yet. Start the journey!</p>
                        </div>
                    ) : (
                        entries.map((entry, index) => (
                            <div key={entry.id} style={styles.timelineItem}>
                                <div style={styles.marker}></div>
                                <div style={styles.card}>
                                    <div style={styles.cardHeader}>
                                        <span style={styles.dateText}>
                                            {new Date(entry.entryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                        <button style={styles.deleteBtn} onClick={() => handleDelete(entry.id)}>🗑️</button>
                                    </div>

                                    {entry.image && (
                                        <img
                                            src={`data:image/jpeg;base64,${entry.image}`}
                                            alt="milestone"
                                            style={styles.entryImg}
                                        />
                                    )}

                                    <div style={styles.cardBody}>
                                        <h4 style={styles.entryTitle}>{entry.title}</h4>
                                        <p style={styles.entryDesc}>{entry.description}</p>
                                        {entry.weight && (
                                            <div style={styles.weightBadge}>⚖️ {entry.weight} kg</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    hero: { backgroundColor: '#131921', padding: '100px 20px 60px 20px', textAlign: 'center', color: '#fff' },
    title: { fontSize: '2.8rem', fontWeight: '900', margin: 0 },
    subtitle: { color: '#94A3B8', marginTop: '10px' },

    container: { padding: '40px 5%', maxWidth: '800px', margin: '0 auto' },
    actionRow: { display: 'flex', justifyContent: 'center', marginBottom: '40px' },
    addBtn: { backgroundColor: '#FF9900', color: '#131921', border: 'none', padding: '14px 30px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 20px rgba(255,153,0,0.2)' },

    formCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '30px', border: '1px solid #E2E8F0', marginBottom: '50px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' },
    input: { width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #E2E8F0', height: '120px', outline: 'none', boxSizing: 'border-box' },
    fileInput: { alignSelf: 'center', fontSize: '0.8rem' },
    saveBtn: { backgroundColor: '#131921', color: '#fff', width: '100%', padding: '15px', borderRadius: '12px', fontWeight: '800', border: 'none', cursor: 'pointer' },

    timelineContainer: { borderLeft: '3px dashed #E2E8F0', paddingLeft: '40px', marginLeft: '20px' },
    timelineItem: { position: 'relative', marginBottom: '50px' },
    marker: { position: 'absolute', left: '-49.5px', top: '20px', width: '16px', height: '16px', backgroundColor: '#FF9900', borderRadius: '50%', border: '4px solid #fff', boxShadow: '0 0 10px rgba(255,153,0,0.4)' },

    card: { backgroundColor: '#fff', borderRadius: '25px', overflow: 'hidden', border: '1px solid #F1F5F9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' },
    cardHeader: { padding: '15px 20px', backgroundColor: '#F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    dateText: { fontSize: '0.75rem', fontWeight: '800', color: '#64748B' },
    deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 },

    entryImg: { width: '100%', maxHeight: '350px', objectFit: 'cover' },
    cardBody: { padding: '25px' },
    entryTitle: { margin: '0 0 10px 0', fontSize: '1.3rem', fontWeight: '900', color: '#131921' },
    entryDesc: { margin: 0, color: '#4B5563', lineHeight: '1.6' },
    weightBadge: { display: 'inline-block', marginTop: '15px', padding: '6px 15px', backgroundColor: '#F0FDF4', color: '#166534', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '700' },

    emptyBox: { textAlign: 'center', padding: '60px', color: '#94A3B8' }
};

export default GrowthJournal;
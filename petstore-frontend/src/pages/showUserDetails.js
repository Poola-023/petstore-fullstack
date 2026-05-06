import React, { useEffect, useState } from 'react';

const ShowUserDetails = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8090/api/users/all')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Connection Error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.headerCard}>
        <h1 style={styles.title}>🐾 Usha Pet Store</h1>
        <p style={styles.subtitle}>User Management Dashboard</p>
      </div>

      {/* Table Container */}
      <div style={styles.tableWrapper}>
        {loading ? (
          <div style={styles.loader}>Fetching latest user data...</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>USER ID</th>
                <th style={styles.th}>USERNAME</th>
                <th style={styles.th}>CONTACT NUMBER</th>
                <th style={styles.th}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={styles.tr}>
                  <td style={styles.tdId}>#{user.id}</td>
                  <td style={styles.tdName}>{user.username}</td>
                  <td style={styles.tdPhone}>{user.phoneNumber}</td>
                  <td style={styles.td}>
                    <span style={styles.statusBadge}>Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Modern UI Styles
const styles = {
  container: {
    padding: '40px 20px',
    backgroundColor: '#f4f7f9',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  headerCard: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    margin: 0,
    fontSize: '2.5rem',
    color: '#2c3e50',
    fontWeight: '700',
  },
  subtitle: {
    color: '#7f8c8d',
    fontSize: '1.1rem',
    marginTop: '5px',
  },
  tableWrapper: {
    maxWidth: '1000px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  theadRow: {
    backgroundColor: '#2c3e50',
    color: '#ffffff',
  },
  th: {
    padding: '18px 20px',
    textAlign: 'left',
    fontSize: '0.85rem',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid #edf2f7',
    transition: 'background-color 0.2s ease',
  },
  tdId: {
    padding: '20px',
    color: '#3498db',
    fontWeight: 'bold',
  },
  tdName: {
    padding: '20px',
    color: '#2c3e50',
    fontWeight: '600',
  },
  tdPhone: {
    padding: '20px',
    color: '#5a67d8',
  },
  td: {
    padding: '20px',
  },
  statusBadge: {
    backgroundColor: '#c6f6d5',
    color: '#22543d',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  loader: {
    padding: '50px',
    textAlign: 'center',
    color: '#718096',
  }
};

export default ShowUserDetails;
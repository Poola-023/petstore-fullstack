import React, { useState } from 'react';

const MfaSetup = ({ user }) => {
    const [qrUrl, setQrUrl] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);

    const generateQr = async () => {
        const res = await fetch(`http://localhost:8080/api/users/setup-mfa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: user.phoneNumber })
        });
        const data = await res.json();
        setQrUrl(data.qrCodeUrl);
        setStep(2);
    };

    const verifyAndEnable = async () => {
        const res = await fetch(`http://localhost:8080/api/users/confirm-mfa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: user.phoneNumber, otp })
        });
        if (res.ok) alert("Security Updated!");
    };

    return (
        <div style={styles.card}>
            {step === 1 ? (
                <button onClick={generateQr} style={styles.btn}>Enable App Authentication</button>
            ) : (
                <div>
                    <h3>Scan this QR Code</h3>
                    <img src={qrUrl} alt="QR Code" style={{margin: '20px'}} />
                    <p>Enter the 6-digit code from your app:</p>
                    <input
                        type="text"
                        maxLength="6"
                        onChange={(e) => setOtp(e.target.value)}
                        style={styles.input}
                    />
                    <button onClick={verifyAndEnable} style={styles.btn}>Verify & Link App</button>
                </div>
            )}
        </div>
    );
};

const styles = {
    card: { padding: '30px', textAlign: 'center', background: '#fff', borderRadius: '15px' },
    btn: { padding: '12px 24px', backgroundColor: '#FF9900', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    input: { display: 'block', margin: '10px auto', padding: '10px', width: '150px', textAlign: 'center', fontSize: '1.2rem' }
};

export default MfaSetup;
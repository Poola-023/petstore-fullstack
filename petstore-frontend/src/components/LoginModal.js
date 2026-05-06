import React, { useState } from 'react';
import API from '../services/api';

const LoginModal = ({ onLoginSuccess, onClose }) => {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);

    const handleSendOtp = async () => {
        try {
            await API.post('/generate-otp', { phoneNumber: phone });
            setStep(2);
        } catch (err) { alert("Error sending OTP"); }
    };

    const handleVerify = async () => {
        try {
            const res = await API.post('/verify-otp', { phoneNumber: phone, otp });
            onLoginSuccess(res.data);
        } catch (err) { alert("Invalid OTP"); }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h3>{step === 1 ? "Login / Sign Up" : "Verify OTP"}</h3>
                {step === 1 ? (
                    <>
                        <input type="text" placeholder="Phone Number" style={styles.input} onChange={(e) => setPhone(e.target.value)} />
                        <button style={styles.btn} onClick={handleSendOtp}>Generate OTP</button>
                    </>
                ) : (
                    <>
                        <input type="text" placeholder="Enter 6-digit OTP" style={styles.input} onChange={(e) => setOtp(e.target.value)} />
                        <button style={styles.btn} onClick={handleVerify}>Verify & Login</button>
                    </>
                )}
                <button onClick={onClose} style={{marginTop: '10px', background: 'none', border: 'none', color: 'gray'}}>Cancel</button>
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    modal: { background: 'white', padding: '30px', borderRadius: '10px', textAlign: 'center', width: '300px' },
    input: { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc' },
    btn: { width: '100%', padding: '10px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default LoginModal;
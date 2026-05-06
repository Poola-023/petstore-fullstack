import React, { useState, useEffect, useRef } from 'react';
import VendorSidebar from './VendorSidebar';
import { Client } from '@stomp/stompjs'; // ✨ Import STOMP
import SockJS from 'sockjs-client';     // ✨ Import SockJS

const VendorMessages = () => {
    const [vendor, setVendor] = useState(JSON.parse(localStorage.getItem('vendor')));
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const stompClient = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // ✨ Setup STOMP Client
        const socket = new SockJS(`http://${window.location.hostname}:8090/ws-chat`);
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log("Connected to Chat Room!");
                // Subscribe to the broadcast topic
                client.subscribe('/topic/messages', (message) => {
                    const incomingMessage = JSON.parse(message.body);
                    setMessages((prev) => [...prev, incomingMessage]);
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
            }
        });

        client.activate();
        stompClient.current = client;

        return () => {
            if (stompClient.current) stompClient.current.deactivate();
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !stompClient.current || !stompClient.current.connected) return;

        const messagePayload = {
            senderId: vendor.id,
            senderType: 'VENDOR',
            text: input,
            // Timestamp is handled by Spring Boot backend now
        };

        // ✨ Send message to the /app/chat endpoint mapped in Spring Boot
        stompClient.current.publish({
            destination: '/app/chat',
            body: JSON.stringify(messagePayload)
        });

        setInput('');
    };

    // ... Keep the rest of your UI and return() identical to before!

    return (
        <div style={styles.container}>
            <VendorSidebar activeTab="messages" vendor={vendor} />
            <main style={styles.main}>
                <header style={styles.header}>
                    <h1 style={styles.welcomeText}>Customer Inquiries</h1>
                    <p style={styles.dateText}>Live Chat</p>
                </header>

                <div style={styles.chatLayout}>
                    {/* Active Chat Area */}
                    <div style={styles.chatWindow}>
                        <div style={styles.chatHeader}>
                            <div style={styles.avatar}>👤</div>
                            <div>
                                <h3 style={styles.chatName}>Potential Buyer</h3>
                                <p style={styles.chatStatus}>🟢 Online</p>
                            </div>
                        </div>

                        <div style={styles.messageArea}>
                            {messages.length === 0 && <p style={styles.emptyChat}>No messages yet. Waiting for inquiries...</p>}
                            {messages.map((msg, idx) => {
                                const isMine = msg.senderType === 'VENDOR';
                                return (
                                    <div key={idx} style={{...styles.messageWrapper, justifyContent: isMine ? 'flex-end' : 'flex-start'}}>
                                        <div style={{...styles.messageBubble, backgroundColor: isMine ? '#FF9900' : '#F3F4F6', color: isMine ? '#131921' : '#131921'}}>
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={sendMessage} style={styles.inputArea}>
                            <input
                                style={styles.input}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your reply..."
                            />
                            <button type="submit" style={styles.sendBtn}>Send ➔</button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

const styles = {
    container: { display: 'flex', height: '100vh', backgroundColor: '#F9FAFB', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    main: { flex: 1, padding: '40px 50px', overflowY: 'hidden', display: 'flex', flexDirection: 'column' },
    header: { marginBottom: '20px' },
    welcomeText: { fontSize: '2rem', fontWeight: '900', color: '#131921', margin: 0 },
    dateText: { color: '#FF9900', fontSize: '0.8rem', fontWeight: '800', marginTop: '5px', letterSpacing: '0.5px', textTransform: 'uppercase' },

    chatLayout: { flex: 1, display: 'flex', gap: '20px', minHeight: 0 },
    chatWindow: { flex: 1, backgroundColor: '#fff', borderRadius: '24px', border: '1px solid #EAEAEA', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' },

    chatHeader: { padding: '20px', borderBottom: '1px solid #EAEAEA', display: 'flex', alignItems: 'center', gap: '15px' },
    avatar: { width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' },
    chatName: { margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#131921' },
    chatStatus: { margin: 0, fontSize: '0.8rem', color: '#10B981', fontWeight: '700' },

    messageArea: { flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#FAFAFA' },
    messageWrapper: { display: 'flex', marginBottom: '15px', width: '100%' },
    messageBubble: { padding: '12px 18px', borderRadius: '18px', maxWidth: '70%', fontSize: '0.95rem', fontWeight: '600', lineHeight: '1.4' },
    emptyChat: { textAlign: 'center', color: '#9CA3AF', marginTop: '50px', fontWeight: '600' },

    inputArea: { padding: '20px', backgroundColor: '#fff', borderTop: '1px solid #EAEAEA', display: 'flex', gap: '15px' },
    input: { flex: 1, padding: '15px', borderRadius: '16px', border: '1px solid #EAEAEA', outline: 'none', fontSize: '1rem', backgroundColor: '#F9FAFB', fontFamily: 'inherit' },
    sendBtn: { backgroundColor: '#131921', color: '#fff', border: 'none', padding: '0 25px', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', transition: '0.2s' }
};

export default VendorMessages;
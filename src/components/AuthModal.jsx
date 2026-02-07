import React, { useState } from 'react';
import { X, Mail, Github, Chrome } from 'lucide-react';
import './AuthModal.css';
import { supabase } from '../lib/supabaseClient';

const AuthModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            if (isSignUp) {
                // Sign Up Flow
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: window.location.origin,
                        data: {
                            full_name: email.split('@')[0]
                        }
                    }
                });

                if (error) throw error;

                // Check if email confirmation is required
                if (data?.user?.identities?.length === 0) {
                    setMessage('⚠️ This email is already registered. Please sign in instead.');
                    setTimeout(() => setIsSignUp(false), 2000);
                } else {
                    setMessage('✅ Account created! You can now sign in.');
                    setTimeout(() => {
                        setIsSignUp(false);
                        setMessage('');
                    }, 2000);
                }
            } else {
                // Sign In Flow
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;

                setMessage('✅ Welcome back! Loading your profile...');

                // Auto-close modal after successful login
                setTimeout(() => {
                    onClose();
                    setEmail('');
                    setPassword('');
                    setMessage('');
                }, 1500);
            }
        } catch (error) {
            console.error('Auth error:', error);

            // User-friendly error messages
            let errorMessage = error.message;
            if (error.message.includes('Invalid login credentials')) {
                errorMessage = '❌ Invalid email or password. Please try again.';
            } else if (error.message.includes('Email not confirmed')) {
                errorMessage = '⚠️ Please check your email and confirm your account first.';
            } else if (error.message.includes('Password should be at least')) {
                errorMessage = '❌ Password must be at least 6 characters long.';
            } else if (error.message.includes('Unable to validate email')) {
                errorMessage = '❌ Please enter a valid email address.';
            }

            setMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        setMessage(`The ${provider} link is currently being calibrated via Supabase. Please use Email/Password below.`);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content auth-modal">
                <button className="close-btn" onClick={onClose}><X size={24} /></button>

                <div className="auth-header">
                    <h2 className="gradient-text">Film4u AI {isSignUp ? 'Registration' : 'Login'}</h2>
                    <p>{isSignUp ? 'Create your cinematic identity.' : 'Welcome back to your personalized discovery engine.'}</p>
                </div>

                <form onSubmit={handleAuth} className="magic-form">
                    <div className="input-group">
                        <Mail size={18} className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder={isSignUp ? "Create Password (min 6 characters)" : "Password"}
                            style={{ paddingLeft: '1rem' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    <button type="submit" className="btn-magic" disabled={loading}>
                        {loading ? 'Processing...' : (isSignUp ? 'Create My Identity' : 'Sign In')}
                    </button>

                    {!isSignUp && (
                        <button
                            type="button"
                            onClick={async () => {
                                if (!email) {
                                    setMessage('⚠️ Please enter your email first.');
                                    return;
                                }
                                setLoading(true);
                                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                                    redirectTo: window.location.origin
                                });
                                if (error) {
                                    setMessage('❌ ' + error.message);
                                } else {
                                    setMessage('✅ Password reset email sent! Check your inbox.');
                                }
                                setLoading(false);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#888',
                                fontSize: '0.75rem',
                                marginTop: '0.5rem',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            Forgot Password?
                        </button>
                    )}

                    <p style={{ marginTop: '1rem', fontSize: '0.8rem', textAlign: 'center', color: '#888' }}>
                        {isSignUp ? 'Already have an account?' : "New to Film4u AI?"}
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-ai)', marginLeft: '5px', cursor: 'pointer', fontWeight: 700 }}
                        >
                            {isSignUp ? 'Login' : 'Create Account'}
                        </button>
                    </p>
                </form>

                <div className="divider">
                    <span>DISCOVERY ACCESS (Requires Config)</span>
                </div>

                <div className="social-buttons" style={{ opacity: 0.5 }}>
                    <button className="social-btn google" onClick={() => handleSocialLogin('google')} title="Requires Supabase OAuth setup">
                        <Chrome size={20} />
                        <span>Social Login (Offline)</span>
                    </button>
                </div>

                {message && <p className={`auth-message ${message.includes('Error') || message.includes('calibrated') ? 'error' : 'success'}`}>{message}</p>}
            </div>
        </div>
    );
};

export default AuthModal;

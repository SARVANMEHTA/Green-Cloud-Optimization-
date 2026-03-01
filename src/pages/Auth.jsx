import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                if (!name.trim()) {
                    setError('Please enter your name.');
                    setLoading(false);
                    return;
                }
                await signup(email, password, name);
            }
            navigate('/dashboard');
        } catch (err) {
            const code = err.code;
            if (code === 'auth/user-not-found') setError('No account found with this email.');
            else if (code === 'auth/wrong-password') setError('Incorrect password.');
            else if (code === 'auth/email-already-in-use') setError('This email is already registered.');
            else if (code === 'auth/weak-password') setError('Password must be at least 6 characters.');
            else if (code === 'auth/invalid-email') setError('Please enter a valid email address.');
            else if (code === 'auth/invalid-credential') setError('Invalid email or password.');
            else setError(err.message);
        }
        setLoading(false);
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="auth-logo">
                        <div className="logo-icon">☁️</div>
                        <span>Green <span className="logo-pulse">Cloud</span></span>
                    </div>
                    <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                    <p>{isLogin ? 'Sign in to monitor your pipeline emissions' : 'Join the green computing revolution'}</p>
                </div>

                {error && (
                    <div className="auth-error">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="auth-input-group">
                            <User size={18} className="auth-input-icon" />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="auth-input"
                            />
                        </div>
                    )}

                    <div className="auth-input-group">
                        <Mail size={18} className="auth-input-icon" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </div>

                    <div className="auth-input-group">
                        <Lock size={18} className="auth-input-icon" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="auth-input"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                        {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                        {!loading && <ArrowRight size={16} />}
                    </button>
                </form>

                <div className="auth-switch">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="auth-switch-btn">
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
}

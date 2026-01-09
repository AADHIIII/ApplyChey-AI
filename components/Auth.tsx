
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { type User } from 'firebase/auth';

interface AuthProps {
    onLogin: (user: User) => void;
}

const GoogleIcon: React.FC = () => (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691c2.242-4.509 6.89-7.691 12.24-7.691c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C30.654 1.716 25.761 0 20.5 0C13.67 0 7.534 3.866 4.015 9.529l2.291 5.162z" />
        <path fill="#4CAF50" d="M24 48c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238c-2.008 1.521-4.51 2.43-7.219 2.43c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 43.136 16.21 48 24 48z" />
        <path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C43.021 36.25 46 30.676 46 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            let userCredential;
            if (isLogin) {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            } else {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
            }
            onLogin(userCredential.user);
        } catch (err: any) {
            console.error(err);
            let msg = "Authentication failed.";
            if (err.code === 'auth/invalid-credential') msg = "Invalid email or password.";
            if (err.code === 'auth/email-already-in-use') msg = "That email is already registered.";
            if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
            if (err.code === 'auth/unauthorized-domain') {
                 msg = `Action Required: Add "${window.location.hostname}" to Authorized Domains in Firebase Console > Authentication > Settings.`;
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            onLogin(result.user);
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/unauthorized-domain') {
                setError(`Action Required: Add "${window.location.hostname}" to Authorized Domains in Firebase Console > Authentication > Settings.`);
            } else if (err.code === 'auth/popup-closed-by-user') {
                setError("Sign-in cancelled.");
            } else {
                setError("Google sign-in failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary/50 flex flex-col justify-center items-center p-4">
             <div className="text-center mb-10">
                <h1 className="text-5xl font-bold text-foreground font-charter">
                    ApplyChey
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">The Enterprise-Grade AI Resume Platform</p>
            </div>
            <div className="w-full max-w-md bg-card p-8 rounded-lg shadow-xl border border-border">
                <h2 className="text-2xl font-bold text-center text-card-foreground mb-1">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-center text-muted-foreground text-sm mb-6">
                    {isLogin ? 'Sign in to access your data.' : 'Get started with enterprise features.'}
                </p>

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center py-2.5 px-4 border border-input rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors mb-6 font-medium text-sm"
                >
                    <GoogleIcon />
                    Continue with Google
                </button>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-xs text-muted-foreground uppercase tracking-wide">Or continue with email</span>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                     {error && (
                        <div className="bg-destructive/10 border-l-4 border-destructive text-destructive/90 p-3 rounded-md text-sm break-words" role="alert">
                            <p className="font-semibold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full px-4 py-2 bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring transition text-foreground"
                            placeholder="name@company.com"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center">
                            <label htmlFor="password"  className="block text-sm font-medium text-muted-foreground">Password</label>
                            {isLogin && <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>}
                        </div>
                         <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full px-4 py-2 bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring transition text-foreground"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(null); }}
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
};

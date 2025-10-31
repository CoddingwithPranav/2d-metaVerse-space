import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/service/authService';
import useAuth from '@/hooks/Authhook';
import { useScrollAnimation } from '@/hooks/ScrollHook';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { AnimatedPageWrapper } from '@/components/ui/AnimatedPageWrapper';
import { avatarService } from '@/service/avatarService';

// Utility InputField component
const InputField: React.FC<{ id: string; type: string; label: string; placeholder?: string; icon?: React.ComponentType<{ className?: string; size?: number }>; value: string; onChange: (val: string) => void; disabled?: boolean }> = ({ id, type, label, placeholder, icon: Icon, value, onChange, disabled }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
    <div className="relative">
      {Icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon className="text-slate-500" size={18} /></div>}
      <input
        type={type}
        id={id}
        name={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full py-2.5 ${Icon ? 'pl-10' : 'px-3'} pr-3 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </div>
  </div>
);

const Authentication: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatars, setAvatars] = useState<any[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);

  const { saveAuthData } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const addToObserve = useScrollAnimation(0.2);

  useEffect(() => {
    if (formRef.current) addToObserve(formRef.current);
  }, [addToObserve]);

  // Fetch avatars when switching to signup mode
  useEffect(() => {
    if (!isLogin) {
      const fetchAvatars = async () => {
        try {
          const avatarList = await avatarService.list();
          setAvatars(avatarList);
        } catch (err) {
          console.error('Error fetching avatars:', err);
          setError('Failed to load avatars.');
        }
      };
      fetchAvatars();
    }
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Basic validation
    if ((!email.trim() || !password.trim()) || (!isLogin && !username.trim()) || (!isLogin && password !== confirmPassword)) {
      if (!email.trim() || !password.trim()) {
        setError('Email and password are required.');
      } else if (!isLogin && !username.trim()) {
        setError('Username is required for signup.');
      } else if (!isLogin && password !== confirmPassword) {
        setError('Passwords do not match.');
      }
      setLoading(false);
      return;
    }

    // Avatar validation for signup
    if (!isLogin && !selectedAvatarId) {
      setError('Please select an avatar.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Login flow
        const data = await authService.login(email, password);
        saveAuthData(data.token);
        navigate('/');
      } else {
        // Signup flow with avatar
        const newUser = await authService.register(email, password, selectedAvatarId!);
        if (newUser) {
          const loginData = await authService.login(email, password);
          saveAuthData(loginData.token);
          navigate('/');
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPageWrapper id="auth" className="flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900">
      <div ref={formRef} className="w-full max-w-md bg-slate-800/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-slate-700 opacity-0">
        <h2 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          {isLogin ? 'Welcome Back!' : 'Join PixelVerse'}
        </h2>
        <p className="text-center text-slate-400 mb-8">
          {isLogin ? 'Login to continue your adventure.' : 'Create an account to start exploring.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <InputField
              id="username"
              type="text"
              label="Username"
              placeholder="Choose a cool username"
              value={username}
              onChange={setUsername}
              disabled={loading}
            />
          )}
          <InputField
            id="email"
            type="email"
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
            disabled={loading}
          />
          <InputField
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
            disabled={loading}
          />
          {!isLogin && (
            <InputField
              id="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={setConfirmPassword}
              disabled={loading}
            />
          )}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Select Avatar</label>
              {avatars.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {avatars.map(avatar => (
                    <div
                      key={avatar.id}
                      onClick={() => setSelectedAvatarId(avatar.id)}
                      className={`cursor-pointer p-2 rounded-md ${selectedAvatarId === avatar.id ? 'bg-purple-500/30' : ''}`}
                    >
                      <img src={avatar.idleUrls.down} alt={avatar.name} className="w-24 h-24 object-cover rounded-md" />
                      <p className="text-center text-sm mt-1">{avatar.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">Loading avatars...</p>
              )}
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <button
            type="submit"
            className={`w-full animated-border-button rounded-md ${loading ? 'cursor-not-allowed opacity-50' : ''}`} 
            disabled={loading}
          >
            <span className="inner-content w-full py-3 text-white font-semibold">
              {loading ? 'Loading...' : isLogin ? 'Login' : 'Create Account'}
            </span>
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setSelectedAvatarId(null); // Reset avatar selection when switching
            }}
            className="ml-1 font-medium text-purple-400 hover:text-purple-300"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </AnimatedPageWrapper>
  );
};

export default Authentication;
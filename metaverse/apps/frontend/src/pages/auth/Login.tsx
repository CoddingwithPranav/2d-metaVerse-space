import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/service/authService";
import useAuth from "@/hooks/Authhook";
import { useScrollAnimation } from "@/hooks/ScrollHook";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { AnimatedPageWrapper } from "@/components/ui/AnimatedPageWrapper";
import { avatarService } from "@/service/avatarService";

const InputField: React.FC<{
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}> = ({
  id,
  type,
  label,
  placeholder,
  icon: Icon,
  value,
  onChange,
  disabled,
}) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-2"
    >
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="text-gray-400" size={18} />
        </div>
      )}
      <input
        type={type}
        id={id}
        name={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full py-2.5 ${Icon ? "pl-10" : "px-3"} pr-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-[#9ef01a] focus:border-[#9ef01a] outline-none transition-all ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      />
    </div>
  </div>
);

const Authentication: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
          console.error("Error fetching avatars:", err);
          setError("Failed to load avatars.");
        }
      };
      fetchAvatars();
    }
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    if (!isLogin && !username.trim()) {
      setError("Username is required for signup.");
      setLoading(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!isLogin && !selectedAvatarId) {
      setError("Please select an avatar.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const data = await authService.login(email, password);
        saveAuthData(data.token);
        navigate("/");
      } else {
        await authService.register(email, password, selectedAvatarId!);
        const loginData = await authService.login(email, password);
        saveAuthData(loginData.token);
        navigate("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPageWrapper
      id="auth"
      className="flex items-center justify-center bg-gray-50 min-h-screen"
    >
      <div
        ref={formRef}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200 opacity-0"
      >
        <h2 className="text-3xl font-bold text-center mb-2 text-black">
          {isLogin ? "Welcome Back!" : "Join MetaVerse"}
        </h2>
        <p className="text-center text-gray-600 mb-8">
          {isLogin
            ? "Login to continue your adventure."
            : "Create an account to start exploring."}
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
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Avatar
              </label>
              {avatars.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {avatars.map((avatar) => (
                    <div
                      key={avatar.id}
                      onClick={() => setSelectedAvatarId(avatar.id)}
                      className={`cursor-pointer p-3 rounded-lg transition-all hover:scale-105 border-2 ${
                        selectedAvatarId === avatar.id
                          ? "border-[#9ef01a] bg-[#9ef01a]/10"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <img
                        src={avatar.idleUrls.down}
                        alt={avatar.name}
                        className="w-full h-20 object-contain rounded-md mx-auto"
                      />
                      <p className="text-center text-xs mt-2 text-gray-700 font-medium">{avatar.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Loading avatars...</p>
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
            className={`w-full bg-[#9ef01a] hover:opacity-90 text-black font-semibold py-3 rounded-lg transition-all ${loading ? "cursor-not-allowed opacity-50" : ""}`}
            disabled={loading}
          >
            {loading ? "Loading..." : isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setSelectedAvatarId(null);
            }}
            className="ml-2 font-semibold text-black hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </AnimatedPageWrapper>
  );
};

export default Authentication;

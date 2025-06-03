// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
// import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
// import { AlertCircle } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { authService } from '@/service/authService';
// import { useNavigate } from 'react-router-dom';
// import useAuth from '@/utils/Authhook';

import { useScrollAnimation } from "@/utils/ScrollHook";
import { useState, useRef, useEffect } from "react";
import { AnimatedPageWrapper } from "../user/Profile";

// const Authentication: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLogin, setIsLogin] = useState(true); // true for login, false for signup
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const { saveAuthData } = useAuth();
//   const navigate = useNavigate(); // Use useNavigate here


//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null); // Clear previous errors
//     setLoading(true);

//     if (!email.trim() || !password.trim()) {
//       setError("Email and password are required.");
//       setLoading(false);
//       return;
//     }

//     try {
//       if (isLogin) {
//         // Login
//         const data = await authService.login(email, password);
//         saveAuthData(data.token);
//         navigate('/'); // Redirect to home page
//       } else {
//         // Signup
//         const newUser = await authService.register(email, password);
//         if (newUser) {
//           // Simulate login after successful signup
//           const loginData = await authService.login(email, password);
//           saveAuthData(loginData.token);
//           navigate('/'); // Redirect to home page
//           setIsLogin(true); // Switch to login mode after successful signup
//         }
//       }
//     } catch (err: any) {
//       if (err.response && err.response.data && err.response.data.message) {
//         setError(err.response.data.message);
//       } else {
//         setError("An error occurred during authentication.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <Card className="w-[350px] shadow-lg">
//         <CardHeader className="space-y-1">
//           <CardTitle className="text-2xl font-semibold text-center">
//             {isLogin ? 'Login' : 'Sign Up'}
//           </CardTitle>
//           <CardDescription className="text-center">
//             {isLogin ? 'Login to your account' : 'Create a new account'}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Input
//                 type="email"
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full"
//                 disabled={loading}
//               />
//             </div>
//             <div className="space-y-2">
//               <Input
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full"
//                 disabled={loading}
//               />
//             </div>
//             {error && (
//               <Alert variant="destructive">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertTitle>Error</AlertTitle>
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}
//             <Button
//               type="submit"
//               className={cn(
//                 "w-full",
//                 loading ? "bg-blue-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
//               )}
//               disabled={loading}
//             >
//               {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
//             </Button>
//           </form>
//           <div className="mt-4 text-center text-sm">
//             {isLogin ? (
//               <p>
//                 Don't have an account?{' '}
//                 <button
//                   onClick={() => {
//                     setIsLogin(false);
//                     setError(null); //clear error on switch
//                   }}
//                   className="text-blue-500 hover:underline"
//                 >
//                   Sign Up
//                 </button>
//               </p>
//             ) : (
//               <p>
//                 Already have an account?{' '}
//                 <button
//                   onClick={() => {
//                     setIsLogin(true);
//                     setError(null); //clear error on switch
//                   }}
//                   className="text-blue-500 hover:underline"
//                 >
//                   Login
//                 </button>
//               </p>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };




const Authentication = () => {
  const [isLogin, setIsLogin] = useState(true);
  const formRef = useRef(null);
  const addToObserve = useScrollAnimation(0.2);

  useEffect(() => {
    if(formRef.current) addToObserve(formRef.current);
  }, [addToObserve]);

  type InputFieldProps = {
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    icon?: React.ComponentType<{ className?: string; size?: number }>;
  };

  const InputField: React.FC<InputFieldProps> = ({ id, type, label, placeholder, icon: Icon }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
      <div className="relative">
        {Icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon className="text-slate-500" size={18}/></div>}
        <input 
          type={type} 
          id={id} 
          name={id}
          placeholder={placeholder}
          className={`w-full py-2.5 ${Icon ? 'pl-10' : 'px-3'} pr-3 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors`}
        />
      </div>
    </div>
  );

  return (
      <>   
    <style>{`
        .is-visible { opacity: 1 !important; transform: translateY(0) !important; }
        html { scroll-behavior: smooth; }
        @keyframes rotateBorder { 0% { --angle: 0deg; } 100% { --angle: 360deg; } }
        .animated-border-button { position: relative; display: inline-flex; align-items: center; justify-content: center; z-index: 0; padding: 2.5px; overflow: hidden; text-decoration: none; }
        .animated-border-button::before { content: ''; position: absolute; z-index: -1; top: 0; left: 0; right: 0; bottom: 0; background: conic-gradient(from var(--angle), #a855f7, #38bdf8, #ec4899, #6366f1, #a855f7); border-radius: inherit; animation: rotateBorder 3s linear infinite paused; }
        .animated-border-button:hover::before { animation-play-state: running; }
        .animated-border-button > .inner-content { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: #0f172a; transition: background-color 0.2s ease-in-out; }
        .animated-border-button.rounded-lg > .inner-content { border-radius: calc(0.5rem - 2.5px); }
        .animated-border-button.rounded-xl > .inner-content { border-radius: calc(0.75rem - 2.5px); }
        .animated-border-button.rounded-md > .inner-content { border-radius: calc(0.375rem - 2.5px); } /* For AuthPage button */
        .animated-border-button.w-full.rounded-lg > .inner-content { border-radius: calc(0.5rem - 2.5px); }
        .animated-border-button:hover > .inner-content { background-color: #1e293b; }
      `}</style>
    <AnimatedPageWrapper id="auth" className="flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900">
      <div ref={formRef} className="w-full max-w-md bg-slate-800/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-slate-700 opacity-0 transform translate-y-5">
        <h2 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          {isLogin ? 'Welcome Back!' : 'Join PixelVerse'}
        </h2>
        <p className="text-center text-slate-400 mb-8">
          {isLogin ? 'Login to continue your adventure.' : 'Create an account to start exploring.'}
        </p>

        <form className="space-y-6">
          {!isLogin && <InputField id="username" type="text" label="Username" placeholder="Choose a cool username" />}
          <InputField id="email" type="email" label="Email Address" placeholder="you@example.com" />
          <InputField id="password" type="password" label="Password" placeholder="••••••••" />
          {!isLogin && <InputField id="confirmPassword" type="password" label="Confirm Password" placeholder="••••••••" />}
          
          <button type="submit" className="w-full animated-border-button rounded-md">
            <span className="inner-content w-full py-3 text-white font-semibold">
              {isLogin ? 'Login' : 'Create Account'}
            </span>
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => setIsLogin(!isLogin)} className="ml-1 font-medium text-purple-400 hover:text-purple-300">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </AnimatedPageWrapper></>
  );
};

export default Authentication;
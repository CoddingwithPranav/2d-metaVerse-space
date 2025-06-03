// import React, { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';

// // Shadcn UI components
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

// // Corrected import path for GlitterBackground
// import UploadExample from '@/components/ui/imageupload';
// import { authService } from '@/service/authService';
// import GlitterBackground from '@/components/ui/Glittre';

// // Zod schema for profile form
// const profileFormSchema = z.object({
//   name: z.string().min(2, 'Name must be at least 2 characters.').max(50, 'Name must not be longer than 50 characters.'),
//   displayName: z.string().min(2, 'Display name must be at least 2 characters.').max(30, 'Display name must not be longer than 30 characters.'),
//   profileImage: z.string().optional(),
// });

// export type ProfileFormValues = z.infer<typeof profileFormSchema>;




// export const Profile: React.FC = () => {
//   const [user, setUser] = useState<Record<string, any> | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [isEditing, setIsEditing] = useState<boolean>(false);
//   const [imageUrl, setImageUrl] = useState<string | null>(null);

//   const form = useForm<ProfileFormValues>({
//     resolver: zodResolver(profileFormSchema),
//     defaultValues: {
//       name: '',
//       displayName: '',
//       profileImage: '',
//     },
//   });

//   // Fetch profile on mount
//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       setLoading(true);
//       try {
//         const data = await authService.profile();
//         setUser(data);
//         form.reset({
//           name: data.username || '',
//           displayName: data.displayName || '',
//           profileImage: data.profileImage || '',
//         });
//         setImageUrl(data.profileImage || null);
//       } catch (err) {
//         console.error('Failed to fetch user profile:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserProfile();
//   }, [form]);

//   // Handle form submission
//   const onSubmit = async (values: ProfileFormValues) => {
//     setLoading(true);
//     try {
//       const payload = {
//         displayName: values.displayName,
//         profileImage: imageUrl || values.profileImage,
//       };
//       const res = await authService.updateProfile(payload);
//       setUser((prev) => ({ ...prev, ...res.user }));
//       setIsEditing(false);
//       // Optionally: show success toast
//     } catch (err) {
//       console.error('Failed to update profile:', err);
//       // Optionally: show error toast
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <GlitterBackground>
//         <div className="text-white text-2xl">Loading Profile...</div>
//       </GlitterBackground>
//     );
//   }

//   if (!user) {
//     return (
//       <GlitterBackground>
//         <div className="text-white text-2xl">User not found.</div>
//       </GlitterBackground>
//     );
//   }

//   return (
//     <GlitterBackground>
//       <Card className="w-[400px] shadow-lg border-primary/20 bg-background/80 backdrop-blur-sm">
//         <CardHeader className="text-center">
//           <CardTitle className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
//             Your Profile
//           </CardTitle>
//           <CardDescription className="text-muted-foreground">
//             Manage your personal information.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="flex flex-col items-center gap-6">
//           <div className="relative">
//             <Avatar className="w-32 h-32 border-4 border-purple-500 shadow-md">
//               <AvatarImage src={imageUrl || user.profileImage} alt={user.displayName} />
//               <AvatarFallback className="text-5xl font-bold bg-purple-100 text-purple-800">
//                 {user.displayName?.charAt(0) || '?'}
//               </AvatarFallback>
//             </Avatar>

//             <Dialog>
//               <DialogTrigger asChild>
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   className="absolute bottom-0 right-0 rounded-full bg-background/80 hover:bg-background border-2 border-purple-500"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-purple-600">
//                     <path d="M12 9a3 3 0 100 6 3 3 0 000-6z" />
//                     <path
//                       fillRule="evenodd"
//                       d="M9.302 3.007a1.125 1.125 0 011.696.027l2.887 3.858a1.125 1.125 0 001.446 0l2.887-3.858a1.125 1.125 0 011.696-.027L21.497 6.47c.489.654.11 1.54-.783 1.54H3.286c-.893 0-1.272-.886-.784-1.540l4.137-3.463zM12 12a6 6 0 100 12 6 6 0 000-12z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                   <span className="sr-only">Change profile image</span>
//                 </Button>
//               </DialogTrigger>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Upload New Profile Image</DialogTitle>
//                   <DialogDescription>
//                     Upload a new image for your profile.
//                   </DialogDescription>
//                 </DialogHeader>
//                 <UploadExample
//                   onUpload={(url: string) => {
//                     setImageUrl(url);
//                     form.setValue('profileImage', url);
//                   }}
//                 />
//                 <DialogFooter>
//                   <Button onClick={() => setIsEditing(false)}>Close</Button>
//                 </DialogFooter>
//               </DialogContent>
//             </Dialog>
//           </div>

//           {!isEditing ? (
//             <div className="w-full text-center">
//               <p className="text-2xl font-semibold text-foreground">{user.username}</p>
//               <p className="text-lg text-muted-foreground">@{user.displayName}</p>
//               <Button className="mt-6 w-full" onClick={() => setIsEditing(true)}>
//                 Edit Profile
//               </Button>
//             </div>
//           ) : (
//             <Form {...form}>
//               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
//                 <FormField
//                   control={form.control}
//                   name="name"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Name</FormLabel>
//                       <FormControl>
//                         <Input placeholder="Your Name" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="displayName"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Display Name</FormLabel>
//                       <FormControl>
//                         <Input placeholder="Your Display Name" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <div>
//                   <Label className="block text-sm font-medium text-foreground mb-2">Username</Label>
//                   <Input value={user.username} disabled className="bg-muted cursor-not-allowed" />
//                 </div>

//                 <div className="flex gap-4">
//                   <Button type="submit" className="flex-1">Save Changes</Button>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     className="flex-1"
//                     onClick={() => {
//                       setIsEditing(false);
//                       form.reset({
//                         name: user.username,
//                         displayName: user.displayName,
//                         profileImage: user.profileImage,
//                       });
//                       setImageUrl(user.profileImage);
//                     }}
//                   >
//                     Cancel
//                   </Button>
//                 </div>
//               </form>
//             </Form>
//           )}
//         </CardContent>
//       </Card>
//     </GlitterBackground>
//   );
// };



// User Profile Page Component
export const Profile = () => {
  const addToObserve = useScrollAnimation(0.2);
  const profileCardRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if(profileCardRef.current) addToObserve(profileCardRef.current);
    if(statsRef.current) { statsRef.current.style.transitionDelay = '200ms'; addToObserve(statsRef.current); }
    if(bioRef.current) { bioRef.current.style.transitionDelay = '400ms'; addToObserve(bioRef.current); }
  }, [addToObserve]);

  const user = {
    name: "PixelPioneer",
    avatarUrl: "https://placehold.co/128x128/A0AEC0/1A202C?text=PP",
    joinDate: "Joined March 2024",
    bio: "Explorer of digital realms, creator of pixel wonders, and always up for a new adventure in the metaverse. Catch me in Pixel Raiders or building my dream space!",
    stats: [
      { label: "Games Played", value: 42 },
      { label: "Creations Shared", value: 12 },
      { label: "Achievements Unlocked", value: 88 },
    ]
  };

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
    <AnimatedPageWrapper id="profile" className="bg-gradient-to-b from-slate-900 to-slate-950">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
        My Profile
      </h2>
      <div className="max-w-3xl mx-auto bg-slate-800/70 p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-700">
        <div ref={profileCardRef} className="flex flex-col sm:flex-row items-center gap-6 mb-8 opacity-0 transform translate-y-5">
          <img 
            src={user.avatarUrl} 
            alt={user.name} 
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-purple-500 shadow-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://placehold.co/128x128/334155/e2e8f0?text=Error`;
            }}
          />
          <div>
            <h3 className="text-3xl font-bold text-slate-100">{user.name}</h3>
            <p className="text-purple-400">{user.joinDate}</p>
          </div>
        </div>

        <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 opacity-0 transform translate-y-5">
          {user.stats.map(stat => (
            <div key={stat.label} className="bg-slate-700/50 p-4 rounded-lg text-center shadow">
              <p className="text-2xl font-bold text-cyan-400">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <div ref={bioRef} className="opacity-0 transform translate-y-5">
          <h4 className="text-xl font-semibold text-slate-200 mb-2">About Me</h4>
          <p className="text-slate-400 leading-relaxed whitespace-pre-line">{user.bio}</p>
        </div>
        
        <div className="mt-10 text-center">
            <button className="animated-border-button rounded-lg">
                <span className="inner-content px-6 py-3 text-white font-semibold">Edit Profile</span>
            </button>
        </div>
      </div>
    </AnimatedPageWrapper> </>
  );
};
import { useScrollAnimation } from '@/utils/ScrollHook';
import React, { useRef, useEffect, type ReactNode, type CSSProperties } from 'react';

type AnimatedPageWrapperProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  style?: CSSProperties;
};

export const AnimatedPageWrapper = ({ children, className, id, style = {} }: AnimatedPageWrapperProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const addToObserve = useScrollAnimation(0.05); // Lower threshold for quicker page animation

  useEffect(() => {
    const currentRef = sectionRef.current;
    if (currentRef) {
      currentRef.classList.add('opacity-0', 'transform', 'translate-y-5', 'motion-safe:transition-all', 'motion-safe:duration-500', 'motion-safe:ease-out');
      addToObserve(currentRef);
    }
  }, [addToObserve]);

  return (
    <div ref={sectionRef} id={id} className={`pt-28 pb-16 min-h-screen ${className || ''}`} style={style}>
      <div className="container mx-auto px-4 md:px-6">
        {children}
      </div>
    </div>
  );
};

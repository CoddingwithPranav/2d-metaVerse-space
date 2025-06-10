import React, { useState, useEffect, useRef, type ReactNode, type CSSProperties } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Pencil } from 'lucide-react'; // Added for the edit icon

// Utility & Service Imports
import { useScrollAnimation } from '@/utils/ScrollHook';
import { authService } from '@/service/authService';
import '../../App.css';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import UploadExample from '@/components/ui/imageupload'; // Assuming this component exists and works as intended

// Zod schema for profile form validation
const profileFormSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters.").max(30),
  profileImage: z.string().url("Must be a valid URL.").optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Animated wrapper component
export const AnimatedPageWrapper = ({ children, className, id }: { children: ReactNode; className?: string; id?: string; }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const addToObserve = useScrollAnimation(0.1);

  useEffect(() => {
    const currentRef = sectionRef.current;
    if (currentRef) {
      // currentRef.classList.add('opacity-0', 'transform', 'motion-safe:transition-all', 'motion-safe:duration-500', 'motion-safe:ease-out');
      addToObserve(currentRef);
    }
  }, [addToObserve]);

  return (
    <div ref={sectionRef} id={id} className={`pt-28 pb-16 min-h-screen ${className}`}>
      <div className="container mx-auto px-4 md:px-6">
        {children}
      </div>
    </div>
  );
};

// Main Profile Component
export const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  // Holds the URL of the newly uploaded image before saving
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { displayName: '', profileImage: '' },
  });

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const data = await authService.profile();
        setUser(data);
        // Reset form with fetched data
        form.reset({
          displayName: data.displayName || '',
          profileImage: data.profileImage || '',
        });
        setNewImageUrl(data.profileImage || null);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        // Handle error (e.g., show a toast notification)
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [form]);

  // Form submission handler
  const onSubmit = async (values: ProfileFormValues) => {
    setLoading(true);
    try {
      const payload = { 
        displayName: values.displayName, 
        profileImage: newImageUrl || values.profileImage 
      };
      const updatedUser = await authService.updateProfile(payload);
      setUser((prev: any) => ({ ...prev, ...updatedUser }));
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form and image to original state
    form.reset({
      displayName: user.displayName,
      profileImage: user.profileImage,
    });
    setNewImageUrl(user.profileImage);
  };

  if (loading && !user) {
    return <div>Loading profile...</div>; // Or a spinner component
  }

  if (!user) {
    return <div>Could not load user profile.</div>;
  }
   
  const displayedImage = newImageUrl || user.profileImage;

  return (
    <AnimatedPageWrapper id="profile" className="bg-gradient-to-b from-slate-900 to-slate-950">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
        Your Profile
      </h2>
      <Card className="max-w-3xl mx-auto bg-slate-800/70 p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Manage Your Info
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            View or update your display name and profile image.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-purple-500 shadow-lg">
              <AvatarImage src={displayedImage} alt={user.displayName} />
              <AvatarFallback className="text-5xl font-bold bg-purple-100 text-purple-800">
                {user.displayName?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Dialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full bg-slate-800/80 hover:bg-slate-700 border-2 border-purple-500">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Change profile image</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload New Profile Image</DialogTitle>
                    <DialogDescription>Select a new image for your profile.</DialogDescription>
                  </DialogHeader>
                  <UploadExample onUpload={url => { 
                      setNewImageUrl(url); 
                      form.setValue('profileImage', url, { shouldValidate: true });
                  }} />
                  <DialogFooter>
                    <Button onClick={() => setUploadDialogOpen(false)}>Done</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {!isEditing ? (
            <div className="w-full text-center space-y-2">
              <p className="text-2xl font-semibold text-slate-100">{user.displayName}</p>
              <p className="text-lg text-muted-foreground text-pink-500">@{user.username}</p>
              <div className="pt-4">
                <Button className="w-full max-w-xs" onClick={() => setIsEditing(true)} disabled={loading}>
                  Edit Profile
                </Button>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full max-w-sm">
                <div>
                  <Label className="block text-sm font-medium text-white mb-2">Username</Label>
                  <Input value={`@${user.username}`} disabled className="bg-slate-700/50 cursor-not-allowed text-white" />
                </div>
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-white'>Display Name</FormLabel>
                      <FormControl>
                        <Input className='text-white' placeholder="Your awesome display name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </AnimatedPageWrapper>
  );
};
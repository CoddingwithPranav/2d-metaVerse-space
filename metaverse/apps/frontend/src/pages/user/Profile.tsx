import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Shadcn UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

// Corrected import path for GlitterBackground
import UploadExample from '@/components/ui/imageupload';
import { authService } from '@/service/authService';
import GlitterBackground from '@/components/ui/Glittre';

// Zod schema for profile form
const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(50, 'Name must not be longer than 50 characters.'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters.').max(30, 'Display name must not be longer than 30 characters.'),
  profileImage: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;




export const Profile: React.FC = () => {
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      displayName: '',
      profileImage: '',
    },
  });

  // Fetch profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const data = await authService.profile();
        setUser(data);
        form.reset({
          name: data.username || '',
          displayName: data.displayName || '',
          profileImage: data.profileImage || '',
        });
        setImageUrl(data.profileImage || null);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [form]);

  // Handle form submission
  const onSubmit = async (values: ProfileFormValues) => {
    setLoading(true);
    try {
      const payload = {
        displayName: values.displayName,
        profileImage: imageUrl || values.profileImage,
      };
      const res = await authService.updateProfile(payload);
      setUser((prev) => ({ ...prev, ...res.user }));
      setIsEditing(false);
      // Optionally: show success toast
    } catch (err) {
      console.error('Failed to update profile:', err);
      // Optionally: show error toast
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <GlitterBackground>
        <div className="text-white text-2xl">Loading Profile...</div>
      </GlitterBackground>
    );
  }

  if (!user) {
    return (
      <GlitterBackground>
        <div className="text-white text-2xl">User not found.</div>
      </GlitterBackground>
    );
  }

  return (
    <GlitterBackground>
      <Card className="w-[400px] shadow-lg border-primary/20 bg-background/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Your Profile
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage your personal information.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-purple-500 shadow-md">
              <AvatarImage src={imageUrl || user.profileImage} alt={user.displayName} />
              <AvatarFallback className="text-5xl font-bold bg-purple-100 text-purple-800">
                {user.displayName?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full bg-background/80 hover:bg-background border-2 border-purple-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-purple-600">
                    <path d="M12 9a3 3 0 100 6 3 3 0 000-6z" />
                    <path
                      fillRule="evenodd"
                      d="M9.302 3.007a1.125 1.125 0 011.696.027l2.887 3.858a1.125 1.125 0 001.446 0l2.887-3.858a1.125 1.125 0 011.696-.027L21.497 6.47c.489.654.11 1.54-.783 1.54H3.286c-.893 0-1.272-.886-.784-1.540l4.137-3.463zM12 12a6 6 0 100 12 6 6 0 000-12z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="sr-only">Change profile image</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload New Profile Image</DialogTitle>
                  <DialogDescription>
                    Upload a new image for your profile.
                  </DialogDescription>
                </DialogHeader>
                <UploadExample
                  onUpload={(url: string) => {
                    setImageUrl(url);
                    form.setValue('profileImage', url);
                  }}
                />
                <DialogFooter>
                  <Button onClick={() => setIsEditing(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {!isEditing ? (
            <div className="w-full text-center">
              <p className="text-2xl font-semibold text-foreground">{user.username}</p>
              <p className="text-lg text-muted-foreground">@{user.displayName}</p>
              <Button className="mt-6 w-full" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Display Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Label className="block text-sm font-medium text-foreground mb-2">Username</Label>
                  <Input value={user.username} disabled className="bg-muted cursor-not-allowed" />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">Save Changes</Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsEditing(false);
                      form.reset({
                        name: user.username,
                        displayName: user.displayName,
                        profileImage: user.profileImage,
                      });
                      setImageUrl(user.profileImage);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </GlitterBackground>
  );
};

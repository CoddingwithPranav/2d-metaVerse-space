import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil, LayoutDashboard, UploadCloud } from "lucide-react"; // Added UploadCloud icon
import { useNavigate } from "react-router-dom";
import { authService } from "@/service/authService";
import "../../App.css"; // Assuming this imports global styles if needed

// Shadcn UI Components (Ensuring these are themed via Tailwind/global CSS)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import UploadExample from "@/components/ui/imageupload";
import { AnimatedPageWrapper } from "@/components/ui/AnimatedPageWrapper";

// Zod schema for profile form validation
const profileFormSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters.")
    .max(30),
  profileImage: z
    .string()
    .url("Must be a valid URL.")
    .optional()
    .or(z.literal("")), // Allow empty string for optional
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Main Profile Component
export const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Holds the URL of the newly uploaded image before saving
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);

  const navigate = useNavigate();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { displayName: "", profileImage: "" },
  });

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const data = await authService.profile();
        setUser(data);
        const imageUrl = data.profileImage || ""; // Ensure it's an empty string for default
        form.reset({
          displayName: data.displayName || "",
          profileImage: imageUrl,
        });
        setNewImageUrl(imageUrl);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        // TODO: Handle error elegantly, e.g., show a toast or redirect
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
        profileImage: newImageUrl || "", // Use newImageUrl, default to empty string if null
      };
      const updatedUser = await authService.updateProfile(payload);
      setUser((prev: any) => ({ ...prev, ...updatedUser }));
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      // TODO: Handle error
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form and image to original state
    form.reset({
      displayName: user.displayName,
      profileImage: user.profileImage || "",
    });
    setNewImageUrl(user.profileImage || "");
  };

  if (loading && !user) {
    return (
      <AnimatedPageWrapper className="bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-xl text-slate-300 animate-pulse">
          Loading profile...
        </div>
      </AnimatedPageWrapper>
    );
  }

  if (!user) {
    return (
      <AnimatedPageWrapper className="bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-xl text-red-400">Could not load user profile.</div>
      </AnimatedPageWrapper>
    );
  }

  const displayedImage = newImageUrl || user.profileImage;

  return (
    <AnimatedPageWrapper
      id="profile"
      className="bg-gradient-to-b from-slate-900 to-slate-950"
    >
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
        Your Profile
      </h2>
      <Card className="max-w-3xl mx-auto bg-slate-800/70 p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-700 transition-all duration-300 hover:shadow-purple-500/30">
        <CardHeader className="text-center pb-6">
          {" "}
          {/* Added padding-bottom */}
          <CardTitle className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
            Manage Your Info
          </CardTitle>
          <CardDescription className="text-slate-400 text-base">
            {" "}
            {/* Adjusted text color and size */}
            View or update your display name and profile image.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-8">
          {" "}
          {/* Increased gap */}
          <div className="relative group">
            {" "}
            {/* Added group for hover effect */}
            <Avatar className="w-36 h-36 border-4 border-purple-500 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-400">
              <AvatarImage src={displayedImage} alt={user.displayName} />
              <AvatarFallback className="text-6xl font-bold bg-purple-600 text-white flex items-center justify-center">
                {user.displayName?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Dialog
                open={isUploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost" // Use ghost for a more subtle button that reveals on hover
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full bg-slate-700/80 hover:bg-purple-600 border border-slate-600 text-slate-100 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <Pencil className="h-5 w-5" />
                    <span className="sr-only">Change profile image</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 text-slate-100 border-slate-700 rounded-lg shadow-xl">
                  {" "}
                  {/* Themed Dialog */}
                  <DialogHeader>
                    <DialogTitle className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 text-2xl font-bold">
                      Upload New Profile Image
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Select a new image for your profile.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <UploadExample
                      onUpload={(url) => {
                        setNewImageUrl(url);
                        form.setValue("profileImage", url, {
                          shouldValidate: true,
                        });
                      }}
                    />
                    <div className="mt-4 text-sm text-slate-500 flex items-center justify-center gap-2">
                      <UploadCloud size={16} /> Image will be uploaded upon
                      saving changes.
                    </div>
                  </div>
                  <DialogFooter className="pt-4">
                    <Button
                      onClick={() => setUploadDialogOpen(false)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md shadow-md transition-all duration-300"
                    >
                      Done
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          {!isEditing ? (
            <div className="w-full text-center space-y-3">
              {" "}
              {/* Increased space-y */}
              <p className="text-3xl font-bold text-slate-50">
                {user.displayName}
              </p>{" "}
              {/* Bolder, brighter text */}
              <p className="text-lg text-purple-400">@{user.username}</p>{" "}
              {/* More prominent accent */}
              <div className="pt-6 flex flex-col sm:flex-row justify-center gap-4">
                {" "}
                {/* Increased pt */}
                <Button
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                >
                  Edit Profile
                </Button>
                <Button
                  className="w-full sm:w-auto px-6 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-purple-500 text-slate-200 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => navigate("/admin/dashboard")}
                  disabled={loading}
                >
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  Go to Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 w-full max-w-sm"
              >
                <div>
                  <Label
                    htmlFor="username-display"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Username
                  </Label>{" "}
                  {/* Themed label */}
                  <Input
                    id="username-display"
                    value={`@${user.username}`}
                    disabled
                    className="bg-slate-700/50 cursor-not-allowed text-slate-300 border-slate-600 focus:border-purple-500"
                  />
                </div>
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">
                        Display Name
                      </FormLabel>{" "}
                      {/* Themed label */}
                      <FormControl>
                        <Input
                          className="text-slate-100 bg-slate-700 border-slate-600 focus:border-purple-500 placeholder:text-slate-500" // Themed input
                          placeholder="Your awesome display name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />{" "}
                      {/* Themed message */}
                    </FormItem>
                  )}
                />
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  {" "}
                  {/* Increased pt */}
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-red-500 text-red-400 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300" // Themed cancel button
                    onClick={handleCancelEdit}
                  >
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

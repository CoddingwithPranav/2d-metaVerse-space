import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil, LayoutDashboard, UploadCloud } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import { authService } from "@/service/authService";
import "../../App.css"; 

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const data = await authService.profile();
        setUser(data);
        const imageUrl = data.profileImage || ""; 
        form.reset({
          displayName: data.displayName || "",
          profileImage: imageUrl,
        });
        setNewImageUrl(imageUrl);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [form]);

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
    form.reset({
      displayName: user.displayName,
      profileImage: user.profileImage || "",
    });
    setNewImageUrl(user.profileImage || "");
  };

  if (loading && !user) {
    return (
      <AnimatedPageWrapper className="bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600 animate-pulse">
          Loading profile...
        </div>
      </AnimatedPageWrapper>
    );
  }

  if (!user) {
    return (
      <AnimatedPageWrapper className="bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-500">Could not load user profile.</div>
      </AnimatedPageWrapper>
    );
  }

  const displayedImage = newImageUrl || user.profileImage;

  return (
    <AnimatedPageWrapper
      id="profile"
      className="bg-gray-50"
    >
      <Card className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 transition-all duration-300">
        <CardHeader className="text-center pb-6">
          {" "}
          {/* Added padding-bottom */}
          <CardTitle className="text-3xl font-extrabold text-black mb-2">
            Manage Your Info
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
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
            <Avatar className="w-36 h-36 border-4 border-gray-300 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:border-[#9ef01a]">
              <AvatarImage src={displayedImage} alt={user.displayName} />
              <AvatarFallback className="text-6xl font-bold bg-[#9ef01a] text-black flex items-center justify-center">
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
                    className="absolute bottom-0 right-0 rounded-full bg-gray-800/80 hover:bg-[#9ef01a] border border-gray-600 text-black p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <Pencil className="h-5 w-5" />
                    <span className="sr-only">Change profile image</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white text-black border-gray-200 rounded-lg shadow-xl">
                  {" "}
                  {/* Themed Dialog */}
                  <DialogHeader>
                    <DialogTitle className="text-black text-2xl font-bold">
                      Upload New Profile Image
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
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
                    <div className="mt-4 text-sm text-gray-500 flex items-center justify-center gap-2">
                      <UploadCloud size={16} /> Image will be uploaded upon
                      saving changes.
                    </div>
                  </div>
                  <DialogFooter className="pt-4">
                    <Button
                      onClick={() => setUploadDialogOpen(false)}
                      className="bg-[#9ef01a] hover:opacity-90 text-black font-semibold rounded-md shadow-md transition-all duration-300"
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
              <p className="text-3xl font-bold text-black">
                {user.displayName}
              </p>{" "}
              {/* Bolder, brighter text */}
              <p className="text-lg text-gray-700">@{user.username}</p>{" "}
              {/* More prominent accent */}
              <div className="pt-6 flex flex-col sm:flex-row justify-center gap-4">
                {" "}
                {/* Increased pt */}
                <Button
                  className="w-full sm:w-auto px-6 py-3 bg-[#9ef01a] hover:opacity-90 text-black font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                >
                  Edit Profile
                </Button>
                <Button
                  className="w-full sm:w-auto px-6 py-3 bg-gray-200 hover:bg-gray-300 border border-gray-300 hover:border-gray-400 text-black font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
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
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Username
                  </Label>{" "}
                  {/* Themed label */}
                  <Input
                    id="username-display"
                    value={`@${user.username}`}
                    disabled
                    className="bg-gray-100 cursor-not-allowed text-gray-600 border-gray-300 focus:border-[#9ef01a]"
                  />
                </div>
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">
                        Display Name
                      </FormLabel>{" "}
                      {/* Themed label */}
                      <FormControl>
                        <Input
                          className="text-black bg-white border-gray-300 focus:border-[#9ef01a] placeholder:text-gray-400" // Themed input
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
                    className="flex-1 bg-[#9ef01a] hover:opacity-90 text-black font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-gray-200 hover:bg-gray-300 border border-gray-300 hover:border-red-400 text-red-600 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300" // Themed cancel button
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

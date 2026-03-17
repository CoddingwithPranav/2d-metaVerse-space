import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UploadExample from "@/components/ui/imageupload";
import { avatarService } from "@/service/avatarService";
import {
  PlusCircle,
  Image as ImageIcon,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { AnimatedPageWrapper } from "@/components/ui/AnimatedPageWrapper";

interface Avatar {
  id: string;
  name: string;
  idleUrls: {
    down: string;
    left: string;
    right: string;
    up: string;
  };
  runUrls: {
    down: string;
    left: string;
    right: string;
    up: string;
  };
}

export const AvatarsPage: React.FC = () => {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAvatars, setIsLoadingAvatars] = useState(true);

  const [name, setName] = useState<string>("");
  const [idleUrls, setIdleUrls] = useState({
    down: "",
    left: "",
    right: "",
    up: "",
  });
  const [runUrls, setRunUrls] = useState({
    down: "",
    left: "",
    right: "",
    up: "",
  });

  const fetchAvatars = async () => {
    setIsLoadingAvatars(true);
    try {
      const list = await avatarService.list();
      setAvatars(list);
    } catch (err) {
      console.error("Error fetching avatars:", err);
    } finally {
      setIsLoadingAvatars(false);
    }
  };

  useEffect(() => {
    fetchAvatars();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !name ||
      Object.values(idleUrls).some((url) => !url) ||
      Object.values(runUrls).some((url) => !url)
    ) {
      alert("Please fill all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await avatarService.create({ name, idleUrls, runUrls });
      setShowForm(false);
      setName("");
      setIdleUrls({ down: "", left: "", right: "", up: "" });
      setRunUrls({ down: "", left: "", right: "", up: "" });
      fetchAvatars();
    } catch (error) {
      console.error("Create avatar failed:", error);
      alert("Failed to create avatar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedPageWrapper id="avatars-page" className="bg-gray-50">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-black">
        Manage Avatars
      </h2>

      {!showForm ? (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-3xl font-semibold text-black">
              Avatars Library
            </h3>
            <Button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-[#9ef01a] hover:opacity-90 text-black font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <PlusCircle className="h-5 w-5 mr-2" /> Add New Avatar
            </Button>
          </div>

          {isLoadingAvatars ? (
            <div className="text-gray-600 text-center text-lg py-10 flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading Avatars...</span>
            </div>
          ) : avatars.length === 0 ? (
            <div className="text-gray-600 text-center text-lg py-10">
              No avatars found. Click "Add New Avatar" to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {avatars.map((avatar) => (
                <Card
                  key={avatar.id}
                  className="bg-white border border-gray-200 text-black rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                >
                  <CardHeader className="p-4 border-b border-gray-200">
                    <CardTitle className="text-lg font-semibold text-black">
                      {avatar.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="w-full h-48 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center border border-gray-300">
                      {avatar.idleUrls.down ? (
                        <img
                          src={avatar.idleUrls.down}
                          alt={`Idle down for ${avatar.name}`}
                          className=" h-full  transition-transform duration-300 hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              "https://placehold.co/600x400/f3f4f6/d1d5db?text=Image+Error";
                          }}
                        />
                      ) : (
                        <ImageIcon
                          size={48}
                          className="text-gray-400 opacity-50"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Card className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-200 animate-in fade-in slide-in-from-bottom-12 duration-500">
          <CardHeader className="pb-6 text-center">
            <CardTitle className="text-3xl font-extrabold text-black mb-2">
              Create New Avatar
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Add a new avatar with its animations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">
                  Avatar Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-gray-100 border-gray-300 text-black focus:border-[#9ef01a] placeholder:text-gray-400"
                  placeholder="Enter avatar name"
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-gray-700 font-semibold">
                  Idle Animations
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {["down", "left", "right", "up"].map((dir) => (
                    <div key={`idle-${dir}`}>
                      <Label
                        htmlFor={`idle-${dir}`}
                        className="text-gray-700 capitalize"
                      >
                        {dir}
                      </Label>
                      <UploadExample
                        onUpload={(url: string) =>
                          setIdleUrls((prev) => ({ ...prev, [dir]: url }))
                        }
                      />
                      {idleUrls[dir as keyof typeof idleUrls] && (
                        <p className="text-sm text-gray-600 break-all pt-2">
                          URL: {idleUrls[dir as keyof typeof idleUrls]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-gray-700 font-semibold">Run Animations</h4>
                <div className="grid grid-cols-2 gap-4">
                  {["down", "left", "right", "up"].map((dir) => (
                    <div key={`run-${dir}`}>
                      <Label
                        htmlFor={`run-${dir}`}
                        className="text-gray-700 capitalize"
                      >
                        {dir}
                      </Label>
                      <UploadExample
                        onUpload={(url: string) =>
                          setRunUrls((prev) => ({ ...prev, [dir]: url }))
                        }
                      />
                      {runUrls[dir as keyof typeof runUrls] && (
                        <p className="text-sm text-gray-600 break-all pt-2">
                          URL: {runUrls[dir as keyof typeof runUrls]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-[#9ef01a] hover:opacity-90 text-black font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlusCircle className="mr-2 h-5 w-5" />
                  )}
                  {isSubmitting ? "Creating..." : "Create Avatar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-300 border border-gray-300 hover:border-red-500 text-red-400 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back to List
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </AnimatedPageWrapper>
  );
};

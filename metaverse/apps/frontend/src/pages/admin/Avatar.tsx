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
    <AnimatedPageWrapper id="avatars-page" className="bg-slate-950">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
        Manage Avatars
      </h2>

      {!showForm ? (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-3xl font-semibold text-slate-100">
              Avatars Library
            </h3>
            <Button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <PlusCircle className="h-5 w-5 mr-2" /> Add New Avatar
            </Button>
          </div>

          {isLoadingAvatars ? (
            <div className="text-slate-400 text-center text-lg py-10 flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading Avatars...</span>
            </div>
          ) : avatars.length === 0 ? (
            <div className="text-slate-400 text-center text-lg py-10">
              No avatars found. Click "Add New Avatar" to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {avatars.map((avatar) => (
                <Card
                  key={avatar.id}
                  className="bg-slate-800 border border-slate-700 text-slate-100 rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-purple-500/30 transform hover:scale-105"
                >
                  <CardHeader className="p-4 border-b border-slate-700">
                    <CardTitle className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                      {avatar.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="w-full h-48 bg-slate-700 rounded-md overflow-hidden flex items-center justify-center border border-slate-600">
                      {avatar.idleUrls.down ? (
                        <img
                          src={avatar.idleUrls.down}
                          alt={`Idle down for ${avatar.name}`}
                          className=" h-full  transition-transform duration-300 hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              "https://placehold.co/600x400/334155/e2e8f0?text=Image+Error";
                          }}
                        />
                      ) : (
                        <ImageIcon
                          size={48}
                          className="text-slate-500 opacity-50"
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
        <Card className="max-w-3xl mx-auto bg-slate-800/70 p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-12 duration-500">
          <CardHeader className="pb-6 text-center">
            <CardTitle className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
              Create New Avatar
            </CardTitle>
            <CardDescription className="text-slate-400 text-base">
              Add a new avatar with its animations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">
                  Avatar Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-slate-100 focus:border-purple-500 placeholder:text-slate-500"
                  placeholder="Enter avatar name"
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-slate-300 font-semibold">
                  Idle Animations
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {["down", "left", "right", "up"].map((dir) => (
                    <div key={`idle-${dir}`}>
                      <Label
                        htmlFor={`idle-${dir}`}
                        className="text-slate-300 capitalize"
                      >
                        {dir}
                      </Label>
                      <UploadExample
                        onUpload={(url: string) =>
                          setIdleUrls((prev) => ({ ...prev, [dir]: url }))
                        }
                      />
                      {idleUrls[dir as keyof typeof idleUrls] && (
                        <p className="text-sm text-slate-400 break-all pt-2">
                          URL: {idleUrls[dir as keyof typeof idleUrls]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-slate-300 font-semibold">Run Animations</h4>
                <div className="grid grid-cols-2 gap-4">
                  {["down", "left", "right", "up"].map((dir) => (
                    <div key={`run-${dir}`}>
                      <Label
                        htmlFor={`run-${dir}`}
                        className="text-slate-300 capitalize"
                      >
                        {dir}
                      </Label>
                      <UploadExample
                        onUpload={(url: string) =>
                          setRunUrls((prev) => ({ ...prev, [dir]: url }))
                        }
                      />
                      {runUrls[dir as keyof typeof runUrls] && (
                        <p className="text-sm text-slate-400 break-all pt-2">
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
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
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-red-500 text-red-400 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
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

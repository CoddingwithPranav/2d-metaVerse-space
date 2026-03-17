import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import UploadExample from "@/components/ui/imageupload";
import { backgroundService } from "@/service/backgroundService";
import {
  PlusCircle,
  ImagePlus,
  Loader2,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";
import { AnimatedPageWrapper } from "@/components/ui/AnimatedPageWrapper";
import type { BackGround } from "@/types";

export const BackgroundsPage: React.FC = () => {
  const [backgrounds, setBackgrounds] = useState<BackGround[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState<string>("");
  const [isLoadingBackgrounds, setIsLoadingBackgrounds] = useState(true);
  const [isCreatingBackground, setIsCreatingBackground] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);

  // Fetch backgrounds
  const fetchBackgrounds = async () => {
    setIsLoadingBackgrounds(true);
    try {
      const list = await backgroundService.list();
      setBackgrounds(list);
    } catch (err) {
      console.error("Error fetching backgrounds:", err);
      // TODO: Display a user-friendly error message
    } finally {
      setIsLoadingBackgrounds(false);
    }
  };

  useEffect(() => {
    fetchBackgrounds();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      alert("Please upload a background image first.");
      return;
    }
    if (!isUploadComplete) {
      alert("Please wait for the image upload to complete before creating.");
      return;
    }

    setIsCreatingBackground(true);
    try {
      await backgroundService.create({ Url: url });
      setShowForm(false);
      setUrl("");
      setIsUploadComplete(false);
      fetchBackgrounds();
    } catch (err) {
      console.error("Create background failed:", err);
      alert(
        "Failed to create background. " +
          (err instanceof Error ? err.message : ""),
      );
    } finally {
      setIsCreatingBackground(false);
    }
  };

  return (
    <AnimatedPageWrapper id="backgrounds-page" className="bg-gray-50">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-black">
        Manage Game Backgrounds
      </h2>

      {!showForm ? (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-3xl font-semibold text-black">
              Backgrounds Library
            </h3>
            <Button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-[#9ef01a] hover:opacity-90 text-black font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <PlusCircle className="h-5 w-5 mr-2" /> Add New Background
            </Button>
          </div>

          {isLoadingBackgrounds ? (
            <div className="text-gray-600 text-center text-lg py-10 flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading backgrounds...</span>
            </div>
          ) : backgrounds.length === 0 ? (
            <div className="text-gray-600 text-center text-lg py-10">
              No backgrounds found. Click "Add New Background" to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {backgrounds.map((bg) => (
                <Card
                  key={bg.id}
                  className="bg-white border border-gray-200 text-black rounded-xl shadow-xl overflow-hidden
                             transition-all duration-300 hover:shadow-lg transform hover:scale-105 group"
                >
                  <CardHeader className="p-4 border-b border-gray-200">
                    <CardTitle className="text-lg font-semibold text-black">
                      ID: {bg.id.substring(0, 8)}...
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="w-full h-48 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center border border-gray-300">
                      {bg.Url ? (
                        <img
                          src={bg.Url}
                          alt={`Background ${bg.id}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
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
        <Card className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-200 animate-in fade-in slide-in-from-bottom-12 duration-500">
          {" "}
          {/* Themed form card */}
          <CardHeader className="pb-6 text-center">
            <CardTitle className="text-3xl font-extrabold text-black mb-2">
              Create New Background
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Upload a new image to use as a game background.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="upload"
                  className="text-gray-700 flex items-center gap-2"
                >
                  <ImagePlus className="h-4 w-4 text-[#9ef01a]" /> Upload
                  Background Image
                </Label>
                <UploadExample
                  onUpload={(uploadedUrl: string) => {
                    setUrl(uploadedUrl);
                  }}
                  setIsUploadCompleted={setIsUploadComplete}
                />
                {url && (
                  <p className="text-sm text-gray-600 break-all pt-2">
                    <span className="font-medium">Uploaded URL:</span> {url}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                <Button
                  type="submit"
                  disabled={isCreatingBackground || !url || !isUploadComplete}
                  className="flex-1 px-6 py-3 bg-[#9ef01a] hover:opacity-90 text-black font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  {isCreatingBackground ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlusCircle className="mr-2 h-5 w-5" />
                  )}
                  {isCreatingBackground ? "Creating..." : "Create Background"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setUrl("");
                    setIsUploadComplete(false);
                  }}
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

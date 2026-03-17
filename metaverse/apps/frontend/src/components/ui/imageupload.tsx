import React, { useRef, useState, useEffect } from "react";
import { handleImageKitUpload } from "@/utils/ImageKitUploader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  UploadCloud,
  CheckCircle2,
  XCircle,
  FileInput,
  RotateCw,
  ImageOff,
} from "lucide-react"; // Added ImageOff icon

interface UploadExampleProps {
  onUpload: (url: string) => void;
  // New prop to control the "Done" button's disabled state externally
  isUploadComplete?: boolean;
  setIsUploadCompleted?: React.Dispatch<React.SetStateAction<boolean>>;
}

const UploadExample: React.FC<UploadExampleProps> = ({
  onUpload,
  setIsUploadCompleted,
}) => {
  const [progress, setProgress] = useState(0);
  const [localUrl, setLocalUrl] = useState(""); // URL after successful ImageKit upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // The file object selected by user
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Temporary URL for local preview
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortController = useRef(new AbortController());

  // Handles file selection and sets up local preview
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setLocalUrl(""); // Clear previously uploaded URL
    setProgress(0);
    setIsUploading(false); // Ensure no ongoing upload state
    if (setIsUploadCompleted) setIsUploadCompleted(false);

    const file = event.target.files?.[0] || null;
    setSelectedFile(file); // Store the selected file object

    if (file) {
      // Create a URL for local preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  // Cleanup for the preview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]); // Run cleanup when previewUrl changes

  const handleUpload = async () => {
    if (!selectedFile) {
      // Use selectedFile from state
      setError("No file selected for upload.");
      return;
    }

    // Validate file type if needed (e.g., allow only images)
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file (e.g., JPG, PNG, GIF).");
      return;
    }

    setProgress(0);
    setError(null);
    setIsUploading(true);
    setLocalUrl(""); // Clear previous uploaded URL
    if (setIsUploadCompleted) setIsUploadCompleted(false);

    try {
      const uploadedUrl = await handleImageKitUpload(
        selectedFile, // Use the selectedFile
        (uploadProgress) => setProgress(uploadProgress),
        abortController.current.signal,
      );

      if (uploadedUrl) {
        setLocalUrl(uploadedUrl); // Set the URL from ImageKit
        onUpload(uploadedUrl); // Callback to parent with ImageKit URL
        if (setIsUploadCompleted) setIsUploadCompleted(true);
        setError(null);
        setSelectedFile(null); // Clear selected file after successful upload
        setPreviewUrl(null); // Clear preview as actual URL is available
      } else {
        setLocalUrl("");
        setError("Failed to upload image. Please try again.");
        if (setIsUploadCompleted) setIsUploadCompleted(false);
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Upload was aborted");
        setError("Upload cancelled.");
      } else {
        console.error("Error during upload:", error);
        setError(`Upload failed: ${error.message || "Unknown error"}.`);
      }
      setLocalUrl("");
      if (setIsUploadCompleted) setIsUploadCompleted(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (isUploading) {
      abortController.current.abort();
    }
    setProgress(0);
    setLocalUrl("");
    setSelectedFile(null); // Clear selected file
    setPreviewUrl(null); // Clear preview URL
    setIsUploading(false);
    setError("Upload process cancelled.");
    if (setIsUploadCompleted) setIsUploadCompleted(false);
    abortController.current = new AbortController(); // Reset controller
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear file input visually
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border border-gray-400 bg-white/5 shadow-lg">
      <Label
        htmlFor="file-upload"
        className="block text-sm font-medium text-gray-200 mb-2 flex items-center gap-2"
      >
        <FileInput className="h-4 w-4 text-[#9ef01a]" /> Select Image File
      </Label>
      <input
        id="file-upload"
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange} // Use the new handler
        className="block w-full text-sm text-gray-200
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[#9ef01a] file:text-black
                    hover:file:bg-[#8fd01a]
                    cursor-pointer
                    bg-white/5 rounded-lg border border-gray-400 outline-none
                    focus:border-[#9ef01a] focus:ring-1 focus:ring-[#9ef01a]"
        accept="image/*" // Suggest image files
      />

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          onClick={handleUpload}
          disabled={isUploading || !selectedFile} // Disable if uploading or no file selected
          className="flex-1 px-6 py-3 bg-gradient-to-r from-[#9ef01a] to-[#9ef01a] hover:from-[#8fd01a] hover:to-[#8fd01a] text-black font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          {isUploading ? (
            <RotateCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UploadCloud className="mr-2 h-5 w-5" />
          )}
          {isUploading ? "Uploading..." : "Upload File"}
        </Button>
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={!isUploading && !localUrl && !error && !selectedFile} // Enable if something to cancel
          className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-gray-400 hover:border-red-500 text-red-400 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <XCircle className="mr-2 h-5 w-5" /> Cancel
        </Button>
      </div>

      {progress > 0 && progress < 100 && !error && (
        <div className="space-y-2 pt-2">
          <Progress
            value={progress}
            max={100}
            className="w-full h-2 bg-white/10 [&::-webkit-progress-bar]:bg-white/10 [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-[#9ef01a] [&::-webkit-progress-value]:to-[#9ef01a] rounded-full"
          />
          <p className="text-sm text-gray-300 text-right">
            {progress.toFixed(0)}%
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center text-red-400 text-sm gap-2 pt-2">
          <XCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* --- LIVE PREVIEW AREA --- */}
      {previewUrl &&
        !isUploading &&
        !localUrl && ( // Show preview if a file is selected and not yet uploaded/failed
          <div className="border border-gray-400 rounded-lg p-4 bg-white/5 shadow-md flex flex-col items-center text-center">
            <Label className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
              <ImageOff className="h-6 w-6 text-[#9ef01a]" /> Image Preview:
            </Label>
            <img
              src={previewUrl}
              alt="Selected Preview"
              className="w-full max-h-64 object-contain rounded-md border border-gray-400 bg-white/5 p-1"
            />
            <p className="text-xs text-gray-300 mt-2 break-all">
              File: {selectedFile?.name || "N/A"} (
              {selectedFile ? (selectedFile.size / 1024).toFixed(2) : 0} KB)
            </p>
          </div>
        )}

      {/* --- UPLOADED IMAGE AREA --- */}
      {localUrl &&
        !isUploading &&
        !error && ( // Display uploaded image and URL after successful upload
          <div className="border border-gray-400 rounded-lg p-4 bg-white/5 shadow-md flex flex-col items-center text-center">
            <Label className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-6 w-6 text-green-400" /> Uploaded
              Image:
            </Label>
            <img
              src={localUrl}
              alt="Uploaded"
              className="w-full max-h-64 object-contain rounded-md border border-gray-400 bg-white/5 p-1"
            />
            <p className="text-xs text-gray-300 mt-4 break-all">
              URL:{" "}
              <a
                href={localUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#9ef01a] hover:underline transition-colors"
              >
                {localUrl}
              </a>
            </p>
          </div>
        )}
    </div>
  );
};

export default UploadExample;

import { authService } from "@/service/authService";
import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/react";

export const handleImageKitUpload = async (
  file: File,
  onProgress: (progress: number) => void = () => {},
  abortSignal?: AbortSignal,
): Promise<string | null> => {
  interface AuthParams {
    signature: string;
    expire: number;
    token: string;
    publicKey: string;
  }

  let authParams: AuthParams;
  try {
    const response = await authService.imageToken();
    authParams = response;
  } catch (authError: any) {
    console.error("Failed to authenticate for upload:", authError);
    throw new Error("Authentication failed: " + authError.message);
  }

  const { signature, expire, token, publicKey } = authParams;

  try {
    const uploadResponse: any = await upload({
      expire,
      token,
      signature,
      publicKey,
      file,
      fileName: file.name,
      onProgress: (event) => {
        onProgress((event.loaded / event.total) * 100);
      },
      abortSignal,
    });
    console.log("Upload response:", uploadResponse);
    return uploadResponse.url;
  } catch (error: any) {
    if (error instanceof ImageKitAbortError) {
      console.error("Upload aborted:", error.reason);
    } else if (error instanceof ImageKitInvalidRequestError) {
      console.error("Invalid request:", error.message);
    } else if (error instanceof ImageKitUploadNetworkError) {
      console.error("Network error:", error.message);
    } else if (error instanceof ImageKitServerError) {
      console.error("Server error:", error.message);
    } else {
      console.error("Upload error:", error);
    }
    return null;
  }
};

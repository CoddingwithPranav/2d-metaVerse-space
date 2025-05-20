import React, { useRef, useState, useEffect } from 'react';
import { handleImageKitUpload } from '@/utils/ImageKitUploader';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';

interface UploadExampleProps {
  onUpload: (url: string) => void;
}

const UploadExample: React.FC<UploadExampleProps> = ({ onUpload }) => {
  const [progress, setProgress] = useState(0);
  const [localUrl, setLocalUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortController = useRef(new AbortController());

  const handleUpload = async () => {
    const fileInput = fileInputRef.current;
    if (!fileInput?.files?.length) {
      alert('Please select a file to upload');
      return;
    }
    const file = fileInput.files[0];
    setProgress(0);

    try {
      const uploadedUrl = await handleImageKitUpload(
        file,
        (uploadProgress) => setProgress(uploadProgress),
        abortController.current.signal
      );

      if (uploadedUrl) {
        setLocalUrl(uploadedUrl);
        onUpload(uploadedUrl);
      } else {
        setLocalUrl('');
        alert('Failed to upload image.');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Upload was aborted');
      } else {
        console.error('Error during upload:', error);
        alert(`Upload failed: ${error.message}`);
      }
      setLocalUrl('');
    }
  };

  const handleCancel = () => {
    abortController.current.abort();
    setProgress(0);
    setLocalUrl('');
    alert('Upload Cancelled');
    abortController.current = new AbortController();
  };

  // clear file input on localUrl update
  useEffect(() => {
    if (localUrl && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [localUrl]);

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
      />
      <div className="flex gap-4">
        <Button onClick={handleUpload}>Upload File</Button>
        <Button variant="destructive" onClick={handleCancel}>Cancel</Button>
      </div>
      <Progress value={progress} max={100} className="w-full" />
      {progress > 0 && (
        <p className="text-sm text-gray-600">Upload progress: {progress.toFixed(2)}%</p>
      )}
      {localUrl && (
        <div className="border rounded-md p-4">
          <Label className="text-lg font-semibold">Uploaded Image:</Label>
          <img src={localUrl} alt="Uploaded" className="w-full h-auto rounded-md mt-2" />
          <p className="text-xs text-gray-500 mt-2 break-all">
            URL: <a href={localUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{localUrl}</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadExample;

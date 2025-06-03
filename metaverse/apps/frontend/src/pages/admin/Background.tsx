import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import UploadExample from "@/components/ui/imageupload";
import { backgroundService } from "@/service/backgroundService";

interface Background {
  id: string;
  Url: string; // Match Prisma casing
}

export const BackgroundsPage: React.FC = () => {
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState<string>("");

  const fetchBackgrounds = async () => {
    try {
      const list = await backgroundService.list();
      setBackgrounds(list);
    } catch (err) {
      console.error("Error fetching backgrounds:", err);
    }
  };

  useEffect(() => {
    fetchBackgrounds();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      alert("Please upload a background image first");
      return;
    }

    try {
      await backgroundService.create({ Url: url }); // Match field casing
      setShowForm(false);
      setUrl("");
      fetchBackgrounds();
    } catch (err) {
      console.error("Create background failed:", err);
      alert("Failed to create background");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-3xl font-bold">Admin Backgrounds Dashboard</h2>

      {!showForm ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold">Backgrounds List</h3>
            <Button onClick={() => setShowForm(true)}>Add New Background</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {backgrounds.map((bg) => (
              <Card key={bg.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>ID: {bg.id}</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={bg.Url}
                    alt={`bg-${bg.id}`}
                    className="w-full rounded-md"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="upload">Upload Background Image</Label>
            <UploadExample onUpload={(url: string) => setUrl(url)} />
            {url && (
              <p className="text-sm text-gray-600 break-all">
                Uploaded URL: {url}
              </p>
            )}
          </div>

          <div className="flex space-x-4">
            <Button type="submit">Create Background</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import UploadExample from '@/components/ui/imageupload';
import { elementService } from '@/service/elementService';

interface Element {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
  static: boolean;
}

export const ElementsPage : React.FC = () => {
  const navigate = useNavigate();
  const [elements, setElements] = useState<Element[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [imageUrl, setImageUrl] = useState<string>('');
  const [width, setWidth] = useState<number>(1);
  const [height, setHeight] = useState<number>(1);
  const [isStatic, setIsStatic] = useState<boolean>(false);

  // Fetch elements
  const fetchElements = async () => {
    try {
      const list = await elementService.list();
      setElements(list);
    } catch (err) {
      console.error('Error fetching elements:', err);
    }
  };

  useEffect(() => {
    fetchElements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      alert('Please upload an image first');
      return;
    }

    try {
      await elementService.create({ imageUrl, width, height, static: isStatic });
      setShowForm(false);
      // Reset form
      setImageUrl('');
      setWidth(1);
      setHeight(1);
      setIsStatic(false);
      fetchElements();
    } catch (error) {
      console.error('Create element failed:', error);
      alert('Failed to create element');
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-3xl font-bold">Admin Elements Dashboard</h2>

      {!showForm ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold">Elements List</h3>
            <Button onClick={() => setShowForm(true)}>Add New Element</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elements.map((el) => (
              <Card key={el.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>ID: {el.id}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <img src={el.imageUrl} alt={`el-${el.id}`} className="w-full rounded-md" />
                  <p>Width: {el.width}</p>
                  <p>Height: {el.height}</p>
                  <p>Static: {el.static ? 'Yes' : 'No'}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="upload">Upload Image</Label>
            <UploadExample onUpload={(url: string) => setImageUrl(url)} />
            {imageUrl && (
              <p className="text-sm text-gray-600 break-all">Uploaded URL: {imageUrl}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="width">Width</Label>
            <Input
              id="width"
              type="number"
              value={width}
              min={1}
              onChange={(e) => setWidth(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              type="number"
              value={height}
              min={1}
              onChange={(e) => setHeight(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="static"
              checked={isStatic}
              onChange={(e:any) => setIsStatic(e.target.checked)}
            />
            <Label htmlFor="static">Static</Label>
          </div>

          <div className="flex space-x-4">
            <Button type="submit">Create Element</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

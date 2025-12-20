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
import { Checkbox } from "@/components/ui/checkbox";
import UploadExample from "@/components/ui/imageupload";
import { elementService } from "@/service/elementService";
import {
  PlusCircle,
  Image as ImageIcon,
  Ruler,
  SquareCheckBig,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { AnimatedPageWrapper } from "@/components/ui/AnimatedPageWrapper";
interface Element {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
  static: boolean;
}

export const ElementsPage: React.FC = () => {
  const [elements, setElements] = useState<Element[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingElements, setIsLoadingElements] = useState(true);

  // Form state
  const [imageUrl, setImageUrl] = useState<string>("");
  const [width, setWidth] = useState<number>(1);
  const [height, setHeight] = useState<number>(1);
  const [isStatic, setIsStatic] = useState<boolean>(false);

  // Fetch elements
  const fetchElements = async () => {
    setIsLoadingElements(true);
    try {
      const list = await elementService.list();
      setElements(list);
    } catch (err) {
      console.error("Error fetching elements:", err);
    } finally {
      setIsLoadingElements(false);
    }
  };

  useEffect(() => {
    fetchElements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      alert("Please upload an image first");
      return;
    }

    setIsSubmitting(true);
    try {
      await elementService.create({
        imageUrl,
        width,
        height,
        static: isStatic,
      });
      setShowForm(false);
      // Reset form
      setImageUrl("");
      setWidth(1);
      setHeight(1);
      setIsStatic(false);
      fetchElements();
    } catch (error) {
      console.error("Create element failed:", error);
      alert("Failed to create element");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedPageWrapper id="elements-page" className="bg-slate-950">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
        Manage Game Elements
      </h2>

      {!showForm ? (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-3xl font-semibold text-slate-100">
              Elements Library
            </h3>
            <Button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <PlusCircle className="h-5 w-5 mr-2" /> Add New Element
            </Button>
          </div>

          {isLoadingElements ? (
            <div className="text-slate-400 text-center text-lg py-10 flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading elements...</span>
            </div>
          ) : elements.length === 0 ? (
            <div className="text-slate-400 text-center text-lg py-10">
              No elements found. Click "Add New Element" to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {elements.map((el) => (
                <Card
                  key={el.id}
                  className="bg-slate-800 border border-slate-700 text-slate-100 rounded-xl shadow-xl overflow-hidden
                             transition-all duration-300 hover:shadow-purple-500/30 transform hover:scale-105"
                >
                  <CardHeader className="p-4 border-b border-slate-700">
                    <CardTitle className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                      Element ID: {el.id.substring(0, 8)}...
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="w-full h-48 bg-slate-700 rounded-md overflow-hidden flex items-center justify-center border border-slate-600">
                      {el.imageUrl ? (
                        <img
                          src={el.imageUrl}
                          alt={`Element ${el.id}`}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
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
                    <div className="flex items-center text-slate-300">
                      <Ruler className="h-4 w-4 mr-2 text-cyan-400" />
                      <p>
                        <span className="font-medium">Dimensions:</span>{" "}
                        {el.width} x {el.height}
                      </p>
                    </div>
                    <div className="flex items-center text-slate-300">
                      <SquareCheckBig className="h-4 w-4 mr-2 text-purple-400" />
                      <p>
                        <span className="font-medium">Static:</span>{" "}
                        {el.static ? "Yes" : "No"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Card className="max-w-xl mx-auto bg-slate-800/70 p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-12 duration-500">
          {" "}
          {/* Themed form card */}
          <CardHeader className="pb-6 text-center">
            <CardTitle className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
              Create New Element
            </CardTitle>
            <CardDescription className="text-slate-400 text-base">
              Add a new game asset with its properties.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="upload"
                  className="text-slate-300 flex items-center gap-2"
                >
                  <ImageIcon className="h-4 w-4 text-cyan-400" /> Upload Image
                </Label>
                <UploadExample onUpload={(url: string) => setImageUrl(url)} />
                {imageUrl && (
                  <p className="text-sm text-slate-400 break-all pt-2">
                    <span className="font-medium">URL:</span> {imageUrl}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="width"
                  className="text-slate-300 flex items-center gap-2"
                >
                  <Ruler className="h-4 w-4 text-purple-400" /> Width (pixels)
                </Label>
                <Input
                  id="width"
                  type="number"
                  value={width}
                  min={1}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="bg-slate-700 border-slate-600 text-slate-100 focus:border-purple-500 placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="height"
                  className="text-slate-300 flex items-center gap-2"
                >
                  <Ruler className="h-4 w-4 text-cyan-400" /> Height (pixels)
                </Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  min={1}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="bg-slate-700 border-slate-600 text-slate-100 focus:border-cyan-500 placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Checkbox
                  id="static"
                  checked={isStatic}
                  onCheckedChange={(checked) => setIsStatic(!!checked)}
                  className="bg-slate-700 border-slate-600 data-[state=checked]:bg-purple-600 data-[state=checked]:text-white focus:ring-offset-slate-900 focus:ring-purple-500"
                />
                <Label
                  htmlFor="static"
                  className="text-slate-300 flex items-center gap-2"
                >
                  <SquareCheckBig className="h-4 w-4 text-purple-400" /> Static
                  Element
                </Label>
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
                  {isSubmitting ? "Creating..." : "Create Element"}
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

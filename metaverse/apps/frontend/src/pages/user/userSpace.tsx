import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { spaceService } from "@/service/spaceService";
import { AnimatedPageWrapper } from "@/components/ui/AnimatedPageWrapper";

interface Space {
  id: string;
  name: string;
  thumbnail: string;
  map: {
    width: number;
    height: number;
  };
}

export const UserSpace: React.FC = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [filteredSpaces, setFilteredSpaces] = useState<Space[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [isLoading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpaces = async () => {
      setLoading(true);
      try {
        const data = await spaceService.myspace();
        const userSpaces = data.spaces || [];
        setSpaces(userSpaces);
        setFilteredSpaces(userSpaces);
      } catch (error) {
        console.error("Error fetching spaces:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpaces();
  }, []);

  useEffect(() => {
    const results = spaces.filter((space) =>
      space.name.toLowerCase().includes(search.toLowerCase()),
    );
    setFilteredSpaces(results);
  }, [search, spaces]);

  const handleConfirmEnter = () => {
    if (selectedSpace) {
      navigate(`/arena/${selectedSpace.id}`);
    }
  };

  const renderSpaceCards = () => {
    if (isLoading) {
      return (
        <p className="col-span-full text-center text-gray-600">
          Loading your spaces...
        </p>
      );
    }

    if (filteredSpaces.length === 0) {
      return (
        <div className="col-span-full text-center p-10 bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl shadow-inner">
          <p className="text-gray-600">You haven't created any spaces yet.</p>
          <Button onClick={() => navigate("/maps")} className="mt-4 bg-[#9ef01a] hover:opacity-90 text-black font-semibold">
            Create a Space from a Map
          </Button>
        </div>
      );
    }

    return filteredSpaces.map((space) => (
      <Card
        key={space.id}
        className="bg-white border-gray-200 rounded-xl shadow-lg overflow-hidden flex flex-col"
      >
        <img
          src={space.thumbnail}
          alt={space.name}
          className="w-full h-40 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://placehold.co/600x400/1e293b/94a3b8?text=Image+Error`;
          }}
        />
        <CardContent className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-black flex-grow">
            {space.name}
          </h3>
          {space.map && (
            <Badge variant="secondary" className="mt-2 self-start">
              {space.map.width} x {space.map.height}
            </Badge>
          )}
          <div className="flex gap-2 pt-4 mt-auto">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 text-black hover:bg-gray-50"
              onClick={() => navigate(`/spaces/${space.id}/edit`)}
            >
              Manage
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="flex-1 bg-[#9ef01a] hover:opacity-90 text-black font-semibold"
                  onClick={() => setSelectedSpace(space)}
                >
                  Enter
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-gray-200">
                <DialogTitle className="text-black">Enter Space</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Are you sure you want to enter the space "
                  {selectedSpace?.name}"?
                </DialogDescription>
                <DialogFooter className="pt-4">
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:bg-gray-100"
                    onClick={() => setSelectedSpace(null)}
                  >
                    Cancel
                  </Button>
                  <Button className="bg-[#9ef01a] hover:opacity-90 text-black font-semibold" onClick={handleConfirmEnter}>Confirm & Enter</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <AnimatedPageWrapper
      id="spaces"
      className="bg-gray-50"
    >
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-black">
        My Spaces
      </h2>

      <div className="max-w-md mx-auto mb-12">
        <Input
          type="text"
          placeholder="Search your spaces..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border-gray-300 placeholder:text-gray-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {renderSpaceCards()}
      </div>
    </AnimatedPageWrapper>
  );
};

export default UserSpace;

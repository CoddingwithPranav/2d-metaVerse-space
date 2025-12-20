import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// UI & Wrapper Components
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

// Services
import { spaceService } from "@/service/spaceService";
import { AnimatedPageWrapper } from "@/components/ui/AnimatedPageWrapper";

// Define the data structure for a Space
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

  // Fetch the user's spaces on component mount
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

  // Effect to filter spaces based on the search input
  useEffect(() => {
    const results = spaces.filter((space) =>
      space.name.toLowerCase().includes(search.toLowerCase()),
    );
    setFilteredSpaces(results);
  }, [search, spaces]);

  // Handler to enter a space's arena after confirmation
  const handleConfirmEnter = () => {
    if (selectedSpace) {
      navigate(`/user/arena/${selectedSpace.id}`);
    }
  };

  const renderSpaceCards = () => {
    if (isLoading) {
      return (
        <p className="col-span-full text-center text-slate-400">
          Loading your spaces...
        </p>
      );
    }

    if (filteredSpaces.length === 0) {
      return (
        <div className="col-span-full text-center p-10 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-2xl shadow-inner">
          <p className="text-slate-400">You haven't created any spaces yet.</p>
          <Button onClick={() => navigate("/maps")} className="mt-4">
            Create a Space from a Map
          </Button>
        </div>
      );
    }

    return filteredSpaces.map((space) => (
      <Card
        key={space.id}
        className="bg-slate-800/70 border-slate-700 rounded-xl shadow-lg overflow-hidden flex flex-col"
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
          <h3 className="text-lg font-semibold text-slate-100 flex-grow">
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
              className="flex-1"
              onClick={() => navigate(`/user/spaces/${space.id}/edit`)}
            >
              Manage
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="flex-1"
                  onClick={() => setSelectedSpace(space)}
                >
                  Enter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Enter Space</DialogTitle>
                <DialogDescription>
                  Are you sure you want to enter the space "
                  {selectedSpace?.name}"?
                </DialogDescription>
                <DialogFooter className="pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedSpace(null)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmEnter}>Confirm & Enter</Button>
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
      className="bg-gradient-to-b from-slate-900 to-slate-950"
    >
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
        My Spaces
      </h2>
      <p className="text-lg text-slate-400 text-center mb-12 max-w-2xl mx-auto">
        Here are all of the spaces you've created. Manage them or jump right
        into the action.
      </p>

      <div className="max-w-md mx-auto mb-12">
        <Input
          type="text"
          placeholder="Search your spaces..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-800/70 border-slate-700 placeholder:text-slate-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {renderSpaceCards()}
      </div>
    </AnimatedPageWrapper>
  );
};

export default UserSpace;

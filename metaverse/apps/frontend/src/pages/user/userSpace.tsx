import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { spaceService } from '@/service/spaceService';

interface Space {
  id: string;
  name: string;
  thumbnail: string;
  dimensions: string;
}

export const UserSpace: React.FC = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [filteredSpaces, setFilteredSpaces] = useState<Space[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const data = await spaceService.myspace();
        setSpaces(data.spaces);
        setFilteredSpaces(data.spaces);
      } catch (error) {
        console.error('Error fetching spaces:', error);
      }
    };

    fetchSpaces();
  }, []);

  useEffect(() => {
    const results = spaces.filter(space =>
      space.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredSpaces(results);
  }, [search, spaces]);

  const handleConfirmJoin = () => {
    if (selectedSpace) {
      navigate(`/user/arena/${selectedSpace.id}`);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-purple-700">Your Spaces</h2>
      <Input
        type="text"
        placeholder="Search spaces..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-6 max-w-md"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredSpaces.length > 0 ? (
          filteredSpaces.map(space => (
            <Card key={space.id} className="rounded-2xl shadow-md bg-gradient-to-tr from-pink-100 to-blue-100">
              <img
                src={space.thumbnail}
                alt={space.name}
                className="w-full h-40 object-cover rounded-t-2xl"
              />
              <CardContent className="p-4 space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">{space.name}</h3>
                <p className="text-sm text-gray-600">Size: {space.dimensions}</p>
                <div className="flex justify-between items-center mt-4">
                  <Button variant="outline" onClick={() => navigate(`/spaces/${space.id}`)}>
                    View
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => setSelectedSpace(space)}
                        className="bg-purple-600 text-white hover:bg-purple-700"
                      >
                        Join
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle>Join Space</DialogTitle>
                      <p>
                        Are you sure you want to join the space "{selectedSpace?.name}"?
                      </p>
                      <div className="flex justify-end mt-4 gap-2">
                        <Button variant="outline" onClick={() => setSelectedSpace(null)}>
                          Cancel
                        </Button>
                        <Button
                          className="bg-green-600 text-white hover:bg-green-700"
                          onClick={handleConfirmJoin}
                        >
                          Confirm
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center p-10 bg-gray-100 rounded-2xl shadow-inner">
            <p className="text-gray-500">No spaces found. Create or join a space to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSpace;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { spaceService } from '@/service/spaceService';
// import axios from 'axios';
// import { BACKEND_URL } from '@/config';

import { AnimatedPageWrapper } from "../user/Profile";
import { ItemCard } from "./Item";

// interface Map {
//   id: string;
//   name: string;
//   thumbnail: string;
//   width: number;
//   height: number;
// }

// export const MapList: React.FC = () => {
//   const [maps, setMaps] = useState<Map[]>([]);
//   const [filteredMaps, setFilteredMaps] = useState<Map[]>([]);
//   const [search, setSearch] = useState('');
//   const [selectedMap, setSelectedMap] = useState<Map | null>(null);
//   const [createDialogOpen, setCreateDialogOpen] = useState(false);
//   const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchMaps = async () => {
//       try {
//         const data = await spaceService.allMap();
//         // Support both .spaces and .maps payloads
//         const list: Map[] = data.spaces ?? data.maps ?? [];
//         setMaps(list);
//         setFilteredMaps(list);
//       } catch (err) {
//         console.error('Failed to load maps', err);
//       }
//     };
//     fetchMaps();
//   }, []);

//   useEffect(() => {
//     const lower = search.toLowerCase();
//     setFilteredMaps(maps.filter((m) => m.name.toLowerCase().includes(lower)));
//   }, [search, maps]);

//   const openCreateDialog = (map: Map) => {
//     setSelectedMap(map);
//     setCreateDialogOpen(true);
//   };

//   const openDetailsDialog = (map: Map) => {
//     setSelectedMap(map);
//     setDetailsDialogOpen(true);
//   };

//   const handleConfirmCreate = async () => {
//     if (!selectedMap) return;
//     try {
//       const res = await axios.post(
//         `${BACKEND_URL}/space`,
//         { mapId: selectedMap.id, name: selectedMap.name },
//         { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
//       );
//       navigate(`/user/spaces`);
//     } catch (err) {
//       console.error('Failed to create space', err);
//       alert('Failed to create space');
//     } finally {
//       setCreateDialogOpen(false);
//     }
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <h2 className="text-2xl font-bold">Available Maps</h2>
//       <Input
//         placeholder="Search maps..."
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         className="w-full max-w-md"
//       />

//       <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
//         {filteredMaps.length > 0 ? (
//           filteredMaps.map((map) => (
//             <Card key={map.id} className="rounded-2xl shadow-lg">
//               <img
//                 src={map.thumbnail}
//                 alt={map.name}
//                 className="w-full h-40 object-cover rounded-t-2xl"
//               />
//               <CardContent className="p-4 space-y-2">
//                 <div className="text-lg font-semibold">{map.name}</div>
//                 <Badge variant="outline">
//                   {map.width} x {map.height}
//                 </Badge>
//                 <div className="flex gap-2 pt-2">
//                   <Button variant="default" onClick={() => openCreateDialog(map)}>
//                     Create Space
//                   </Button>
//                   <Button variant="outline" onClick={() => openDetailsDialog(map)}>
//                     View Details
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           ))
//         ) : (
//           <Card className="col-span-full p-6 text-center text-muted-foreground border-dashed border-2">
//             No maps available
//           </Card>
//         )}
//       </div>

//       {/* Create Space Dialog */}
//       <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
//         <DialogContent>
//           <DialogTitle>Create Space</DialogTitle>
//           <DialogDescription>
//             Are you sure you want to create a space from the map "{selectedMap?.name}"?
//           </DialogDescription>
//           <img
//             src={selectedMap?.thumbnail}
//             alt={selectedMap?.name}
//             className="w-full h-40 object-cover rounded mt-4"
//           />
//           <div className="mt-2">
//             Dimensions: {selectedMap?.width} x {selectedMap?.height}
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleConfirmCreate}>
//               Confirm
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* View Details Dialog */}
//       <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
//         <DialogContent>
//           <DialogTitle>{selectedMap?.name}</DialogTitle>
//           <DialogDescription>
//             Dimensions: {selectedMap?.width} x {selectedMap?.height}
//           </DialogDescription>
//           <img
//             src={selectedMap?.thumbnail}
//             alt={selectedMap?.name}
//             className="w-full mt-4 rounded"
//           />
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };


// Map List Page Component
export const MapList = () => {
  const maps = [
    { id: 'map1', title: 'Crystal Caves', description: 'Navigate treacherous glowing caverns, rich with resources and danger.', imageUrl: 'https://placehold.co/600x400/6D28D9/E0E7FF?text=Crystal+Caves', type: 'Exploration', details: 'Supports 1-4 Players', delay:0 },
    { id: 'map2', title: 'Sky Citadel', description: 'A majestic floating fortress offering strategic PvP battles.', imageUrl: 'https://placehold.co/600x400/0E7490/CCFBF1?text=Sky+Citadel', type: 'PvP Arena', details: 'Supports 8-16 Players', delay:100 },
    { id: 'map3', title: 'Forgotten Forest', description: 'Uncover ancient secrets in a dense, mysterious woodland.', imageUrl: 'https://placehold.co/600x400/059669/D1FAE5?text=Forgotten+Forest', type: 'Quest Hub', details: 'Solo & Co-op Quests', delay:200 },
    { id: 'map4', title: 'Neon District', description: 'A cyberpunk city hub for trading and social events.', imageUrl: 'https://placehold.co/600x400/DB2777/FCE7F3?text=Neon+District', type: 'Social Hub', details: 'High Population', delay:300 },
  ];

  return (
    <>   
    <style>{`
        .is-visible { opacity: 1 !important; transform: translateY(0) !important; }
        html { scroll-behavior: smooth; }
        @keyframes rotateBorder { 0% { --angle: 0deg; } 100% { --angle: 360deg; } }
        .animated-border-button { position: relative; display: inline-flex; align-items: center; justify-content: center; z-index: 0; padding: 2.5px; overflow: hidden; text-decoration: none; }
        .animated-border-button::before { content: ''; position: absolute; z-index: -1; top: 0; left: 0; right: 0; bottom: 0; background: conic-gradient(from var(--angle), #a855f7, #38bdf8, #ec4899, #6366f1, #a855f7); border-radius: inherit; animation: rotateBorder 3s linear infinite paused; }
        .animated-border-button:hover::before { animation-play-state: running; }
        .animated-border-button > .inner-content { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: #0f172a; transition: background-color 0.2s ease-in-out; }
        .animated-border-button.rounded-lg > .inner-content { border-radius: calc(0.5rem - 2.5px); }
        .animated-border-button.rounded-xl > .inner-content { border-radius: calc(0.75rem - 2.5px); }
        .animated-border-button.rounded-md > .inner-content { border-radius: calc(0.375rem - 2.5px); } /* For AuthPage button */
        .animated-border-button.w-full.rounded-lg > .inner-content { border-radius: calc(0.5rem - 2.5px); }
        .animated-border-button:hover > .inner-content { background-color: #1e293b; }
      `}</style>
    <AnimatedPageWrapper id="maps" className="bg-slate-900">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
        Discover Maps
      </h2>
      <p className="text-xl text-slate-400 text-center mb-16 md:mb-20 max-w-2xl mx-auto">
        Journey through diverse landscapes and challenges. Each map offers a unique experience in the PixelVerse.
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {maps.map((map, index) => (
          <ItemCard key={map.id} item={map} delay={index * 100} />
        ))}
      </div>
    </AnimatedPageWrapper>
    </>
  );
};

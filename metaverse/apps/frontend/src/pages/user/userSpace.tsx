// import React, { useEffect, useState } from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { useNavigate } from 'react-router-dom';
// import { spaceService } from '@/service/spaceService';

import { ItemCard } from "../admin/Item";
import { AnimatedPageWrapper } from "./Profile";

// interface Space {
//   id: string;
//   name: string;
//   thumbnail: string;
//   dimensions: string;
// }

// export const UserSpace: React.FC = () => {
//   const [spaces, setSpaces] = useState<Space[]>([]);
//   const [filteredSpaces, setFilteredSpaces] = useState<Space[]>([]);
//   const [search, setSearch] = useState('');
//   const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchSpaces = async () => {
//       try {
//         const data = await spaceService.myspace();
//         setSpaces(data.spaces);
//         setFilteredSpaces(data.spaces);
//       } catch (error) {
//         console.error('Error fetching spaces:', error);
//       }
//     };

//     fetchSpaces();
//   }, []);

//   useEffect(() => {
//     const results = spaces.filter(space =>
//       space.name.toLowerCase().includes(search.toLowerCase())
//     );
//     setFilteredSpaces(results);
//   }, [search, spaces]);

//   const handleConfirmJoin = () => {
//     if (selectedSpace) {
//       navigate(`/user/arena/${selectedSpace.id}`);
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-bold mb-4 text-purple-700">Your Spaces</h2>
//       <Input
//         type="text"
//         placeholder="Search spaces..."
//         value={search}
//         onChange={e => setSearch(e.target.value)}
//         className="mb-6 max-w-md"
//       />
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         {filteredSpaces.length > 0 ? (
//           filteredSpaces.map(space => (
//             <Card key={space.id} className="rounded-2xl shadow-md bg-gradient-to-tr from-pink-100 to-blue-100">
//               <img
//                 src={space.thumbnail}
//                 alt={space.name}
//                 className="w-full h-40 object-cover rounded-t-2xl"
//               />
//               <CardContent className="p-4 space-y-2">
//                 <h3 className="text-lg font-semibold text-gray-800">{space.name}</h3>
//                 <p className="text-sm text-gray-600">Size: {space.dimensions}</p>
//                 <div className="flex justify-between items-center mt-4">
//                   <Button variant="outline" onClick={() => navigate(`/spaces/${space.id}`)}>
//                     View
//                   </Button>
//                   <Dialog>
//                     <DialogTrigger asChild>
//                       <Button
//                         onClick={() => setSelectedSpace(space)}
//                         className="bg-purple-600 text-white hover:bg-purple-700"
//                       >
//                         Join
//                       </Button>
//                     </DialogTrigger>
//                     <DialogContent>
//                       <DialogTitle>Join Space</DialogTitle>
//                       <p>
//                         Are you sure you want to join the space "{selectedSpace?.name}"?
//                       </p>
//                       <div className="flex justify-end mt-4 gap-2">
//                         <Button variant="outline" onClick={() => setSelectedSpace(null)}>
//                           Cancel
//                         </Button>
//                         <Button
//                           className="bg-green-600 text-white hover:bg-green-700"
//                           onClick={handleConfirmJoin}
//                         >
//                           Confirm
//                         </Button>
//                       </div>
//                     </DialogContent>
//                   </Dialog>
//                 </div>
//               </CardContent>
//             </Card>
//           ))
//         ) : (
//           <div className="col-span-full text-center p-10 bg-gray-100 rounded-2xl shadow-inner">
//             <p className="text-gray-500">No spaces found. Create or join a space to get started.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };




const UserSpace = () => {
  const spaces = [
    { id: 'space1', title: 'The Cosmic Cafe', description: 'A cozy intergalactic cafe to meet friends and plan adventures.', imageUrl: 'https://placehold.co/600x400/7C3AED/EDE9FE?text=Cosmic+Cafe', type: 'Social Hangout', details: 'Capacity: 50 Users', delay:0 },
    { id: 'space2', title: 'Pixel Art Gallery', description: 'Showcase your creations or admire works from other artists.', imageUrl: 'https://placehold.co/600x400/0891B2/CFFAFE?text=Art+Gallery', type: 'Creative Hub', details: 'Interactive Exhibits', delay:100 },
    { id: 'space3', title: 'Guild Hall Prime', description: 'The central meeting point for the most renowned guilds.', imageUrl: 'https://placehold.co/600x400/047857/D1FAE5?text=Guild+Hall', type: 'Community Space', details: 'Private & Public Rooms', delay:200 },
    { id: 'space4', title: 'Zen Garden Retreat', description: 'A tranquil space for relaxation and quiet contemplation.', imageUrl: 'https://placehold.co/600x400/BE185D/FCE7F3?text=Zen+Garden', type: 'Relaxation Zone', details: 'Ambient Sounds', delay:300 },
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
    <AnimatedPageWrapper id="spaces" className="bg-gradient-to-b from-slate-900 to-slate-950">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
        Explore Spaces
      </h2>
      <p className="text-xl text-slate-400 text-center mb-16 md:mb-20 max-w-2xl mx-auto">
        Find your favorite spots in the PixelVerse, from bustling social hubs to serene personal getaways.
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {spaces.map((space, index) => (
          <ItemCard key={space.id} item={space} delay={index * 100} />
        ))}
      </div>
    </AnimatedPageWrapper></>
  );
};
export default UserSpace;
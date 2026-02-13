import * as Avatar from '@radix-ui/react-avatar';
import React from 'react';

const AvatarGroup = () => {
  const avatars = [
    { src: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100', fallback: 'JD' },
    { src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100', fallback: 'AS' },
    { src: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100', fallback: 'MT' },
    { src: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=100', fallback: 'BK' },
  ];

  return (
    <div className="flex -space-x-3 overflow-hidden">
      {avatars.map((avatar, i) => (
        <Avatar.Root key={i} className="inline-flex h-10 w-10 select-none items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-200">
          <Avatar.Image
            className="h-full w-full object-cover"
            src={avatar.src}
            alt="Customer"
          />
          <Avatar.Fallback className="text-xs font-bold text-slate-600" delayMs={600}>
            {avatar.fallback}
          </Avatar.Fallback>
        </Avatar.Root>
      ))}
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-orange-600 text-[10px] font-black text-white shadow-lg">
        +10k
      </div>
    </div>
  );
};

export default AvatarGroup;

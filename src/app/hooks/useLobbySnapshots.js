import { useCallback, useState } from 'react';

export const useLobbySnapshots = () => {
  const [availableRooms, setAvailableRooms] = useState([]);

  const upsertRoom = useCallback((entry) => {
    if (!entry) return;
    setAvailableRooms((rooms) => {
      const index = rooms.findIndex((item) => item.id === entry.id);
      if (index === -1) {
        return [...rooms, entry];
      }
      const next = rooms.slice();
      next[index] = entry;
      return next;
    });
  }, []);

  const addRoomIfMissing = useCallback((entry) => {
    if (!entry) return;
    setAvailableRooms((rooms) => {
      const exists = rooms.some((item) => item.id === entry.id);
      return exists ? rooms : [...rooms, entry];
    });
  }, []);

  const removeRoom = useCallback((roomId) => {
    setAvailableRooms((rooms) => rooms.filter((room) => room.id !== roomId));
  }, []);

  const resetRooms = useCallback(() => {
    setAvailableRooms([]);
  }, []);

  return {
    availableRooms,
    upsertRoom,
    addRoomIfMissing,
    removeRoom,
    resetRooms,
  };
};

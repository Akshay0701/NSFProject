const BASE_URL = 'api/nsf/room';

const getRoomData = async (roomId) => {
  const response = await fetch(`${BASE_URL}/get-room/${roomId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch room data');
  }
  return await response.json();
};

const addProfileToRoom = async ({ roomID, name, email, description }) => {
  const response = await fetch(`${BASE_URL}/add-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ RoomID: roomID, name, email, description }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add profile to room');
  }

  return response.json();
};

const removeProfileFromRoom = async ({ roomID, email, senderEmail }) => {
  const response = await fetch(`${BASE_URL}/remove-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ RoomID: roomID, email, sender_email: senderEmail }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove profile from room');
  }

  return response.json();
};

const createRoom = async (creatorID) => {
  const response = await fetch(`${BASE_URL}/create-room`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creator_id: creatorID }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create room');
  }

  return response.json();  // { message: "...", RoomID: "..." }
};

const getRoomsByEmail = async (email) => {
  const response = await fetch(`${BASE_URL}/get-rooms-by-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch rooms by email');
  }

  return response.json();  // { rooms: [...] }
};

const removeRoomData = async ({roomID, email}) => {
  const response = await fetch(`${BASE_URL}/remove-room`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ RoomID: roomID, email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete room');
  }

  return response.json();  
}

const createTeamsFromRoom = async (roomID) => {
  const response = await fetch(`${BASE_URL}/create-team`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ RoomID: roomID }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create teams');
  }

  return response.json();  // { teams: [...] }
};

const getTeamsByRoom = async (roomID) => {
  const response = await fetch(`${BASE_URL}/get-teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ RoomID: roomID }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch teams');
  }

  return response.json(); // Expected to be an array of teams
};

export default {
  getRoomData,
  getTeamsByRoom,
  addProfileToRoom,
  removeProfileFromRoom,
  createRoom,
  getRoomsByEmail,
  removeRoomData,
  createTeamsFromRoom,
};
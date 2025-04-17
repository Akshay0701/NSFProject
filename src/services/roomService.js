const BASE_URL = '/api/nsf/room';

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

const createRoom = async (creatorID, roomID = null) => {
  const bodyData = {
    creator_id: creatorID,
  };

  if (roomID) {
    bodyData.RoomID = roomID;  // Send custom Room ID to backend
  }

  const response = await fetch(`${BASE_URL}/create-room`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create room');
  }

  return response.json();  // returns { message, RoomID }
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

const getAddedRoomsByEmail = async (email) => {
  const response = await fetch(`${BASE_URL}/get-added-room`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch added rooms');
  }

  return response.json(); // Expected to be { rooms: [...] }
};

const saveFundedProjects = async (roomID, projectAbstracts) => {
  const response = await fetch(`${BASE_URL}/save-funded-projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      RoomID: roomID,
      projects: projectAbstracts, // should be an array of abstract strings
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save funded projects');
  }

  return await response.json(); // { message: "...", funded_projects: { ... } }
};


const getFundedProjects = async (roomID) => {
  const response = await fetch(`${BASE_URL}/get-funded-projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      RoomID: roomID,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch funded projects');
  }

  return await response.json(); // { room_id, projects: { project_1: "...", project_2: "..." } }
};

const updateKeywordsForNSFSolicitaion = async (roomID, keywords) => {
  const response = await fetch(`${BASE_URL}/update-keywords-nsf-solicitation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      RoomID: roomID,
      keywords: keywords
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update keywords for NSF');
  }

  return await response.json(); // { room_id, projects: { project_1: "...", project_2: "..." } }
};

export default {
  getRoomData,
  saveFundedProjects,
  getFundedProjects,
  updateKeywordsForNSFSolicitaion,
  getTeamsByRoom,
  getAddedRoomsByEmail,
  addProfileToRoom,
  removeProfileFromRoom,
  createRoom,
  getRoomsByEmail,
  removeRoomData,
  createTeamsFromRoom,
};
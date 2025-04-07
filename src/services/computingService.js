const BASE_URL = '/api/nsf/room';

const generateProposalsForRoom = async (roomID) => {
  const response = await fetch(`${BASE_URL}/generate-proposals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ RoomID: roomID }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate proposals');
  }

  return response.json();  // { teams: [...] }
};

const getExtractedKeywords = async (roomID) => {
  const response = await fetch(`${BASE_URL}/get-extracted-keywords`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ RoomID: roomID }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get extracted keywords');
  }

  return await response.json();
};

const extractResearchKeywords = async (roomID) => {
  const response = await fetch(`${BASE_URL}/extract-keywords`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ RoomID: roomID }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to extract research keywords');
  }

  return response.json();  // { extracted_keywords: [...] }
};

const extractTextFromPDF = async (pdfFile) => {
  const formData = new FormData();
  formData.append('pdf', pdfFile);

  const response = await fetch(`${BASE_URL}/extract-pdf-text`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to extract text from PDF');
  }

  return response.json(); 
};

const extractTextFromLink = async (link) => {
  const response = await fetch(`${BASE_URL}/extract-link-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: link }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to extract research keywords');
  }

  return response.json();  // { url: [...], text : "" }
};

export default {
  extractTextFromPDF,
  extractResearchKeywords,
  generateProposalsForRoom,
  getExtractedKeywords,
  extractTextFromLink,
};
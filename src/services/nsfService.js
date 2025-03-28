const BASE_URL = '/api/nsf';

// Extract research interests from profiles
const extractInterests = async (profiles) => {
  const formData = new FormData();
  const apiData = profiles.map((profile) => ({
    name: profile.name,
    description: profile.text,
  }));

  formData.append('profiles', JSON.stringify(apiData));
  profiles.forEach((profile, index) => {
    if (profile.pdfFile) {
      formData.append(`pdf${index}`, profile.pdfFile);
    }
  });

  const response = await fetch(`${BASE_URL}/extract_interests`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch research interests');
  }

  return response.json();
};

// Create research teams from extracted profiles
const createTeams = async (extractedProfiles) => {
  const response = await fetch(`${BASE_URL}/teamcreation`, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(extractedProfiles),
  });

  if (!response.ok) {
    throw new Error('Failed to create teams');
  }

  return response.json();
};

// Generate project proposals for teams
const generateProposals = async (teams) => {
  const response = await fetch(`${BASE_URL}/generate-proposals`, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(teams),
  });

  if (!response.ok) {
    throw new Error('Failed to generate proposals');
  }

  return response.json();
};

export default {
  extractInterests,
  createTeams,
  generateProposals,
};
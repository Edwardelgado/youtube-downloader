import { RAPIDAPI_KEY, RAPIDAPI_HOST } from '../constants/config';

export const fetchVideoDetails = async (videoId) => {
  const response = await fetch(
    `https://${RAPIDAPI_HOST}/v2/video/details?videoId=${videoId}`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY
      }
    }
  );
  return response.json();
};

export const fetchDownloadLink = async (videoId) => {
  // CORRECCIÓN: Este es el endpoint correcto según RapidAPI
  const response = await fetch(
    `https://${RAPIDAPI_HOST}/v2/video/details?videoId=${videoId}`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY
      }
    }
  );
  return response.json();
};
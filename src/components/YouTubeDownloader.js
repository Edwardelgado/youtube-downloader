import React, { useState } from 'react';
import { Download, Video, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { extractVideoId } from '../utils/videoHelpers';
import { fetchVideoDetails, fetchDownloadLink } from '../services/youtubeApi';

export default function YouTubeDownloader() {
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState('720');
  const [status, setStatus] = useState('idle');
  const [videoInfo, setVideoInfo] = useState(null);
  const [error, setError] = useState('');

  const getVideoDetails = async () => {
    if (!url) {
      setError('Por favor ingresa una URL válida');
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
        setError('');
      }, 3000);
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      setError('URL de YouTube inválida');
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
        setError('');
      }, 3000);
      return;
    }

    setStatus('loading');
    setError('');

    try {
      const data = await fetchVideoDetails(videoId);
      setVideoInfo(data);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'Error de conexión con la API');
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
        setError('');
      }, 5000);
    }
  };

  const downloadVideo = async () => {
    if (!videoInfo) return;

    setStatus('downloading');
    
    try {
        const videoId = extractVideoId(url);
        const data = await fetchDownloadLink(videoId);
        
        if (data && data.videos && data.videos.items && data.videos.items.length > 0) {
        // Filtrar solo videos MP4 con audio
        const mp4Videos = data.videos.items.filter(v => 
            v.extension === 'mp4' && v.hasAudio === true
        );
        
        if (mp4Videos.length === 0) {
            throw new Error('No hay videos MP4 disponibles con audio');
        }
        
        // Buscar la calidad deseada o superior
        const qualityNum = parseInt(quality);
        let selectedVideo = mp4Videos.find(v => {
            const videoQuality = parseInt(v.quality);
            return videoQuality >= qualityNum;
        });
        
        // Si no encuentra la calidad, usa la mejor disponible
        if (!selectedVideo) {
            selectedVideo = mp4Videos.reduce((prev, current) => {
            return (parseInt(current.quality) > parseInt(prev.quality)) ? current : prev;
            });
        }
        
        if (selectedVideo && selectedVideo.url) {
            window.open(selectedVideo.url, '_blank');
            setStatus('completed');
            setTimeout(() => {
            setStatus('idle');
            setVideoInfo(null);
            setUrl('');
            }, 3000);
        } else {
            throw new Error('No se encontró URL de descarga');
        }
        } else {
        throw new Error('No se encontraron videos disponibles');
        }
    } catch (err) {
        console.error('Error completo:', err);
        setError(err.message || 'Error al generar el enlace de descarga');
        setStatus('error');
        setTimeout(() => {
        setStatus('idle');
        setError('');
        }, 5000);
    }
    };
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/logo.svg" 
              alt="YouTube Downloader Logo" 
              className="w-24 h-24 drop-shadow-2xl"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            YouTube Downloader
          </h1>
          <p className="text-white/80 text-lg">
            Descarga videos en alta calidad
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide">
              URL del Video
            </label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors text-gray-700"
                disabled={status === 'loading' || status === 'downloading'}
              />
              <Video className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide">
              Calidad Mínima
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: '720p', value: '720' },
                { label: '1080p', value: '1080' },
                { label: '1440p', value: '1440' },
                { label: '4K', value: '2160' }
              ].map((q) => (
                <button
                  key={q.value}
                  onClick={() => setQuality(q.value)}
                  disabled={status === 'loading' || status === 'downloading'}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                    quality === q.value
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${(status === 'loading' || status === 'downloading') ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {videoInfo && status === 'success' && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-purple-200">
              <div className="flex gap-4">
                {videoInfo.thumbnail && (
                  <img 
                    src={videoInfo.thumbnail} 
                    alt="Thumbnail" 
                    className="w-32 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-1 line-clamp-2">
                    {videoInfo.title || 'Video encontrado'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {videoInfo.author || 'Autor desconocido'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {status === 'completed' && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <p className="text-green-800 font-semibold">
                ¡Enlace de descarga abierto en nueva pestaña!
              </p>
            </div>
          )}

          {status === 'error' && error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <p className="text-red-800 font-semibold">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            {!videoInfo ? (
              <button
                onClick={getVideoDetails}
                disabled={status === 'loading'}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg ${
                  status === 'loading'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 active:scale-95'
                } text-white flex items-center justify-center gap-3`}
              >
                {status === 'loading' ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    Obteniendo información...
                  </>
                ) : (
                  <>
                    <Video className="w-6 h-6" />
                    Obtener Video
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={downloadVideo}
                disabled={status === 'downloading'}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg ${
                  status === 'downloading'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 transform hover:scale-105 active:scale-95'
                } text-white flex items-center justify-center gap-3`}
              >
                {status === 'downloading' ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    Generando enlace...
                  </>
                ) : (
                  <>
                    <Download className="w-6 h-6" />
                    Descargar Video MP4
                  </>
                )}
              </button>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs text-blue-800 text-center leading-relaxed">
              <strong>Nota:</strong> Esta app usa la API de RapidAPI. El plan gratuito tiene límites de uso diarios.
            </p>
          </div>
        </div>
        {/* Footer */}
        <div className="text-center mt-6 space-y-3">
        <div className="flex flex-col items-center gap-2">
   
            <div className="flex items-center gap-2 text-white/90 text-sm bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
           
            <span className="font-medium">Developer by Ing. Delgado Ruiz Edward Freddy</span>
            </div>
        </div>
        </div>
        
      </div>
    </div>
  );
}
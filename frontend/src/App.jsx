import React, { useState, useEffect } from 'react';
import './index.css'; // Asegúrate de que Tailwind CSS esté importado

function App() {
  const [activeTab, setActiveTab] = useState('current');
  const [currentFact, setCurrentFact] = useState(null);
  const [currentGifUrl, setCurrentGifUrl] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // URL base de la API del backend
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Función para obtener un nuevo dato y el GIF asociado
  const fetchNewFactAndGif = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('GOLADA')
      // 1. Obtener un nuevo dato de gato
      const factResponse = await fetch(`${API_BASE_URL}/api/fact`);
      if (!factResponse.ok) {
        throw new Error(`Error al obtener el dato: ${factResponse.statusText}`);
      }
      const factData = await factResponse.json();
      const newFactText = factData.fact;
      // 2. Obtener un GIF para el nuevo dato y guardarlo
      const gifResponse = await fetch(`${API_BASE_URL}/api/gif?query=${encodeURIComponent(newFactText)}`);
      
      if (!gifResponse.ok) {
        throw new Error(`Error al obtener el GIF: ${gifResponse.statusText}`);
      }
      const gifData = await gifResponse.json();
      const gifUrl = gifData.data[0]?.images?.downsized_medium?.url || null;
      console.log('REFRESCANDO ')
      setCurrentFact(newFactText); 
      setCurrentGifUrl(gifUrl);
      const historyEntry = {
        fact: newFactText,
        query: newFactText,
        gifUrl: gifUrl
      };
      const saveResponse = await fetch(`${API_BASE_URL}/api/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(historyEntry)
    });
        if (!saveResponse.ok) {
      console.warn(`No se pudo guardar en el historial: ${saveResponse.statusText}`);
    }

    } catch (err) {
      console.error("Error al obtener el dato y el GIF:", err);
      setError("No se pudo cargar el dato o el GIF. Inténtalo de nuevo más tarde.");
      setCurrentFact(null);
      setCurrentGifUrl(null);
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar solo el GIF para el dato actual
  const refreshGif = async () => {
    if (!currentFact) return; 
    setLoading(true);
    setError(null);
    try {
      const gifResponse = await fetch(`${API_BASE_URL}/api/gif?query=${encodeURIComponent(currentFact)}`);
      if (!gifResponse.ok) {
        throw new Error(`Error al refrescar el GIF: ${gifResponse.statusText}`);
      }
      const gifData = await gifResponse.json();
      const gifUrl = gifData.data[0]?.images?.downsized_medium?.url || null;
      console.log('REFRESCANDO MISMO PALABRA')
      setCurrentGifUrl(gifUrl);
    } catch (err) {
      console.error("Error al refrescar el GIF:", err);
      setError("No se pudo refrescar el GIF. Inténtalo de nuev222o.");
      setCurrentGifUrl(null);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el historial de búsquedas
  const fetchSearchHistory = async () => {
    setError(null);
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/history`);
      if (!response.ok) {
        throw new Error(`Error al obtener el historial: ${response.statusText}`);
      }
      const historyData = await response.json();
      setSearchHistory(historyData);
    } catch (err) {
      console.error("error al obtener el historial de busquedas  ", err);
      setError("No se pudo cargar el historial de búsqueda");
      setSearchHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial: Obtener un dato y un GIF
  useEffect(() => {
    fetchNewFactAndGif();
  }, []);

  // Obtener historial cuando la pestaña de historial esté activa
  useEffect(() => {
    if (activeTab === 'history') {
      fetchSearchHistory();
    }
  }, [activeTab]);

  return (
    <div className="p-4 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-4">CatFact & Giphy App /Ali Paez</h1>
      <div className="flex justify-center mb-4">
        <button
          className={`px-4 py-2 mr-2 rounded ${activeTab === 'current' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('current')}
        >
          Resultado Actual
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'history' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('history')}
        >
          Historial de Búsquedas
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
          {error}
        </div>
      )}

      {activeTab === 'current' && (
        <div className="text-center">
          {loading ? (
            <p>Cargando dato y GIF...</p>
          ) : (
            <>
              {currentGifUrl && (
                <img
                  src={currentGifUrl}
                  alt="Cat GIF"
                  className="mx-auto my-4 max-w-full h-auto"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/300x200/CCCCCC/000000?text=GIF+No+Disponible";
                  }}
                />
              )}
              <p className="mb-4">{currentFact || "Obteniendo un dato de gatos..."}</p>
              <div className="flex justify-center space-x-2">
                <button
                  onClick={refreshGif}
                  disabled={loading || !currentFact}
                  className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
                >
                  Recargar GIF
                </button>
                <button
                  onClick={fetchNewFactAndGif}
                  disabled={loading}
                  className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
                >
                  Cargar Nuevo Dato y GIF
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {activeTab === 'history' && (
        <div>
          <h2 className="text-xl font-bold mb-3 text-center">Historial</h2>
          {loading ? (
            <p className="text-center">cargando historial...</p>
          ) : searchHistory && searchHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Fecha</th>
                    <th className="py-2 px-4 border-b">dato Completo</th>
                    <th className="py-2 px-4 border-b">query</th>
                    <th className="py-2 px-4 border-b">gif</th>
                  </tr>
                </thead>
                <tbody>
                  {searchHistory.map((entry) => (
                    <tr key={entry.id} className="text-sm">
                      <td className="py-2 px-4 border-b">
                        {new Date(entry.date).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 border-b">{entry.fact}</td>
                      <td className="py-2 px-4 border-b">{entry.query}</td>
                      <td className="py-2 px-4 border-b">
                        {entry.gifUrl && (
                          <a href={entry.gifUrl} target="_blank" rel="noopener noreferrer">
                            <img
                              src={entry.gifUrl}
                              alt="GIF"
                              className="w-16 h-12 object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/64x48/CCCCCC/000000?text=N/A";
                              }}
                            />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center">Aun no hay busquedas en el historial.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

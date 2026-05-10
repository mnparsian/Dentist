import React, { useEffect, useState } from 'react';
import { Search, Edit2, Trash2, Calendar, Phone, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the API is available (Electron context)
    if (window.api && window.api.getPatients) {
      window.api.getPatients().then((data) => {
        setPatients(data);
        setIsLoading(false);
      }).catch(err => {
        console.error("Failed to load patients:", err);
        setIsLoading(false);
      });
    } else {
      // Mock data for web browser preview
      setTimeout(() => {
        setPatients([
          { id: '1', firstName: 'Mario', lastName: 'Rossi', phone: '+39 333 1234567', lastVisit: '2026-04-15', status: 'Attivo' },
          { id: '2', firstName: 'Giulia', lastName: 'Bianchi', phone: '+39 345 9876543', lastVisit: '2026-05-02', status: 'In Trattamento' },
          { id: '3', firstName: 'Luca', lastName: 'Verdi', phone: '+39 320 5556667', lastVisit: '2025-11-20', status: 'Richiamo' },
        ]);
        setIsLoading(false);
      }, 800);
    }
  }, []);

  return (
    <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Archivio Pazienti</h1>
          <p className="text-sm text-gray-500 mt-1">Gestisci i profili e le anagrafiche dei tuoi pazienti</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Cerca per nome o telefono..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-500 transition-all text-sm"
          />
        </div>
        <div className="flex gap-2">
          <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-dental-500">
            <option>Tutti gli stati</option>
            <option>Attivo</option>
            <option>In Trattamento</option>
            <option>Richiamo</option>
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-dental-200 border-t-dental-500 rounded-full animate-spin mb-4"></div>
            Caricamento pazienti...
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 font-semibold">Paziente</th>
                <th className="px-6 py-4 font-semibold">Contatti</th>
                <th className="px-6 py-4 font-semibold">Ultima Visita</th>
                <th className="px-6 py-4 font-semibold">Stato</th>
                <th className="px-6 py-4 font-semibold text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patients.map((patient) => (
                <tr 
                  key={patient.id} 
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className="hover:bg-dental-50/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-dental-100 text-dental-600 flex items-center justify-center font-bold">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{patient.firstName} {patient.lastName}</div>
                        <div className="text-xs text-gray-500">ID: {patient.id.padStart(5, '0')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {patient.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {patient.lastVisit || 'Mai'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      patient.status === 'Attivo' ? 'bg-green-50 text-green-700 border-green-200' :
                      patient.status === 'In Trattamento' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-orange-50 text-orange-700 border-orange-200'
                    }`}>
                      {patient.status || 'Attivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-dental-600 hover:bg-dental-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {patients.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    Nessun paziente trovato. Clicca su "+ Nuovo Paziente" per iniziare.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

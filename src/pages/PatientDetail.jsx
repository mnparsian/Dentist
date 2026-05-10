import React, { useState } from 'react';
import { ChevronLeft, Edit3, Trash2, Copy, CheckSquare, XSquare, PlusSquare, List, Phone, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HybridOdontogram from '../components/Odontogram/HybridOdontogram';

export default function PatientDetail() {
  const [activeTab, setActiveTab] = useState('Odontogramma');
  const [quoteFilter, setQuoteFilter] = useState('all');
  const navigate = useNavigate();

  const tabs = [
    'Anagrafica', 'Odontogramma', 'Prestazioni', 'Preventivi', 'Pagamenti', 'Visite', 'Documenti', 'Note'
  ];

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 overflow-hidden">
      
      {/* 1. Header Section - Ultra Compact */}
      <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/patients')} 
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors" 
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-dental-100 text-dental-600 rounded-full flex items-center justify-center text-sm font-bold shadow-inner">
              AS
            </div>
            <div className="flex items-baseline gap-6">
              <h1 className="text-xl font-bold text-gray-800 tracking-tight">ABBASZADE SHAHIN</h1>
              <div className="flex items-center gap-4 text-[11px] text-gray-500">
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5"/> 686</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5"/> +39 333 1234567</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> Ultima visita: 11/03/2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Tabs - Compact */}
      <div className="bg-white px-6 border-b border-gray-200 shrink-0 flex gap-4">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-1 font-bold text-xs transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab 
                ? 'border-dental-500 text-dental-700' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-gray-50/50 p-4">
        
        {/* TAB: ANAGRAFICA & IMPOSTAZIONI CLINICHE */}
        {activeTab === 'Anagrafica' && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">Dati Clinici Principali</h2>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inizio cure</label>
                <input type="date" defaultValue="2024-03-11" className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-dental-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operatore</label>
                <select className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-dental-500 transition-all">
                  <option>STUDIORM</option>
                  <option>Dott. Rossi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Cura</label>
                <input type="text" placeholder="Es. Ortodonzia" className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-dental-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cartella</label>
                <input type="text" value="Aperta" disabled className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed" />
              </div>
            </div>
          </div>
        )}

        {/* TAB: ODONTOGRAMMA */}
        {activeTab === 'Odontogramma' && (
          <div className="flex-1 min-h-0 w-full">
            <HybridOdontogram />
          </div>
        )}

        {/* TAB: PREVENTIVI */}
        {activeTab === 'Preventivi' && (
          <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Filters */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="filter" value="all" checked={quoteFilter === 'all'} onChange={() => setQuoteFilter('all')} className="text-dental-600 focus:ring-dental-500 w-4 h-4" />
                  <span className="text-gray-700 font-medium">Tutti i preventivi</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="filter" value="not_accepted" checked={quoteFilter === 'not_accepted'} onChange={() => setQuoteFilter('not_accepted')} className="text-dental-600 focus:ring-dental-500 w-4 h-4" />
                  <span className="text-gray-700 font-medium">Non accettati</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="filter" value="accepted" checked={quoteFilter === 'accepted'} onChange={() => setQuoteFilter('accepted')} className="text-dental-600 focus:ring-dental-500 w-4 h-4" />
                  <span className="text-gray-700 font-medium">Accettati in questa cartella</span>
                </label>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 rounded-lg">
                  <tr>
                    <th className="p-3 font-semibold text-gray-600 text-sm w-12 text-center rounded-l-lg">Stato</th>
                    <th className="p-3 font-semibold text-gray-600 text-sm">Rif Prev</th>
                    <th className="p-3 font-semibold text-gray-600 text-sm">Data</th>
                    <th className="p-3 font-semibold text-gray-600 text-sm">Descrizione</th>
                    <th className="p-3 font-semibold text-gray-600 text-sm text-right">Totale (€)</th>
                    <th className="p-3 font-semibold text-gray-600 text-sm text-right">Accettato (€)</th>
                    <th className="p-3 font-semibold text-gray-600 text-sm rounded-r-lg">Scadenza</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-green-50/50 hover:bg-green-50 transition-colors cursor-pointer group">
                    <td className="p-3 text-center"><CheckSquare className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="p-3 font-medium text-gray-800">11</td>
                    <td className="p-3 text-gray-600">11/03/2024</td>
                    <td className="p-3 text-gray-600">Cura Ortodontica Completa</td>
                    <td className="p-3 text-gray-800 text-right font-bold">4.000,00</td>
                    <td className="p-3 text-green-700 text-right font-bold">4.000,00</td>
                    <td className="p-3 text-gray-600">28/02/2024</td>
                  </tr>
                  {/* Mock Empty Rows */}
                  {Array(4).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="p-4"></td><td></td><td></td><td></td><td></td><td></td><td></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-center gap-6 p-4 border-t border-gray-100 bg-white">
              <ToolbarButton icon={<PlusSquare className="w-5 h-5" />} label="Nuovo" />
              <ToolbarButton icon={<Edit3 className="w-5 h-5" />} label="Modifica" />
              <ToolbarButton icon={<Copy className="w-5 h-5" />} label="Copia" />
              <ToolbarButton icon={<XSquare className="w-5 h-5 text-red-500" />} label="Elimina" />
              <div className="w-px h-8 bg-gray-200 mx-2"></div>
              <ToolbarButton icon={<CheckSquare className="w-5 h-5 text-green-600" />} label="Accetta" />
              <ToolbarButton icon={<List className="w-5 h-5" />} label="Multi-sel." />
            </div>

            {/* Financial Summary ONLY for Preventivi Tab */}
            <div className="bg-gray-800 text-white p-6 grid grid-cols-4 gap-8">
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-400">Fuori preventivo</span><span className="font-semibold">€ 100,00</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Preventivo</span><span className="font-semibold">€ 4.000,00</span></div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-400">Da eseguire</span><span className="font-semibold">€ 2.540,00</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Eseguito</span><span className="font-semibold">€ 2.641,80</span></div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-400">Pagato</span><span className="font-semibold text-green-400">€ 2.557,00</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Sconto</span><span className="font-semibold">0%</span></div>
              </div>
              <div className="space-y-3 border-l border-gray-600 pl-8">
                <div className="flex justify-between text-sm"><span className="text-gray-400">Saldo totale</span><span className="font-semibold">€ 2.568,80</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-300 font-bold">SALDO ATTUALE</span><span className="font-bold text-xl text-red-400">€ 28,80</span></div>
              </div>
            </div>

          </div>
        )}

        {/* OTHER TABS */}
        {['Prestazioni', 'Pagamenti', 'Visite', 'Documenti', 'Note'].includes(activeTab) && (
          <div className="flex h-full items-center justify-center text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-center">
              <div className="text-4xl mb-4">🚧</div>
              <h3 className="text-lg font-medium text-gray-600">Sezione {activeTab} in costruzione</h3>
              <p className="text-sm mt-2">Questa sezione è stata separada per mantenere l'interfaccia pulita.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const ToolbarButton = ({ icon, label }) => (
  <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors border border-gray-200 hover:border-gray-300 shadow-sm">
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

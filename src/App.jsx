import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Users, CreditCard, Settings, Menu, Bell, Printer } from 'lucide-react';
import OnboardingWizard from './components/Wizard/OnboardingWizard';
import HybridOdontogram from './components/Odontogram/HybridOdontogram';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import Finance from './pages/Finance';
import Reports from './pages/Reports';

const Sidebar = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', name: 'Dashboard', icon: Activity },
    { path: '/patients', name: 'Pazienti', icon: Users },
    { path: '/finance', name: 'Contabilità', icon: CreditCard },
    { path: '/reports', name: 'Stampe', icon: Printer },
    { path: '/settings', name: 'Impostazioni', icon: Settings },
  ];

  return (
    <div className="w-64 bg-dental-900 text-white h-screen flex flex-col shadow-xl">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-dental-500 rounded-lg flex items-center justify-center font-bold text-xl">D</div>
        <span className="text-xl font-bold tracking-wide">DentalSys</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-dental-600 text-white shadow-md' : 'text-dental-100 hover:bg-dental-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-dental-800">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-10 h-10 rounded-full bg-dental-700 flex items-center justify-center font-bold">DR</div>
          <div>
            <div className="text-sm font-bold">Dr. Rossi</div>
            <div className="text-xs text-dental-300">Dentista Principale</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Topbar = ({ onNewPatient }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async (val) => {
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      return;
    }

    if (window.api && window.api.getPatients) {
      const all = await window.api.getPatients();
      const filtered = all.filter(p => 
        p.firstName.toLowerCase().includes(val.toLowerCase()) || 
        p.lastName.toLowerCase().includes(val.toLowerCase()) ||
        p.phone.includes(val)
      ).slice(0, 5); // Limit to 5 results
      setResults(filtered);
    }
  };

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shadow-sm z-50 relative">
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-gray-600 lg:hidden"><Menu /></button>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Cerca paziente (nome, telefono...)" 
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-96 pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-500 focus:bg-white transition-all text-sm"
          />
          {results.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
              {results.map(p => (
                <button 
                  key={p.id}
                  onClick={() => {
                    navigate(`/patients/${p.id}`);
                    setQuery('');
                    setResults([]);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-dental-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="w-8 h-8 bg-dental-100 text-dental-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                    {p.firstName[0]}{p.lastName[0]}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-800">{p.firstName} {p.lastName}</div>
                    <div className="text-[10px] text-gray-400">{p.phone}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button className="relative text-gray-400 hover:text-dental-500 transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button 
          onClick={onNewPatient}
          className="bg-dental-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-dental-700 shadow-md hover:shadow-lg transition-all"
        >
          + Nuovo Paziente
        </button>
      </div>
    </header>
  );
};

const Dashboard = () => (
  <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Panoramica Odierna</h1>
      <p className="text-gray-500">10 Maggio 2026 - 4 Appuntamenti in programma</p>
    </div>
    
    <div className="grid grid-cols-3 gap-6">
      {/* Metrics */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-gray-500 text-sm font-medium mb-1">Entrate Odierne</div>
        <div className="text-3xl font-bold text-gray-800">€ 1.250</div>
        <div className="text-green-500 text-sm font-medium mt-2 flex items-center gap-1">↑ 12% vs Ieri</div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-gray-500 text-sm font-medium mb-1">Nuovi Pazienti (Mese)</div>
        <div className="text-3xl font-bold text-gray-800">14</div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
        <div className="text-gray-500 text-sm font-medium mb-1">Fatture Scadute</div>
        <div className="text-3xl font-bold text-red-600">3</div>
        <div className="text-sm text-gray-500 mt-2">Valore: € 850</div>
      </div>
    </div>

    {/* Embed Odontogram just for demo purposes on the dashboard */}
    <div className="mt-8">
      <HybridOdontogram />
    </div>
  </div>
);

export default function App() {
  const [showWizard, setShowWizard] = useState(false);

  return (
    <Router>
      <div className="flex w-screen h-screen bg-gray-50 font-sans overflow-hidden">
        <div className="no-print">
          <Sidebar />
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="no-print">
            <Topbar onNewPatient={() => setShowWizard(true)} />
          </div>

          
          <main className="flex-1 flex overflow-hidden bg-gray-50/50">
            <div className="flex-1 flex flex-col w-full h-full min-h-0">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/patients/:id" element={<PatientDetail />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<div className="p-8">Impostazioni Page</div>} />
              </Routes>
            </div>
          </main>
        </div>

        {showWizard && (
          <OnboardingWizard 
            onComplete={async (data) => {
              const newPatient = {
                ...data,
                id: Date.now().toString(), // Database primary key
                status: 'Attivo',
                lastVisit: 'Nessuna',
                odontogram: {},
                treatments: [],
                quotes: [],
                payments: [],
                visits: [],
                documents: []
              };
              
              await window.api.updatePatient(newPatient);
              setShowWizard(false);
              // Force refresh or redirect if needed
              window.location.reload(); 
            }} 
            onCancel={() => setShowWizard(false)} 
          />
        )}
      </div>
    </Router>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  User, Phone, Mail, MapPin, Calendar, CreditCard, Activity, 
  ChevronLeft, Save, PlusSquare, Trash2, Edit3, Clipboard, 
  Search, CheckSquare, List, Clock, Copy, AlertCircle, X, 
  Home, Briefcase, XSquare 
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import HybridOdontogram from '../components/Odontogram/HybridOdontogram';

// Browser Fallback for window.api (when not running in Electron)
if (typeof window !== 'undefined' && !window.api) {
  window.api = {
    getPatients: async () => [{ id: '1', firstName: 'Shahin', lastName: 'Abbaszade', phone: '+39 333 1234567' }],
    getSettingsLists: async () => ({
      treatmentTypes: ['Ortodonzia', 'Conservativa', 'Endodonzia', 'Chirurgia', 'Protesi', 'Igiene', 'Implantologia'],
      geography: {
        provinces: [
          { code: 'RM', name: 'Roma' },
          { code: 'MI', name: 'Milano' },
          { code: 'NA', name: 'Napoli' },
          { code: 'TO', name: 'Torino' },
          { code: 'FI', name: 'Firenze' }
        ],
        cities: {
          'RM': ['Roma', 'Guidonia Montecelio', 'Fiumicino', 'Pomezia'],
          'MI': ['Milano', 'Sesto San Giovanni', 'Cinisello Balsamo', 'Legnano'],
          'NA': ['Napoli', 'Giugliano in Campania', 'Torre del Greco', 'Pozzuoli'],
          'TO': ['Torino', 'Moncalieri', 'Rivoli', 'Collegno'],
          'FI': ['Firenze', 'Scandicci', 'Sesto Fiorentino', 'Empoli']
        },
        zipCodes: {
          'Roma': ['00118', '00121', '00122', '00123', '00124', '00125', '00126'],
          'Milano': ['20121', '20122', '20123', '20124', '20125', '20126'],
          'Napoli': ['80121', '80122', '80123', '80124', '80125'],
          'Torino': ['10121', '10122', '10123', '10124', '10125'],
          'Firenze': ['50121', '50122', '50123', '50124', '50125'],
          'Guidonia Montecelio': ['00012'],
          'Fiumicino': ['00054'],
          'Pomezia': ['00040']
        }
      }
    }),
    getPatientById: async (id) => ({
      id: id || '1',
      firstName: 'Shahin',
      lastName: 'Abbaszade',
      gender: 'M',
      dob: '1990-05-15',
      placeOfBirth: 'Tehran',
      codiceFiscale: 'BBS SHN 90E15 Z330V',
      profession: 'Ingegnere',
      phone: '+39 333 1234567',
      landline: '02 1234567',
      email: 'shahin@example.com',
      address: 'Via Roma 123',
      city: 'Roma',
      zipCode: '00118',
      province: 'RM',
      operator: 'STUDIORM',
      treatmentType: 'Ortodonzia',
      status: 'ACTIVE',
      startDate: '2024-03-11',
      lastVisit: '2024-03-11',
      allergies: 'Penicillina, Pollini',
      pathologies: 'Nessuna patologia cronica',
      medications: 'Nessuno',
      notes: 'Paziente collaborativo'
    }),
    updatePatient: async (data) => { console.log("Mock Update:", data); return { success: true }; }
  };
}

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Anagrafica');
  const [quoteFilter, setQuoteFilter] = useState('all');
  const [patient, setPatient] = useState(null);
  const [lists, setLists] = useState({ treatmentTypes:[], geography: { provinces:[], cities:{}, zipCodes:{} } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const [patientData, settingsData] = await Promise.all([
          window.api.getPatientById(id || '1'),
          window.api.getSettingsLists()
        ]);
        if (patientData) setPatient(patientData);
        if (settingsData) setLists(settingsData);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id]);

  const handleSave = async () => {
    if (!patient) return;
    setSaving(true);
    try {
      await window.api.updatePatient(patient);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [newTx, setNewTx] = useState({ date: new Date().toISOString().split('T')[0], description: '', price: '', tooth: '' });
  
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [newQuote, setNewQuote] = useState({ date: new Date().toISOString().split('T')[0], description: '', total: '' });

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [newPay, setNewPay] = useState({ date: new Date().toISOString().split('T')[0], amount: '', method: 'Contanti', note: '' });

  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [newVisit, setNewVisit] = useState({ date: new Date().toISOString().split('T')[0], title: '', notes: '' });

  const [selectedDoc, setSelectedDoc] = useState(null);

  const handleDeleteDocument = async (docIndex) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo documento?")) return;
    
    const updatedDocs = [...(patient.documents || [])];
    updatedDocs.splice(docIndex, 1);
    
    const updatedPatient = {
      ...patient,
      documents: updatedDocs
    };

    setPatient(updatedPatient);
    await window.api.updatePatient(updatedPatient);
  };

  const handleAddTreatment = async () => {
    if (!newTx.description || !newTx.price) return;
    
    const treatment = {
      ...newTx,
      price: parseFloat(newTx.price),
      operator: patient.operator || 'Dr. Rossi'
    };

    const updatedPatient = {
      ...patient,
      treatments: [...(patient.treatments || []), treatment]
    };

    setPatient(updatedPatient);
    setIsTxModalOpen(false);
    setNewTx({ date: new Date().toISOString().split('T')[0], description: '', price: '', tooth: '' });
    
    // AUTO-SAVE
    await window.api.updatePatient(updatedPatient);
  };

  const handleAddQuote = async () => {
    if (!newQuote.description || !newQuote.total) return;
    
    const quote = {
      ...newQuote,
      id: (patient.quotes?.length || 0) + 1,
      total: parseFloat(newQuote.total),
      accepted: false,
      acceptedAmount: 0,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    const updatedPatient = {
      ...patient,
      quotes: [...(patient.quotes || []), quote]
    };

    setPatient(updatedPatient);
    setIsQuoteModalOpen(false);
    setNewQuote({ date: new Date().toISOString().split('T')[0], description: '', total: '' });

    // AUTO-SAVE
    await window.api.updatePatient(updatedPatient);
  };

  const handleAddPayment = async () => {
    if (!newPay.amount) return;
    
    const payment = {
      ...newPay,
      amount: parseFloat(newPay.amount)
    };

    const updatedPatient = {
      ...patient,
      payments: [...(patient.payments || []), payment]
    };

    setPatient(updatedPatient);
    setIsPayModalOpen(false);
    setNewPay({ date: new Date().toISOString().split('T')[0], amount: '', method: 'Contanti', note: '' });

    // AUTO-SAVE
    await window.api.updatePatient(updatedPatient);
  };

  const handleAddVisit = async () => {
    if (!newVisit.notes) return;
    
    const visit = {
      ...newVisit,
      id: Date.now()
    };

    const updatedPatient = {
      ...patient,
      visits: [visit, ...(patient.visits || [])] // Newest first
    };

    setPatient(updatedPatient);
    setIsVisitModalOpen(false);
    setNewVisit({ date: new Date().toISOString().split('T')[0], title: '', notes: '' });

    // AUTO-SAVE
    await window.api.updatePatient(updatedPatient);
  };

  const handleFileUpload = async () => {
    try {
      const fileData = await window.api.pickAndSaveMedia(patient.id);
      if (!fileData) return;

      const updatedPatient = {
        ...patient,
        documents: [...(patient.documents || []), fileData]
      };

      setPatient(updatedPatient);
      // AUTO-SAVE
      await window.api.updatePatient(updatedPatient);
    } catch (err) {
      console.error("File upload failed:", err);
    }
  };

  const updateField = (field, value) => {
    setPatient(prev => {
      const next = { ...prev, [field]: value };
      
      // Cascading logic
      if (field === 'province') {
        next.city = '';
        next.zipCode = '';
      } else if (field === 'city') {
        next.zipCode = '';
      }
      
      return next;
    });
  };

  const tabs = [
    'Anagrafica', 'Odontogramma', 'Prestazioni', 'Preventivi', 'Pagamenti', 'Visite', 'Documenti', 'Note'
  ];

  if (loading) return (
    <div className="h-full w-full flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-dental-600"></div>
        <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">Caricamento...</span>
      </div>
    </div>
  );

  if (!patient) return (
    <div className="h-full w-full flex items-center justify-center bg-gray-50 p-12">
      <div className="text-center bg-white p-12 rounded-[2.5rem] shadow-xl border border-gray-100 max-w-md">
        <div className="text-5xl mb-6">⚠️</div>
        <h3 className="text-xl font-black text-gray-800 mb-2 uppercase">Errore di Caricamento</h3>
        <p className="text-sm text-gray-400 mb-8">Non è stato possibile recuperare i dati del paziente.</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-dental-600 text-white rounded-xl font-bold hover:bg-dental-700 transition-all">
          Riprova
        </button>
      </div>
    </div>
  );

  // Derive filtered lists (Moved AFTER null checks)
  const provinceOptions = lists.geography.provinces.map(p => ({ value: p.code, label: `${p.code} - ${p.name}` }));
  const cityOptions = (patient.province && lists.geography.cities[patient.province]) || [];
  const zipOptions = (patient.city && lists.geography.zipCodes[patient.city]) || [];

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 overflow-hidden">
      
      {/* 1. Header Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/patients')} 
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors" 
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-dental-100 text-dental-600 rounded-full flex items-center justify-center text-sm font-bold shadow-inner uppercase">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div className="flex items-baseline gap-6">
              <h1 className="text-xl font-bold text-gray-800 tracking-tight uppercase">
                {patient.lastName} {patient.firstName}
              </h1>
              <div className="flex items-center gap-4 text-[11px] text-gray-500">
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5"/> {patient.id}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5"/> {patient.phone}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> Ultima visita: {patient.lastVisit}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={handleSave} 
             disabled={saving}
             className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all shadow-md disabled:opacity-50 ${
               saveSuccess 
                 ? 'bg-green-500 text-white shadow-green-200' 
                 : 'bg-dental-600 text-white shadow-dental-200/50 hover:bg-dental-700'
             }`}
           >
             {saveSuccess ? (
               <><CheckSquare className="w-3.5 h-3.5" /> Salvato!</>
             ) : (
               <><Save className="w-3.5 h-3.5" /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}</>
             )}
           </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
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
      <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 scrollbar-thin scrollbar-thumb-gray-200">
        
        {/* TAB: ANAGRAFICA */}
        {activeTab === 'Anagrafica' && (
          <div className="max-w-6xl mx-auto space-y-6 pb-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Personal Info & Contacts */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Informazioni Personali */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
                    <User className="w-4 h-4 text-dental-600" />
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider">Informazioni Personali</h3>
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-4">
                    <Field label="Cognome" value={patient.lastName} onChange={v => updateField('lastName', v)} />
                    <Field label="Nome" value={patient.firstName} onChange={v => updateField('firstName', v)} />
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Sesso" value={patient.gender} onChange={v => updateField('gender', v)} type="select" options={['M','F']} />
                      <Field label="Data di Nascita" value={patient.dob} onChange={v => updateField('dob', v)} type="date" />
                    </div>
                    <Field label="Luogo di Nascita" value={patient.placeOfBirth} onChange={v => updateField('placeOfBirth', v)} />
                    <Field label="Codice Fiscale" value={patient.codiceFiscale} onChange={v => updateField('codiceFiscale', v)} />
                    <Field label="Professione" value={patient.profession} onChange={v => updateField('profession', v)} icon={<Briefcase className="w-3.5 h-3.5"/>} />
                  </div>
                </section>

                {/* 2. Recapiti e Residenza */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
                    <Home className="w-4 h-4 text-dental-600" />
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider">Recapiti e Residenza</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Field label="Cellulare" value={patient.phone} onChange={v => updateField('phone', v)} icon={<Phone className="w-3.5 h-3.5"/>} />
                      <Field label="Tel. Fisso" value={patient.landline} onChange={v => updateField('landline', v)} />
                      <Field label="Email" value={patient.email} onChange={v => updateField('email', v)} icon={<Mail className="w-3.5 h-3.5"/>} />
                    </div>
                    <div className="h-px bg-gray-50 my-2" />
                    <Field label="Indirizzo" value={patient.address} onChange={v => updateField('address', v)} icon={<MapPin className="w-3.5 h-3.5"/>} />
                    <div className="grid grid-cols-3 gap-4">
                      <Field label="PR" value={patient.province} onChange={v => updateField('province', v)} type="select" options={provinceOptions} isComplex />
                      <Field label="Città" value={patient.city} onChange={v => updateField('city', v)} type="select" options={cityOptions} disabled={!patient.province} />
                      <Field label="CAP" value={patient.zipCode} onChange={v => updateField('zipCode', v)} type="select" options={zipOptions} disabled={!patient.city} />
                    </div>
                  </div>
                </section>
              </div>

              {/* Clinical & Medical History Sidebar */}
              <div className="space-y-6">
                
                {/* 3. Dati Clinici Principali */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-dental-600" />
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider">Setup Clinico</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <Field label="N. Cartella" value={patient.caseNumber} onChange={v => updateField('caseNumber', v)} icon={<Activity className="w-3.5 h-3.5"/>} />
                    <Field label="Inizio cure" value={patient.startDate} onChange={v => updateField('startDate', v)} type="date" />
                    <Field label="Operatore" value={patient.operator} onChange={v => updateField('operator', v)} type="select" options={['STUDIORM', 'Dott. Rossi', 'Dott.ssa Bianchi']} />
                    <Field label="Tipo Cura" value={patient.treatmentType} onChange={v => updateField('treatmentType', v)} type="select" options={lists.treatmentTypes} />
                    <Field label="Stato Cartella" value={patient.status} onChange={v => updateField('status', v)} type="select" options={['Attivo', 'In Trattamento', 'Richiamo']} />
                  </div>
                </section>

                {/* 4. Anamnesi e Note Mediche */}
                <section className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden ring-4 ring-red-50/50">
                  <div className="px-6 py-4 border-b border-red-50 bg-red-50/30 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <h3 className="text-sm font-black text-red-700 uppercase tracking-wider">Anamnesi Medica</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <TextAreaField label="Allergie" value={patient.allergies} onChange={v => updateField('allergies', v)} highlight />
                    <TextAreaField label="Patologie Croniche" value={patient.pathologies} onChange={v => updateField('pathologies', v)} />
                    <TextAreaField label="Farmaci in uso" value={patient.medications} onChange={v => updateField('medications', v)} />
                    <TextAreaField label="Note Generali" value={patient.notes} onChange={v => updateField('notes', v)} />
                  </div>
                </section>
              </div>

            </div>
          </div>
        )}

        {/* TAB: ODONTOGRAMMA */}
        {activeTab === 'Odontogramma' && (
          <div className="flex-1 h-full min-h-0 w-full">
            <HybridOdontogram 
              data={patient.odontogram} 
              onChange={(newData) => updateField('odontogram', newData)} 
            />
          </div>
        )}

        {/* TAB: PREVENTIVI */}
        {activeTab === 'Preventivi' && (
          <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in slide-in-from-bottom-4 duration-500">
            {/* Filter & Actions */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex gap-4">
                {['all', 'accepted', 'pending'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setQuoteFilter(f)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                      quoteFilter === f 
                        ? 'bg-dental-100 text-dental-700 shadow-inner' 
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {f === 'all' ? 'Tutti' : f === 'accepted' ? 'Accettati' : 'In Attesa'}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setIsQuoteModalOpen(true)}
                className="px-6 py-2 bg-dental-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-dental-700 transition-all shadow-lg shadow-dental-200"
              >
                + Nuovo Preventivo
              </button>
            </div>

            {/* Quotes Table */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-0">
                  <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-5 border-b border-gray-100">Stato</th>
                      <th className="px-6 py-5 border-b border-gray-100">Ref</th>
                      <th className="px-6 py-5 border-b border-gray-100">Data</th>
                      <th className="px-6 py-5 border-b border-gray-100">Descrizione</th>
                      <th className="px-6 py-5 border-b border-gray-100 text-right">Totale (€)</th>
                      <th className="px-6 py-5 border-b border-gray-100 text-right">Accettato (€)</th>
                      <th className="px-6 py-5 border-b border-gray-100">Scadenza</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(!patient.quotes || patient.quotes.length === 0) ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-20 text-center text-gray-400 italic">
                          <div className="text-4xl mb-4 opacity-20">📄</div>
                          Nessun preventivo creato per questo paziente.
                        </td>
                      </tr>
                    ) : (
                      patient.quotes
                        .filter(q => quoteFilter === 'all' || (quoteFilter === 'accepted' ? q.accepted : !q.accepted))
                        .map((q, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-all cursor-pointer group">
                          <td className="px-8 py-5">
                            {q.accepted ? (
                              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <CheckSquare className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5 font-black text-gray-800">{q.id || (idx+1)}</td>
                          <td className="px-6 py-5 text-gray-500 text-xs">{q.date}</td>
                          <td className="px-6 py-5 font-bold text-gray-700">{q.description}</td>
                          <td className="px-6 py-5 text-right font-black text-gray-800">€ {q.total?.toLocaleString('it-IT')}</td>
                          <td className="px-6 py-5 text-right font-black text-green-600">€ {q.acceptedAmount?.toLocaleString('it-IT') || '0,00'}</td>
                          <td className="px-6 py-5 text-gray-400 text-[10px] uppercase font-bold">{q.expiryDate || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PRESTAZIONI */}
        {activeTab === 'Prestazioni' && (
          <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
            {/* Summary Row */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Totale Prestazioni</div>
                <div className="text-2xl font-black text-gray-800">€ {patient.treatments?.reduce((acc, t) => acc + (t.price || 0), 0).toLocaleString('it-IT') || '0,00'}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-green-500">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Totale Pagato</div>
                <div className="text-2xl font-black text-green-600">€ {patient.payments?.reduce((acc, p) => acc + (p.amount || 0), 0).toLocaleString('it-IT') || '0,00'}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-red-500">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Saldo da Versare</div>
                <div className="text-2xl font-black text-red-600">
                  € {( (patient.treatments?.reduce((acc, t) => acc + (t.price || 0), 0) || 0) - (patient.payments?.reduce((acc, p) => acc + (p.amount || 0), 0) || 0) ).toLocaleString('it-IT')}
                </div>
              </div>
            </div>

            {/* Actions & Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4 text-dental-600" />
                  <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider">Elenco Prestazioni Eseguite</h3>
                </div>
                <button 
                  onClick={() => setIsTxModalOpen(true)}
                  className="px-4 py-2 bg-dental-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-dental-700 transition-all shadow-md active:scale-95"
                >
                  + Aggiungi Prestazione
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-3">Data</th>
                      <th className="px-6 py-3">Descrizione</th>
                      <th className="px-6 py-3">Dente</th>
                      <th className="px-6 py-3">Operatore</th>
                      <th className="px-6 py-3 text-right">Importo (€)</th>
                      <th className="px-6 py-3">Stato</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {(!patient.treatments || patient.treatments.length === 0) ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">
                          Nessuna prestazione registrata per questo paziente.
                        </td>
                      </tr>
                    ) : (
                      patient.treatments.map((t, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-600">{t.date}</td>
                          <td className="px-6 py-4 font-bold text-gray-800">{t.description}</td>
                          <td className="px-6 py-4 text-gray-500">{t.tooth || '-'}</td>
                          <td className="px-6 py-4 text-gray-500">{t.operator || 'Dr. Rossi'}</td>
                          <td className="px-6 py-4 text-right font-black text-gray-800">{t.price?.toLocaleString('it-IT') || '0,00'}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full">Eseguita</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PAGAMENTI */}
        {activeTab === 'Pagamenti' && (
          <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
            {/* Financial Summary */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Debito Totale</div>
                <div className="text-2xl font-black text-gray-800">€ {patient.treatments?.reduce((acc, t) => acc + (t.price || 0), 0).toLocaleString('it-IT')}</div>
                <p className="text-[9px] text-gray-400 mt-2 italic">Somma di tutte le prestazioni eseguite</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-green-500">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Totale Versato</div>
                <div className="text-2xl font-black text-green-600">€ {patient.payments?.reduce((acc, p) => acc + (p.amount || 0), 0).toLocaleString('it-IT') || '0,00'}</div>
                <p className="text-[9px] text-green-600/60 mt-2 italic">Pagamenti confermati</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bilancio Aperto</div>
                <div className="text-2xl font-black text-blue-600">
                  € {( (patient.treatments?.reduce((acc, t) => acc + (t.price || 0), 0) || 0) - (patient.payments?.reduce((acc, p) => acc + (p.amount || 0), 0) || 0) ).toLocaleString('it-IT')}
                </div>
                <p className="text-[9px] text-blue-600/60 mt-2 italic">Mancante al pareggio</p>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider">Cronologia Versamenti</h3>
                </div>
                <button 
                  onClick={() => setIsPayModalOpen(true)}
                  className="px-5 py-2 bg-dental-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-dental-700 transition-all shadow-lg shadow-dental-100"
                >
                  + Registra Pagamento
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-4">Data Incasso</th>
                      <th className="px-6 py-4">Metodo</th>
                      <th className="px-6 py-4">Riferimento</th>
                      <th className="px-6 py-4 text-right">Importo (€)</th>
                      <th className="px-8 py-4 text-center">Ricevuta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(!patient.payments || patient.payments.length === 0) ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center text-gray-400 italic">
                          Non sono ancora stati registrati pagamenti per questo paziente.
                        </td>
                      </tr>
                    ) : (
                      patient.payments.map((p, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-8 py-4 font-bold text-gray-700">{p.date}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md uppercase">{p.method}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-sm">{p.note || 'Acconto cure'}</td>
                          <td className="px-6 py-4 text-right font-black text-green-600">€ {p.amount?.toLocaleString('it-IT')}</td>
                          <td className="px-8 py-4 text-center">
                            <button className="p-1.5 hover:bg-dental-50 text-dental-600 rounded-md transition-colors">
                              <Copy className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: VISITE */}
        {activeTab === 'Visite' && (
          <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
            {/* Action Bar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4 text-dental-600" />
                Diario Clinico delle Visite
              </h3>
              <button 
                onClick={() => setIsVisitModalOpen(true)}
                className="px-6 py-2 bg-dental-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-dental-700 transition-all shadow-lg shadow-dental-100"
              >
                + Nuova Visita
              </button>
            </div>

            {/* Timeline View */}
            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {(!patient.visits || patient.visits.length === 0) ? (
                <div className="bg-white p-12 rounded-[2rem] border border-gray-100 shadow-sm text-center ml-12">
                  <div className="text-4xl mb-4 opacity-20">📝</div>
                  <p className="text-gray-400 italic">Nessun diario clinico registrato.</p>
                </div>
              ) : (
                patient.visits.map((v, idx) => (
                  <div key={idx} className="relative flex items-start group ml-12 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                    {/* Dot */}
                    <div className="absolute -left-12 mt-1.5 w-10 h-10 bg-white border-2 border-dental-600 rounded-full flex items-center justify-center z-10 shadow-sm group-hover:scale-110 transition-transform">
                      <div className="w-2 h-2 bg-dental-600 rounded-full"></div>
                    </div>
                    
                    {/* Card */}
                    <div className="flex-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-[10px] font-black text-dental-600 uppercase tracking-widest">{v.date}</span>
                          <h4 className="text-lg font-black text-gray-800 tracking-tight">{v.title || 'Controllo Periodico'}</h4>
                        </div>
                        <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-full uppercase">Dr. Rossi</span>
                      </div>
                      <div className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap bg-gray-50/50 p-4 rounded-xl border border-gray-50">
                        {v.notes}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB: DOCUMENTI */}
        {activeTab === 'Documenti' && (
          <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-dental-50 text-dental-600 rounded-xl flex items-center justify-center">
                  <Copy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-800 tracking-tight">Galleria Documenti</h3>
                  <p className="text-xs text-gray-400">Radiografie, Referti e Documenti d'Identità</p>
                </div>
              </div>
              <button 
                onClick={handleFileUpload}
                className="px-6 py-2.5 bg-dental-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-dental-700 transition-all shadow-lg shadow-dental-100 flex items-center gap-2"
              >
                <PlusSquare className="w-4 h-4" />
                Carica File
              </button>
            </div>

            {/* Grid */}
            {(!patient.documents || patient.documents.length === 0) ? (
              <div className="bg-white p-20 rounded-[2rem] border border-dashed border-gray-200 text-center">
                <div className="text-6xl mb-6 opacity-20">📁</div>
                <h4 className="text-xl font-black text-gray-800">Nessun documento caricato</h4>
                <p className="text-gray-400 mt-2 max-w-xs mx-auto text-sm">Trascina qui un file o usa il pulsante in alto per selezionare radiografie o documenti del paziente.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {patient.documents.map((doc, idx) => (
                  <div key={idx} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
                      {['JPG', 'PNG', 'JPEG', 'GIF'].includes(doc.type) ? (
                        <img 
                          src={window.api.getSecureMediaUrl(doc.path)} 
                          alt={doc.name} 
                          className="w-full h-full object-cover blur-[0.5px] group-hover:blur-0 transition-all"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-dental-600">
                            <Copy className="w-8 h-8" />
                          </div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{doc.type}</span>
                        </div>
                      )}
                      
                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                         <button 
                           onClick={() => setSelectedDoc(doc)}
                           className="p-2 bg-white text-gray-700 rounded-lg hover:bg-dental-600 hover:text-white transition-colors"
                         >
                           <List className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={() => handleDeleteDocument(idx)}
                           className="p-2 bg-white text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                    <div className="p-4 border-t border-gray-50">
                      <h5 className="text-xs font-black text-gray-800 truncate" title={doc.name}>{doc.name}</h5>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-gray-400">{doc.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: NOTE */}
        {activeTab === 'Note' && (
          <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-800 tracking-tight">Note Amministrative</h3>
                  <p className="text-xs text-gray-400">Promemoria, preferenze e comunicazioni extra-cliniche</p>
                </div>
              </div>
              <div className="p-8">
                <textarea 
                  value={patient.adminNotes || ''} 
                  onChange={e => updateField('adminNotes', e.target.value)}
                  placeholder="Scrivi qui qualsiasi nota di carattere amministrativo o personale non clinico..."
                  className="w-full min-h-[400px] p-6 bg-gray-50 rounded-2xl border border-gray-100 focus:bg-white focus:ring-8 focus:ring-amber-50 outline-none transition-all text-gray-700 leading-relaxed font-medium"
                />
                <div className="mt-4 flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Le note qui inserite non appariranno nel diario clinico.</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: ADD TREATMENT */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-gray-800 mb-6 uppercase tracking-tight">Nuova Prestazione</h3>
            
            <div className="space-y-4">
              <Field label="Data" type="date" value={newTx.date} onChange={v => setNewTx({...newTx, date: v})} />
              <Field label="Descrizione" value={newTx.description} onChange={v => setNewTx({...newTx, description: v})} icon={<Activity className="w-3.5 h-3.5"/>} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Dente (Opt.)" value={newTx.tooth} onChange={v => setNewTx({...newTx, tooth: v})} />
                <Field label="Importo (€)" value={newTx.price} onChange={v => setNewTx({...newTx, price: v})} type="number" />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsTxModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-all uppercase text-xs"
              >
                Annulla
              </button>
              <button 
                onClick={handleAddTreatment}
                className="flex-1 py-3 bg-dental-600 text-white font-bold rounded-xl hover:bg-dental-700 transition-all shadow-lg shadow-dental-200 uppercase text-xs"
              >
                Conferma
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD QUOTE */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-gray-800 mb-6 uppercase tracking-tight">Nuovo Preventivo</h3>
            
            <div className="space-y-4">
              <Field label="Data" type="date" value={newQuote.date} onChange={v => setNewQuote({...newQuote, date: v})} />
              <Field label="Descrizione" value={newQuote.description} onChange={v => setNewQuote({...newQuote, description: v})} icon={<Activity className="w-3.5 h-3.5"/>} />
              <Field label="Totale Stimato (€)" value={newQuote.total} onChange={v => setNewQuote({...newQuote, total: v})} type="number" />
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsQuoteModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-all uppercase text-xs"
              >
                Annulla
              </button>
              <button 
                onClick={handleAddQuote}
                className="flex-1 py-3 bg-dental-600 text-white font-bold rounded-xl hover:bg-dental-700 transition-all shadow-lg shadow-dental-200 uppercase text-xs"
              >
                Crea Preventivo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD PAYMENT */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-gray-800 mb-6 uppercase tracking-tight">Registra Pagamento</h3>
            
            <div className="space-y-4">
              <Field label="Data" type="date" value={newPay.date} onChange={v => setNewPay({...newPay, date: v})} />
              <Field label="Importo (€)" value={newPay.amount} onChange={v => setNewPay({...newPay, amount: v})} type="number" />
              <Field 
                label="Metodo" 
                type="select" 
                options={['Contanti', 'Bonifico', 'Carta/POS', 'Assegno']} 
                value={newPay.method} 
                onChange={v => setNewPay({...newPay, method: v})} 
              />
              <Field 
                label="Bante a... (Riferimento)" 
                type="select" 
                options={patient.treatments?.map(t => `${t.date} - ${t.description} (€${t.price})`) || []}
                value={newPay.note} 
                onChange={v => setNewPay({...newPay, note: v})} 
              />
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsPayModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-all uppercase text-xs"
              >
                Annulla
              </button>
              <button 
                onClick={handleAddPayment}
                className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 uppercase text-xs"
              >
                Registra
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD VISIT */}
      {isVisitModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-gray-800 mb-6 uppercase tracking-tight">Nuova Nota Clinica</h3>
            
            <div className="space-y-4">
              <Field label="Data Visita" type="date" value={newVisit.date} onChange={v => setNewVisit({...newVisit, date: v})} />
              <Field label="Titolo/Motivo" value={newVisit.title} onChange={v => setNewVisit({...newVisit, title: v})} placeholder="es. Controllo Ortodontico" />
              <TextAreaField 
                label="Note Cliniche" 
                value={newVisit.notes} 
                onChange={v => setNewVisit({...newVisit, notes: v})} 
                placeholder="Descrivi l'intervento, lo stato del paziente, raccomandazioni..."
              />
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsVisitModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-all uppercase text-xs"
              >
                Annulla
              </button>
              <button 
                onClick={handleAddVisit}
                className="flex-1 py-3 bg-dental-600 text-white font-bold rounded-xl hover:bg-dental-700 transition-all shadow-lg shadow-dental-100 uppercase text-xs"
              >
                Salva Nota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DOCUMENT PREVIEW */}
      {selectedDoc && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={() => setSelectedDoc(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] animate-in zoom-in-95 duration-300">
            <button 
              className="absolute -top-12 right-0 p-2 text-white hover:text-dental-400 transition-colors flex items-center gap-2"
              onClick={() => setSelectedDoc(null)}
            >
              <span className="text-xs font-black uppercase tracking-widest">Chiudi</span>
              <X className="w-6 h-6" />
            </button>
            
            {['JPG', 'PNG', 'JPEG', 'GIF'].includes(selectedDoc.type) ? (
              <img 
                src={window.api.getSecureMediaUrl(selectedDoc.path)} 
                alt={selectedDoc.name} 
                className="w-full h-full object-contain rounded-2xl shadow-2xl border border-white/10"
              />
            ) : (
              <div className="bg-white p-20 rounded-3xl text-center">
                <Copy className="w-20 h-20 text-dental-600 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-gray-800 mb-2">{selectedDoc.name}</h3>
                <p className="text-gray-400">Questo file non può essere visualizzato direttamente.</p>
              </div>
            )}
            
            <div className="absolute -bottom-12 left-0 right-0 text-center">
              <span className="text-white/60 text-xs font-medium">{selectedDoc.name} • {selectedDoc.date}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const Field = ({ label, value, onChange, type = 'text', icon, options, disabled, isComplex }) => (
  <div className={`flex flex-col gap-1.5 group ${disabled ? 'opacity-50' : ''}`}>
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-1.5 transition-colors group-focus-within:text-dental-600">
      {icon} {label}
    </label>
    {type === 'select' ? (
      <select 
        value={value || ''} 
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full border border-gray-100 rounded-xl px-4 py-2.5 bg-gray-50 hover:bg-gray-100/50 focus:bg-white outline-none focus:ring-4 focus:ring-dental-100 transition-all font-medium text-sm text-gray-700 disabled:cursor-not-allowed"
      >
        <option value="">Seleziona...</option>
        {options?.map(opt => (
          <option key={isComplex ? opt.value : opt} value={isComplex ? opt.value : opt}>
            {isComplex ? opt.label : opt}
          </option>
        ))}
      </select>
    ) : (
      <input 
        type={type} 
        value={value || ''} 
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full border border-gray-100 rounded-xl px-4 py-2.5 bg-gray-50 hover:bg-gray-100/50 focus:bg-white outline-none focus:ring-4 focus:ring-dental-100 transition-all font-medium text-sm text-gray-700 disabled:cursor-not-allowed"
      />
    )}
  </div>
);

const TextAreaField = ({ label, value, onChange, highlight }) => (
  <div className="flex flex-col gap-1.5">
    <label className={`text-[10px] font-black uppercase tracking-widest px-1 ${highlight ? 'text-red-500' : 'text-gray-400'}`}>
      {label}
    </label>
    <textarea 
      value={value || ''} 
      onChange={e => onChange(e.target.value)}
      rows={2}
      className={`w-full border rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all resize-none ${
        highlight 
          ? 'bg-red-50/30 border-red-100 focus:bg-white focus:ring-4 focus:ring-red-100 text-red-700' 
          : 'bg-gray-50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-gray-100 text-gray-700'
      }`}
    />
  </div>
);

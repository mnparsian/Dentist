import React, { useState, useEffect } from 'react';
import { 
  Printer, FileText, BarChart3, Users, ChevronRight, 
  Download, Search, ClipboardList, Receipt, User, X, Check, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Reports() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [view, setView] = useState('menu'); // 'menu', 'invoice', 'preventivo'
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (window.api && window.api.getPatients) {
      window.api.getPatients().then(setPatients);
    }
  }, []);

  const handleCreateDocument = (type) => {
    if (!selectedPatient) return;
    setView(type);
    // Auto-select all items by default
    setSelectedItems(selectedPatient.treatments || []);
  };

  const toggleItem = (item) => {
    if (selectedItems.find(i => i.id === item.id)) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const calculateTotal = () => {
    return selectedItems.reduce((acc, item) => acc + (item.price || 0), 0);
  };

  // Printable Invoice Template
  if (view === 'invoice' || view === 'preventivo') {
    return (
      <div className="h-full overflow-y-auto bg-gray-100 p-4 md:p-12 scrollbar-hide print:bg-white print:p-0">
        <div className="max-w-4xl mx-auto space-y-6 print:space-y-0 print:max-w-none print:m-0">
          <div id="print-actions" className="print:hidden flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
            <button onClick={() => setView('menu')} className="flex items-center gap-2 text-gray-500 font-bold hover:text-dental-600">
              <X className="w-5 h-5" /> Annulla
            </button>
            <div className="flex gap-3">
              <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-dental-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-dental-100">
                <Printer className="w-5 h-5" /> Stampa {view === 'invoice' ? 'Fattura' : 'Preventivo'}
              </button>
            </div>
          </div>

          {/* The Document */}
          <div className="bg-white p-12 shadow-2xl rounded-sm border border-gray-200 print:shadow-none print:border-0 print:p-0 print:m-0">
            {/* Header */}
            <div className="flex justify-between border-b-2 border-gray-100 pb-10 mb-10">
              <div>
                <h1 className="text-3xl font-black text-dental-900 uppercase">DentalSys Clinic</h1>
                <p className="text-xs text-gray-400 font-bold mt-1">Studio Dentistico Professionale</p>
                <div className="text-[10px] text-gray-500 mt-4 leading-relaxed">
                  Via Roma 123, 00100 Roma (RM)<br />
                  P.IVA: 12345678901<br />
                  Tel: +39 06 1234567<br />
                  Email: info@dentalsys.it
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-5xl font-black text-gray-100 uppercase tracking-tighter mb-4">{view}</h2>
                <div className="space-y-1">
                  <p className="text-xs font-black text-gray-400 uppercase">Documento N.</p>
                  <p className="text-sm font-bold text-gray-800">2024 / {Math.floor(Math.random() * 1000)}</p>
                  <p className="text-xs font-black text-gray-400 uppercase mt-4">Data Emissione</p>
                  <p className="text-sm font-bold text-gray-800">{new Date().toLocaleDateString('it-IT')}</p>
                </div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="bg-gray-50 p-6 rounded-xl mb-10 grid grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Destinatario</p>
                <p className="text-lg font-black text-gray-800">{selectedPatient.lastName} {selectedPatient.firstName}</p>
                <p className="text-xs text-gray-500 mt-1">{selectedPatient.address || 'Indirizzo non registrato'}</p>
                <p className="text-xs text-gray-500">{selectedPatient.fiscalCode || 'Codice Fiscale: N/D'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Contatti</p>
                <p className="text-xs text-gray-500">{selectedPatient.phone}</p>
                <p className="text-xs text-gray-500">{selectedPatient.email}</p>
              </div>
            </div>

            {/* Items Table with Integrated Totals */}
            <table className="w-full mb-12 border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="py-4 text-left text-[10px] font-black text-gray-400 uppercase">Descrizione Prestazione</th>
                  <th className="py-4 text-center text-[10px] font-black text-gray-400 uppercase">Data</th>
                  <th className="py-4 text-right text-[10px] font-black text-gray-400 uppercase">Importo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedItems.map((item, idx) => (
                  <tr key={idx} className="page-break-inside-avoid">
                    <td className="py-4">
                      <p className="text-sm font-bold text-gray-800">{item.procedure || item.notes}</p>
                      <p className="text-[10px] text-gray-400">Cod: {item.id?.toString().slice(-5)}</p>
                    </td>
                    <td className="py-4 text-center text-xs text-gray-500">{item.date}</td>
                    <td className="py-4 text-right font-bold text-gray-800">€ {item.price?.toLocaleString('it-IT')}</td>
                  </tr>
                ))}
              </tbody>
              {/* Integrated Totals in Table Footer */}
              <tfoot>
                <tr className="border-t-2 border-gray-800">
                  <td colSpan="2" className="py-3 text-right text-[10px] font-black text-gray-400 uppercase">Imponibile</td>
                  <td className="py-3 text-right text-xs font-bold text-gray-800">€ {(calculateTotal() * 0.98).toFixed(2)}</td>
                </tr>
                <tr className="border-0">
                  <td colSpan="2" className="py-2 text-right text-[10px] font-black text-gray-400 uppercase">IVA (Exempt)</td>
                  <td className="py-2 text-right text-xs font-bold text-gray-800">€ 0,00</td>
                </tr>
                <tr className="border-0">
                  <td colSpan="2" className="py-2 text-right text-[10px] font-black text-gray-400 uppercase">Bollo</td>
                  <td className="py-2 text-right text-xs font-bold text-gray-800">€ 2,00</td>
                </tr>
                <tr className="border-0">
                  <td colSpan="2" className="py-4 text-right text-sm font-black text-gray-800 uppercase tracking-tighter">Totale Documento</td>
                  <td className="py-4 text-right text-2xl font-black text-dental-600">€ {calculateTotal().toLocaleString('it-IT')}</td>
                </tr>
              </tfoot>
            </table>

            {/* Footer */}
            <div className="mt-32 text-center text-[9px] text-gray-300 font-medium">
              Operazione effettuata ai sensi dell'articolo 1, commi da 54 a 89, della Legge n. 190/2014.<br />
              Contributo integrativo 2% escluso. Documento valido ai fini fiscali.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto h-full overflow-y-auto">
      <div>
        <h1 className="text-4xl font-black text-gray-800 tracking-tighter">Centro Stampe & Report</h1>
        <p className="text-gray-400 mt-1 font-medium">Gestione professionale dei documenti clinici e fiscali.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
            <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3">
              <Receipt className="w-6 h-6 text-dental-600" />
              Emissione Documenti
            </h3>
            
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text"
                placeholder="Cerca paziente (es. Rossi, Shahin...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-dental-50 transition-all font-medium"
              />
              
              {searchTerm && filteredPatients.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden z-20">
                  {filteredPatients.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => {
                        setSelectedPatient(p);
                        setSearchTerm('');
                      }}
                      className="w-full px-6 py-4 text-left hover:bg-dental-50 flex justify-between items-center border-b last:border-0 border-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-dental-100 text-dental-600 rounded-full flex items-center justify-center font-black text-xs">
                          {p.firstName[0]}{p.lastName[0]}
                        </div>
                        <span className="font-bold text-gray-800">{p.lastName} {p.firstName}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedPatient ? (
              <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
                <div className="p-6 bg-dental-900 rounded-3xl text-white flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <User className="w-8 h-8 text-dental-400" />
                    <div>
                      <div className="text-dental-400 text-[10px] font-black uppercase tracking-widest">Paziente</div>
                      <div className="text-xl font-black">{selectedPatient.lastName} {selectedPatient.firstName}</div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedPatient(null)} className="text-xs font-bold text-dental-300 underline">Cambia</button>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Seleziona prestazioni da includere</h4>
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                    {selectedPatient.treatments?.map((t, idx) => (
                      <div 
                        key={idx}
                        onClick={() => toggleItem(t)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                          selectedItems.find(i => i.id === t.id) ? 'bg-dental-50 border-dental-200' : 'bg-white border-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                             selectedItems.find(i => i.id === t.id) ? 'bg-dental-600 border-dental-600' : 'border-gray-200'
                          }`}>
                            {selectedItems.find(i => i.id === t.id) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-800">{t.procedure || t.notes}</div>
                            <div className="text-[10px] text-gray-400">{t.date}</div>
                          </div>
                        </div>
                        <div className="font-black text-gray-800">€ {t.price}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button 
                    disabled={selectedItems.length === 0}
                    onClick={() => handleCreateDocument('invoice')}
                    className="flex flex-col items-center justify-center p-8 bg-white border-2 border-gray-100 rounded-[2rem] hover:border-dental-500 hover:bg-dental-50 transition-all group disabled:opacity-50"
                  >
                    <Receipt className="w-8 h-8 text-gray-400 group-hover:text-dental-600 mb-2" />
                    <span className="font-black text-gray-700 text-sm">Genera Fattura</span>
                  </button>
                  <button 
                    disabled={selectedItems.length === 0}
                    onClick={() => handleCreateDocument('preventivo')}
                    className="flex flex-col items-center justify-center p-8 bg-white border-2 border-gray-100 rounded-[2rem] hover:border-dental-500 hover:bg-dental-50 transition-all group disabled:opacity-50"
                  >
                    <Printer className="w-8 h-8 text-gray-400 group-hover:text-dental-600 mb-2" />
                    <span className="font-black text-gray-700 text-sm">Genera Preventivo</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">Cerca un paziente per generare un documento</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-6">Altre Stampe Rapide</h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { title: 'Modulo Privacy GDPR', icon: ShieldCheck, color: 'text-green-600' },
                { title: 'Anagrafica Completa', icon: ClipboardList, color: 'text-blue-600' },
                { title: 'Prescrizione Farmaci', icon: FileText, color: 'text-amber-600' }
              ].map((item, idx) => (
                <button key={idx} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all text-left border border-transparent hover:border-gray-100 group">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-xs font-bold text-gray-700">{item.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

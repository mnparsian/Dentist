import React, { useEffect, useState } from 'react';
import { 
  CreditCard, TrendingUp, AlertCircle, Calendar, 
  ArrowUpRight, ArrowDownRight, DollarSign, Users,
  Filter, Download, ChevronRight, Search, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Finance() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPending: 0,
    monthlyRevenue: 0,
    monthlyTreatments: 0,
    recentPayments: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (window.api && window.api.getPatients) {
      window.api.getPatients().then((patients) => {
        calculateFinance(patients, selectedMonth, selectedYear);
        setIsLoading(false);
      });
    }
  }, [selectedMonth, selectedYear]);

  const calculateFinance = (patients, currentMonth, currentYear) => {
    let revenue = 0;
    let pending = 0;
    let monthlyRev = 0;
    let monthlyCount = 0;
    let allPayments = [];

    patients.forEach(p => {
      const patientTreatmentsTotal = p.treatments?.reduce((acc, t) => acc + (t.price || 0), 0) || 0;
      const patientPaymentsTotal = p.payments?.reduce((acc, pay) => acc + (pay.amount || 0), 0) || 0;
      revenue += patientPaymentsTotal;
      pending += Math.max(0, patientTreatmentsTotal - patientPaymentsTotal);

      p.payments?.forEach(pay => {
        const payDate = new Date(pay.date);
        if (payDate.getMonth() === currentMonth && payDate.getFullYear() === currentYear) {
          monthlyRev += (pay.amount || 0);
        }
        allPayments.push({
          ...pay,
          patientId: p.id,
          patientName: `${p.lastName} ${p.firstName}`
        });
      });

      p.treatments?.forEach(t => {
        const tDate = new Date(t.date);
        if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
          monthlyCount++;
        }
      });
    });

    allPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
    setStats({
      totalRevenue: revenue,
      totalPending: pending,
      monthlyRevenue: monthlyRev,
      monthlyTreatments: monthlyCount,
      recentPayments: allPayments.slice(0, 10)
    });
  };

  const StatCard = ({ title, value, sub, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color.bg} ${color.text} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-1 text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3" />
          +12%
        </div>
      </div>
      <div>
        <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{title}</h3>
        <div className="text-3xl font-black text-gray-800 tracking-tighter">
          {typeof value === 'number' ? `€ ${value.toLocaleString('it-IT')}` : value}
        </div>
        <p className="text-[10px] text-gray-400 mt-2 font-medium">{sub}</p>
      </div>
    </div>
  );

  if (isLoading) return <div className="p-12 text-center font-black text-gray-400 animate-pulse">CARICAMENTO DATI FINANZIARI...</div>;

  return (
    <div className="h-full overflow-y-auto bg-gray-50/50 p-8 scrollbar-thin scrollbar-thumb-gray-200">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
        
        {/* Print-Only Official Header */}
        <div className="hidden print:block border-b-4 border-gray-800 pb-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">DentalSys Clinic</h2>
              <p className="text-sm font-bold text-gray-500">Report Finanziario Professionale</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data Report</p>
              <p className="text-sm font-bold text-gray-800">{new Date().toLocaleDateString('it-IT')} {new Date().toLocaleTimeString('it-IT')}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-gray-800 tracking-tighter">Contabilità Generale</h1>
            <p className="text-gray-400 mt-1 font-medium">Panoramica delle performance economiche dello studio</p>
          </div>
          <div className="flex gap-3 no-print">
            <button 
              onClick={() => window.print()} 
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 text-gray-600 rounded-xl font-bold text-xs shadow-sm hover:bg-gray-50 transition-all"
            >
              <Download className="w-4 h-4" /> Report PDF
            </button>
            
            <div className="flex items-center bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <button 
                onClick={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setSelectedYear(prev => prev - 1);
                  } else {
                    setSelectedMonth(prev => prev - 1);
                  }
                }}
                className="p-2.5 hover:bg-gray-50 text-gray-400 hover:text-dental-600 transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              
              <div className="relative group">
                <input 
                  type="month" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  value={`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`}
                  onChange={(e) => {
                    const [y, m] = e.target.value.split('-');
                    setSelectedYear(parseInt(y));
                    setSelectedMonth(parseInt(m) - 1);
                  }}
                />
                <div className="px-4 py-2.5 bg-dental-600 text-white flex items-center gap-2 font-bold text-xs pointer-events-none group-hover:bg-dental-700 transition-colors">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedYear, selectedMonth).toLocaleString('it-IT', { month: 'long', year: 'numeric' })}
                </div>
              </div>

              <button 
                onClick={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setSelectedYear(prev => prev + 1);
                  } else {
                    setSelectedMonth(prev => prev + 1);
                  }
                }}
                className="p-2.5 hover:bg-gray-50 text-gray-400 hover:text-dental-600 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Fatturato Totale" value={stats.totalRevenue} sub="Incassi effettivi registrati" icon={ArrowUpRight} color={{ bg: 'bg-green-50', text: 'text-green-600' }} />
          <StatCard title="Crediti Pendenti" value={stats.totalPending} sub="Importi da riscuotere" icon={AlertCircle} color={{ bg: 'bg-red-50', text: 'text-red-600' }} />
          <StatCard title="Mese Corrente" value={stats.monthlyRevenue} sub="Fatturato di Maggio" icon={Calendar} color={{ bg: 'bg-blue-50', text: 'text-blue-600' }} />
          <StatCard title="Prestazioni (Mese)" value={stats.monthlyTreatments} sub="Interventi eseguiti" icon={Activity} color={{ bg: 'bg-amber-50', text: 'text-amber-600' }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <h3 className="text-lg font-black text-gray-800 tracking-tight">Ultime Transazioni</h3>
              <button className="text-dental-600 font-bold text-xs hover:underline">Vedi tutte</button>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                  <tr>
                    <th className="px-8 py-4">Paziente</th>
                    <th className="px-8 py-4">Data</th>
                    <th className="px-8 py-4">Metodo</th>
                    <th className="px-8 py-4 text-right">Importo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.recentPayments.map((pay, idx) => (
                    <tr key={idx} onClick={() => navigate(`/patients/${pay.patientId}`)} className="group hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-black group-hover:bg-dental-100 group-hover:text-dental-600 transition-colors">
                            {pay.patientName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-bold text-gray-800 text-sm">{pay.patientName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-gray-500 text-xs font-medium">{pay.date}</td>
                      <td className="px-8 py-5">
                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${pay.method === 'Contanti' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>{pay.method}</span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-gray-800">€ {pay.amount.toLocaleString('it-IT')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-dental-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <h3 className="text-dental-400 text-[10px] font-black uppercase tracking-widest mb-4">Cash Flow Health</h3>
                <div className="text-4xl font-black mb-2">94%</div>
                <p className="text-dental-300 text-xs leading-relaxed">Il tasso di recupero (Recupero Crediti) è eccellente. Il 94% delle prestazioni emesse è già stato incassato.</p>
                <div className="mt-8 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-dental-400 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-dental-800 rounded-full opacity-50 blur-3xl"></div>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
              <h3 className="text-gray-800 text-sm font-black uppercase tracking-widest mb-6">Metodi di Pagamento</h3>
              <div className="space-y-4">
                {[{ label: 'Contanti', perc: 45, color: 'bg-amber-400' }, { label: 'POS / Carta', perc: 35, color: 'bg-blue-400' }, { label: 'Bonifico', perc: 20, color: 'bg-green-400' }].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-500">{item.label}</span>
                      <span className="text-gray-800">{item.perc}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden"><div className={`${item.color} h-full`} style={{ width: `${item.perc}%` }}></div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

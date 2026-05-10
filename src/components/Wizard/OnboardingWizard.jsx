import React, { useState } from 'react';
import { User, FileText, CheckCircle, ChevronRight, X } from 'lucide-react';

const steps = [
  { id: 1, name: 'Dati Personali', icon: User },
  { id: 2, name: 'Dati Fiscali', icon: FileText },
  { id: 3, name: 'Conferma', icon: CheckCircle },
];

export default function OnboardingWizard({ onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    email: '',
    phone: '',
    partitaIva: '',
    codiceFiscale: '',
    codiceSts: ''
  });

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isStep1Valid = formData.firstName.trim() !== '' && formData.lastName.trim() !== '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Nuovo Paziente</h2>
            <p className="text-sm text-gray-500 mt-1">Aggiungi un nuovo paziente al sistema</p>
          </div>
          {onCancel && (
            <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="px-8 py-4 bg-white border-b border-gray-50">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full -z-10"></div>
            <div 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-dental-500 rounded-full -z-10 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            ></div>
            
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isActive ? 'border-dental-500 bg-dental-50 text-dental-600' : 
                    isCompleted ? 'border-dental-500 bg-dental-500 text-white' : 
                    'border-gray-200 bg-white text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-dental-700' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 flex-grow">
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Informazioni di Base</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-dental-500 outline-none transition-all bg-gray-50 focus:bg-white" 
                    placeholder="Mario" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-dental-500 outline-none transition-all bg-gray-50 focus:bg-white" 
                    placeholder="Rossi" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data di Nascita</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-dental-500 outline-none transition-all bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-dental-500 outline-none transition-all bg-gray-50 focus:bg-white" 
                    placeholder="+39 333 1234567" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-semibold text-gray-800">Dati Fiscali</h3>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium">Opzionale</span>
              </div>
              <p className="text-sm text-gray-500">Questi dati possono essere inseriti in seguito per la fatturazione.</p>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Codice Fiscale</label>
                  <input type="text" name="codiceFiscale" value={formData.codiceFiscale} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-dental-500 outline-none transition-all uppercase bg-gray-50 focus:bg-white" 
                    placeholder="RSSMRA80A01H501U" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partita IVA</label>
                  <input type="text" name="partitaIva" value={formData.partitaIva} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-dental-500 outline-none transition-all bg-gray-50 focus:bg-white" 
                    placeholder="IT12345678901" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Codice Sistema TS (Tessera Sanitaria)</label>
                  <input type="text" name="codiceSts" value={formData.codiceSts} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dental-500 focus:border-dental-500 outline-none transition-all bg-gray-50 focus:bg-white" 
                    placeholder="Inserisci codice STS se applicabile" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 text-center py-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Pronto per iniziare!</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Hai inserito i dati di <span className="font-semibold text-gray-800">{formData.firstName} {formData.lastName}</span>.
                I dati fiscali sono {formData.codiceFiscale || formData.partitaIva ? 'stati registrati' : 'stati saltati (possono essere aggiunti in seguito)'}.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center rounded-b-2xl">
          {currentStep > 1 ? (
            <button onClick={handleBack} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">
              Indietro
            </button>
          ) : (
            <div></div> // Spacer
          )}
          
          <div className="flex gap-3">
            {currentStep === 2 && (
               <button 
                onClick={handleNext} 
                className="px-6 py-2 text-gray-600 font-medium bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex items-center gap-2"
              >
                Salta Dati Fiscali
              </button>
            )}
            
            {currentStep < 3 ? (
              <button 
                onClick={handleNext} 
                disabled={currentStep === 1 && !isStep1Valid}
                className={`px-6 py-2 font-medium rounded-lg transition-all flex items-center gap-2 ${
                  currentStep === 1 && !isStep1Valid 
                    ? 'bg-blue-300 text-white cursor-not-allowed' 
                    : 'bg-dental-600 text-white hover:bg-dental-700 shadow-md hover:shadow-lg'
                }`}
              >
                Avanti <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => onComplete(formData)}
                className="px-8 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-md hover:shadow-lg transition-all"
              >
                Salva Paziente
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

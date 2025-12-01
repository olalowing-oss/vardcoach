import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useReminders } from './hooks/useReminders';
import { Sidebar, BottomNav, Header } from './components/common';
import { Notifications } from './components/Notifications';
import { ExportModal } from './components/ExportModal';
import { 
  Dashboard, 
  CalendarView, 
  MedicationsView, 
  DiagnosesView,
  DiaryView,
  RemindersView,
  QuestionsView,
  OverallAnalysisView,
  NotebookView,
  DoctorVisitsView
} from './views';
import './styles/index.css';
import './App.css';

// ============================================
// TESTDATA - Ta bort denna funktion i produktion
// ============================================
const loadTestData = () => {
  // Kolla om data redan finns
  const existingDiagnoses = localStorage.getItem('vardcoachen-diagnoses');
  if (existingDiagnoses) {
    try {
      const parsed = JSON.parse(existingDiagnoses);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('📋 Data finns redan - hoppar över testdata');
        return false;
      }
    } catch (error) {
      console.warn('⚠️ Kunde inte läsa sparad data, laddar testdata på nytt.', error);
    }
  }

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
  const today = new Date();
  const formatDate = (date) => date.toISOString().split('T')[0];
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // DIAGNOSER
  const testDiagnoses = [
    {
      id: generateId(),
      name: "Hypertoni (högt blodtryck)",
      date: formatDate(addDays(today, -365)),
      doctor: "Dr. Anna Lindqvist",
      description: "Primär hypertoni diagnostiserad vid rutinkontroll. Blodtryck vid diagnos: 158/95 mmHg.",
      treatment: "Livsstilsförändringar (kost, motion) samt medicinering med Enalapril 10mg dagligen."
    },
    {
      id: generateId(),
      name: "Diabetes typ 2",
      date: formatDate(addDays(today, -180)),
      doctor: "Dr. Erik Johansson",
      description: "Diagnostiserad efter förhöjt HbA1c (52 mmol/mol). Inga komplikationer noterade vid diagnos.",
      treatment: "Kostomläggning, regelbunden motion, Metformin 500mg x 2. Kontroll av blodsockret dagligen."
    },
    {
      id: generateId(),
      name: "Artros i höger knä",
      date: formatDate(addDays(today, -90)),
      doctor: "Dr. Maria Svensson",
      description: "Lätt till måttlig artros påvisad vid röntgen. Värk vid belastning, viss stelhet på morgonen.",
      treatment: "Fysioterapi, viktminskning rekommenderas. Smärtlindring med Alvedon vid behov."
    }
  ];

  // LÄKEMEDEL
  const testMedications = [
    {
      id: generateId(),
      name: "Enalapril",
      dosage: "10 mg",
      times: ["08:00"],
      instructions: "Ta på fastande mage med ett glas vatten. Undvik grapefrukt.",
      startDate: formatDate(addDays(today, -365)),
      active: true
    },
    {
      id: generateId(),
      name: "Metformin",
      dosage: "500 mg",
      times: ["08:00", "18:00"],
      instructions: "Ta i samband med måltid för att minska magbesvär.",
      startDate: formatDate(addDays(today, -180)),
      active: true
    },
    {
      id: generateId(),
      name: "Alvedon",
      dosage: "500 mg",
      times: ["08:00", "14:00", "20:00"],
      instructions: "Vid behov för knäsmärta. Max 4 gram per dygn. Ta med mat.",
      startDate: formatDate(addDays(today, -90)),
      active: true
    },
    {
      id: generateId(),
      name: "D-vitamin",
      dosage: "20 µg",
      times: ["08:00"],
      instructions: "Ta tillsammans med frukost.",
      startDate: formatDate(addDays(today, -60)),
      active: true
    },
    {
      id: generateId(),
      name: "Omeprazol",
      dosage: "20 mg",
      times: ["07:30"],
      instructions: "Ta 30 minuter före frukost.",
      startDate: formatDate(addDays(today, -400)),
      active: false
    }
  ];

  // VÅRDBESÖK
  const testAppointments = [
    {
      id: generateId(),
      title: "Diabeteskontroll",
      date: formatDate(addDays(today, 7)),
      time: "09:30",
      location: "Vårdcentralen Centrum",
      doctor: "Dr. Erik Johansson",
      type: "followup",
      diagnosisId: "",
      purpose: "6-månaderskontroll av diabetes. Ta nya blodprover (HbA1c, njurfunktion).",
      prepNotes: "Fasta från kl 22 kvällen innan. Ta med blodsockerdagbok.",
      postNotes: "",
      reminder: true,
      medicationsAtTime: []
    },
    {
      id: generateId(),
      title: "Blodtryckskontroll",
      date: formatDate(addDays(today, 14)),
      time: "10:00",
      location: "Vårdcentralen Centrum",
      doctor: "Dr. Anna Lindqvist",
      type: "checkup",
      diagnosisId: "",
      purpose: "Årlig kontroll av blodtryck och medicinering.",
      prepNotes: "Mät blodtrycket hemma i en vecka innan besöket.",
      postNotes: "",
      reminder: true,
      medicationsAtTime: []
    },
    {
      id: generateId(),
      title: "Fysioterapi - knä",
      date: formatDate(addDays(today, 3)),
      time: "14:00",
      location: "Rehabkliniken",
      doctor: "Fysioterapeut Lisa Ek",
      type: "specialist",
      diagnosisId: "",
      purpose: "Uppföljning av träningsprogram för knäartros.",
      prepNotes: "Ta med träningskläder och skor.",
      postNotes: "",
      reminder: true,
      medicationsAtTime: []
    },
    {
      id: generateId(),
      title: "Årlig hälsokontroll",
      date: formatDate(addDays(today, -30)),
      time: "08:30",
      location: "Vårdcentralen Centrum",
      doctor: "Dr. Anna Lindqvist",
      type: "checkup",
      diagnosisId: "",
      purpose: "Rutinkontroll",
      prepNotes: "",
      postNotes: "Blodtrycket bra (132/82). Fortsätt med nuvarande medicinering. Boka ny tid om 6 månader.",
      reminder: false,
      medicationsAtTime: []
    },
    {
      id: generateId(),
      title: "Ögonbottenfotografering",
      date: formatDate(addDays(today, -60)),
      time: "11:00",
      location: "Ögonkliniken",
      doctor: "Dr. Per Nilsson",
      type: "test",
      diagnosisId: "",
      purpose: "Screening för diabetesrelaterade ögonförändringar",
      prepNotes: "",
      postNotes: "Inga tecken på retinopati. Nästa kontroll om 2 år.",
      reminder: false,
      medicationsAtTime: []
    },
    {
      id: generateId(),
      title: "Röntgen höger knä",
      date: formatDate(addDays(today, -95)),
      time: "13:30",
      location: "Röntgenavdelningen, Sjukhuset",
      doctor: "",
      type: "test",
      diagnosisId: "",
      purpose: "Utredning av knäsmärta",
      prepNotes: "",
      postNotes: "Artros påvisad. Remiss till fysioterapi.",
      reminder: false,
      medicationsAtTime: []
    }
  ];

  // DAGBOKSANTECKNINGAR
  const testDiaryEntries = [
    {
      id: generateId(),
      date: formatDate(today),
      mood: 4,
      symptoms: ["Trötthet"],
      notes: "Bra dag överlag! Gick en promenad på 30 minuter. Lite trött på eftermiddagen men det gick över.",
      appointmentId: ""
    },
    {
      id: generateId(),
      date: formatDate(addDays(today, -1)),
      mood: 3,
      symptoms: ["Huvudvärk", "Smärta"],
      notes: "Vaknade med lätt huvudvärk. Knät värkte lite efter gårdagens träning. Tog Alvedon som hjälpte.",
      appointmentId: ""
    },
    {
      id: generateId(),
      date: formatDate(addDays(today, -2)),
      mood: 5,
      symptoms: [],
      notes: "Fantastisk dag! Blodsockret stabilt hela dagen. Lagade en nyttig middag med familjen.",
      appointmentId: ""
    },
    {
      id: generateId(),
      date: formatDate(addDays(today, -3)),
      mood: 2,
      symptoms: ["Illamående", "Yrsel", "Trötthet"],
      notes: "Kände mig dålig på morgonen. Tror jag åt något som inte passade. Vilade hela dagen.",
      appointmentId: ""
    },
    {
      id: generateId(),
      date: formatDate(addDays(today, -5)),
      mood: 4,
      symptoms: [],
      notes: "Började med nya träningsprogrammet från fysioterapeuten. Övningarna kändes bra.",
      appointmentId: ""
    },
    {
      id: generateId(),
      date: formatDate(addDays(today, -7)),
      mood: 3,
      symptoms: ["Sömnsvårigheter"],
      notes: "Hade svårt att sova inatt. Vaknade flera gånger. Kanske dags att se över kvällsrutinerna.",
      appointmentId: ""
    },
    {
      id: generateId(),
      date: formatDate(addDays(today, -10)),
      mood: 4,
      symptoms: ["Smärta"],
      notes: "Lite stel i knät på morgonen men det släppte efter uppvärmning. Blodsockret 6.2 före frukost - bra!",
      appointmentId: ""
    },
    {
      id: generateId(),
      date: formatDate(addDays(today, -14)),
      mood: 3,
      symptoms: ["Ångest"],
      notes: "Orolig inför kommande läkarbesök. Försökte använda andningsövningar som hjälpte lite.",
      appointmentId: ""
    },
    {
      id: generateId(),
      date: formatDate(addDays(today, -30)),
      mood: 4,
      symptoms: [],
      notes: "Läkarbesöket gick bra! Blodtrycket var stabilt och läkaren var nöjd. Känner mig lättad.",
      appointmentId: ""
    },
    {
      id: generateId(),
      date: formatDate(addDays(today, -45)),
      mood: 3,
      symptoms: ["Huvudvärk", "Trötthet"],
      notes: "Stressig vecka på jobbet. Märker att det påverkar både sömn och energi.",
      appointmentId: ""
    }
  ];

  const testDoctorVisits = [
    {
      id: generateId(),
      date: addDays(today, -10).toISOString().split('T')[0],
      diagnosisId: testDiagnoses[0]?.id || '',
      appointmentId: testAppointments[3]?.id || '',
      title: 'Uppföljning hypertoni',
      time: '09:30',
      location: 'Vårdcentralen Centrum',
      doctor: 'Dr. Anna Lindqvist',
      type: 'checkup',
      purpose: 'Följa upp blodtryck och justering av medicinering',
      prepNotes: 'Ta med blodtryckslogg från senaste två veckorna',
      reminder: true,
      notes: 'Genomgång av blodtryckslogg. Rekommendation att fortsätta med nuvarande dos och boka ny kontroll om 3 månader.',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      date: addDays(today, -3).toISOString().split('T')[0],
      diagnosisId: testDiagnoses[1]?.id || '',
      appointmentId: testAppointments[0]?.id || '',
      title: 'Diabeteskontroll',
      time: '11:00',
      location: 'Diabetesmottagningen',
      doctor: 'Dr. Erik Johansson',
      type: 'followup',
      purpose: 'Gå igenom senaste prover och justera kost/motion',
      prepNotes: 'Mät blodsocker morgon och kväll tre dagar innan besöket',
      reminder: true,
      notes: 'Diskussion om kost och motion. Sätt upp mål att minska HbA1c till nästa besök.',
      createdAt: new Date().toISOString(),
    }
  ];

  // Spara till localStorage
  localStorage.setItem('vardcoachen-diagnoses', JSON.stringify(testDiagnoses));
  localStorage.setItem('vardcoachen-medications', JSON.stringify(testMedications));
  localStorage.setItem('vardcoachen-appointments', JSON.stringify(testAppointments));
  localStorage.setItem('vardcoachen-diary', JSON.stringify(testDiaryEntries));
  localStorage.setItem('vardcoachen-doctorVisits', JSON.stringify(testDoctorVisits));
  localStorage.setItem('vardcoachen-visitAiNotes', JSON.stringify({}));

  console.log('✅ Testdata har laddats!');
  console.log(`   - ${testDiagnoses.length} diagnoser`);
  console.log(`   - ${testMedications.length} läkemedel`);
  console.log(`   - ${testAppointments.length} vårdbesök`);
  console.log(`   - ${testDiaryEntries.length} dagboksanteckningar`);
  
  return true;
};

function AppContent() {
  const { state } = useApp();
  const { activeView } = state;
  
  // Initialize reminders
  useReminders();

  // Ladda testdata vid första körningen
  useEffect(() => {
    const loaded = loadTestData();
    if (loaded) {
      // Ladda om sidan för att hämta data i context
      window.location.reload();
    }
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'calendar':
        return <CalendarView />;
      case 'medications':
        return <MedicationsView />;
      case 'diagnoses':
        return <DiagnosesView />;
      case 'diary':
        return <DiaryView />;
      case 'reminders':
        return <RemindersView />;
      case 'questions':
        return <QuestionsView />;
      case 'analysis':
        return <OverallAnalysisView />;
      case 'notebook':
        return <NotebookView />;
      case 'visits':
        return <DoctorVisitsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Mobile Header */}
      <Header />
      
      {/* Main Content Area */}
      <div className="app-container">
        <main className="main-content">
          {renderView()}
        </main>
        
        {/* Footer - only on desktop */}
        <footer className="app-footer">
          <p>Vårdcoachen ersätter inte medicinsk rådgivning. Kontakta alltid vården vid frågor.</p>
        </footer>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <BottomNav />
      
      {/* Global Components */}
      <Notifications />
      <ExportModal />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

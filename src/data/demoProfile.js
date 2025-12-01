export const demoProfileData = {
  diagnoses: [
    {
      id: 'diag-type2',
      name: 'Typ 2-diabetes',
      date: '2024-03-14',
      doctor: 'Dr. Karin Svensson',
      description: 'Diagnos efter långtidsutredning med förhöjt HbA1c och instabil blodsockerkontroll.',
      treatment: 'Livsstilsförändringar, kostprogram och metformin 500 mg x2.'
    },
    {
      id: 'diag-hypo',
      name: 'Hypotyreos',
      date: '2023-11-02',
      doctor: 'Dr. Jonas Persson',
      description: 'Trötthet, frusenhet och TSH på 7,8 ledde till diagnos av underfunktion i sköldkörteln.',
      treatment: 'Levotyroxin 50 mcg dagligen, uppföljning efter tre månader.'
    }
  ],
  medications: [
    {
      id: 'med-metformin',
      name: 'Metformin',
      dosage: '500 mg',
      frequency: '2 gånger per dag',
      startDate: '2025-12-05',
      times: ['08:00', '20:00'],
      active: true,
      instructions: 'Tas tillsammans med mat, morgon och kväll för att undvika magbesvär.'
    },
    {
      id: 'med-levotyroxin',
      name: 'Levotyroxin',
      dosage: '50 mcg',
      frequency: '1 gång per dag',
      startDate: '2025-12-01',
      times: ['06:30'],
      active: true,
      instructions: 'Tas på fastande mage minst 30 min före frukost.'
    }
  ],
  diaryEntries: [
    {
      id: 'diary-1',
      date: '2024-05-20',
      mood: 'neutral',
      entry: 'Bra energi på morgonen. Tränade lätt och kände mig pigg fram till lunch.'
    },
    {
      id: 'diary-2',
      date: '2024-05-18',
      mood: 'low',
      entry: 'Kände mig trött och hade huvudvärk på eftermiddagen. Behöver se över vätskeintag.'
    }
  ],
  appointments: [
    {
      id: 'apt-endocrine',
      type: 'checkup',
      title: 'Uppföljning diabetes',
      date: '2025-12-11',
      time: '09:30',
      location: 'Capio Citykliniken',
      doctor: 'Dr. Karin Svensson',
      notes: 'Ta med blodsockerdagbok och lista med frågor.'
    },
    {
      id: 'apt-dietician',
      type: 'consultation',
      title: 'Kostrådgivning',
      date: '2025-12-03',
      time: '14:00',
      location: 'Dietistmottagningen',
      doctor: 'Lisa Holm',
      notes: 'Fokusera på mellanmål för jämnare blodsocker.'
    }
  ],
  aiNotes: {
    'diag-type2': [
      {
        id: 'ai-diag-type2-1',
        question: 'Översiktlig analys',
        answer: 'Stabil utveckling med förbättrade värden de senaste veckorna. Fortsätt nuvarande plan och följ upp HbA1c om 6 veckor.',
        createdAt: '2024-05-17T09:00:00.000Z'
      }
    ]
  },
  medicationAiNotes: {
    'med-metformin': [
      {
        id: 'med-ai-met-1',
        question: 'Översiktlig analys',
        answer: 'Metformin hjälper kroppen att använda insulin mer effektivt och jämna ut blodsockret över dagen. Fortsätt att ta medicinen med mat och följ blodsockret för att fånga tecken på magbesvär eller hypoglykemi.',
        createdAt: '2025-12-06T08:30:00.000Z'
      }
    ]
  },
  medicationInteractionNotes: [],
  overallAiNotes: [
    {
      id: 'overall-1',
      title: 'Veckosammanfattning',
      content: 'Träningen rullar på och medicineringen följs enligt plan. Försök lägga till en extra promenad efter middagen för bättre sömn.',
      createdAt: '2024-05-19T19:30:00.000Z'
    }
  ],
  medicationLog: {
    '2025-12-12': {
      'med-metformin': true,
      'med-levotyroxin': true
    },
    '2025-12-11': {
      'med-metformin': true,
      'med-levotyroxin': true
    }
  },
  doctorVisits: [
    {
      id: 'visit-endo-apr',
      date: '2025-12-08',
      doctor: 'Dr. Karin Svensson',
      clinic: 'Endokrinmottagningen',
      summary: 'Justering av metformin-dos och genomgång av blodsockervärden.',
      followUp: 'Återbesök om två månader, lämna blodprov vecka 22.'
    }
  ],
  visitAiNotes: {
    'visit-endo-apr': [
      {
        id: 'visit-endo-apr-note',
        note: 'Doktorn rekommenderade att hålla koll på kvällsmål och fortsätta föra logg i appen.',
        createdAt: '2025-12-08T13:30:00.000Z'
      }
    ]
  },
  notes: [
    {
      id: 'note-questions',
      title: 'Frågor till läkaren',
      content: 'Kan vi minska huvudvärken genom annan dosering? Finns alternativ till metformin om magen fortsätter krångla?',
      createdAt: '2024-05-16T08:00:00.000Z'
    }
  ]
};

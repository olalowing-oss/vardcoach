import { useCallback } from 'react';
import { useApp } from '../context/AppContext';

const DEFAULT_MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';
const API_URL = import.meta.env.VITE_AI_PROXY_URL || '/api/ai';

export function useAI() {
  const { state, actions } = useApp();
  const { isLoading } = state;

  const analyzeWithAI = useCallback(async (prompt, options = {}) => {
    actions.setLoading(true);
    actions.setAiResponse(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          options: {
            ...options,
            model: options.model || DEFAULT_MODEL,
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.error || `API error ${response.status}`);
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content?.trim() || 'Kunde inte få svar från AI.';
      actions.setAiResponse(result);
      return result;
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage = 'Ett fel uppstod vid AI-analysen. Försök igen senare.';
      actions.setAiResponse(errorMessage);
      return errorMessage;
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  // Generate diagnosis analysis prompt
  const analyzeDiagnosis = useCallback((diagnosis) => {
    const prompt = `Du är en hjälpsam medicinsk informationsassistent för appen Vårdcoachen. 
    Användaren har registrerat följande diagnos och vill förstå den bättre.
    
    VIKTIGT: Du ger INTE medicinska råd eller behandlingsrekommendationer. 
    Du ger endast allmän information för att hjälpa användaren förstå sin situation bättre 
    och förbereda sig för samtal med sin läkare.
    
    Diagnos: ${diagnosis.name}
    ${diagnosis.description ? `Beskrivning: ${diagnosis.description}` : ''}
    ${diagnosis.treatment ? `Aktuell behandling: ${diagnosis.treatment}` : ''}
    
    Ge en kort, lättförståelig förklaring av:
    1. Vad denna diagnos innebär i allmänhet
    2. Vanliga frågor patienter brukar ha
    3. Saker som kan vara bra att diskutera med läkaren
    
    Skriv på svenska. Håll det kort och koncist (max 250 ord).
    Avsluta alltid med en påminnelse om att kontakta vården vid frågor.`;

    return analyzeWithAI(prompt);
  }, [analyzeWithAI]);

  const askDiagnosisFollowUp = useCallback((diagnosis, question) => {
    const userQuestion = question?.trim();
    if (!userQuestion) {
      return Promise.resolve('Ange en fråga för att få ett svar.');
    }

    const prompt = `Du hjälper en användare i appen Vårdcoachen att förstå sin diagnos bättre.

Diagnos: ${diagnosis.name}
${diagnosis.description ? `Beskrivning: ${diagnosis.description}` : ''}
${diagnosis.treatment ? `Aktuell behandling: ${diagnosis.treatment}` : ''}

Användarens följdfråga: ${userQuestion}

Svara kortfattat och tydligt på svenska (max 200 ord).
Påminn om att informationen inte ersätter medicinsk rådgivning.`;

    return analyzeWithAI(prompt, { maxTokens: 700, temperature: 0.3 });
  }, [analyzeWithAI]);

  const analyzeMedication = useCallback((medication) => {
    const prompt = `Du hjälper användare i appen Vårdcoachen att förstå sina läkemedel bättre.

Läkemedel: ${medication.name}
${medication.dosage ? `Dosering: ${medication.dosage}` : ''}
${medication.frequency ? `Frekvens: ${medication.frequency}` : ''}
${medication.times?.length ? `Tider: ${medication.times.join(', ')}` : ''}
${medication.instructions ? `Instruktioner från användaren: ${medication.instructions}` : ''}

Förklara kortfattat:
1. Vad läkemedlet vanligtvis används till
2. Vanliga saker att ha koll på eller fråga sin läkare om
3. Tips på hur användaren kan följa upp effekten

Skriv på svenska, max 220 ord och påminn om att kontakta vården vid frågor.
Ge inga behandlingsråd, utan bara generell information.`;

    return analyzeWithAI(prompt);
  }, [analyzeWithAI]);

  const askMedicationFollowUp = useCallback((medication, question) => {
    const userQuestion = question?.trim();
    if (!userQuestion) {
      return Promise.resolve('Ange en fråga för att få ett svar.');
    }

    const prompt = `Du hjälper användaren i Vårdcoachen med frågor om läkemedlet ${medication.name}.

Dosering: ${medication.dosage || 'Ej angivet'}
Tider: ${medication.times?.join(', ') || 'Ej angivet'}
Instruktioner: ${medication.instructions || 'Inga anteckningar'}

Användarens fråga: ${userQuestion}

Svara kort och tydligt på svenska (max 180 ord). Påminn om att kontakta vården vid osäkerhet.`;

    return analyzeWithAI(prompt, { maxTokens: 650, temperature: 0.3 });
  }, [analyzeWithAI]);

  const analyzeMedicationInteractions = useCallback((medications = []) => {
    if (!medications.length) {
      return Promise.resolve('Lägg till minst ett aktivt läkemedel för att kunna analysera.');
    }

    const medicationSummary = medications
      .map((med, index) => {
        const details = [
          `Läkemedel ${index + 1}: ${med.name}`,
          med.dosage ? `Dos: ${med.dosage}` : '',
          med.times?.length ? `Tider: ${med.times.join(', ')}` : '',
          med.instructions ? `Användarinstruktion: ${med.instructions}` : '',
          med.frequency ? `Frekvens: ${med.frequency}` : '',
        ].filter(Boolean);
        return details.join(' | ');
      })
      .join('\n');

    const prompt = `Du är en försiktig informationsassistent i Vårdcoachen.
    
Användaren vill förstå hur deras aktiva läkemedel kan påverka varandra och vad som är viktigt att följa upp.

Aktiva läkemedel:
${medicationSummary}

Analysera kort:
1. Möjliga interaktioner eller överlapp att fråga läkare/apotek om
2. Observationer användaren kan följa upp hemma (t.ex. symtom, tider, måltider)
3. Förslag på frågor till vården

Skriv på svenska (max 260 ord). Ge inga medicinska råd, påminn om att kontakta vården vid osäkerhet.`;

    return analyzeWithAI(prompt, { maxTokens: 850, temperature: 0.3 });
  }, [analyzeWithAI]);

  const askMedicationInteractionsFollowUp = useCallback((medications = [], question) => {
    if (!medications.length) {
      return Promise.resolve('Lägg till minst ett aktivt läkemedel för att kunna analysera.');
    }

    const userQuestion = question?.trim();
    if (!userQuestion) {
      return Promise.resolve('Ange en fråga för att få ett svar.');
    }

    const medicationSummary = medications
      .map(med => `${med.name}${med.dosage ? ` (${med.dosage})` : ''}`)
      .join(', ');

    const prompt = `Du hjälper en användare i Vårdcoachen med frågor om hur deras aktiva läkemedel samspelar.

Aktiva läkemedel: ${medicationSummary}
Användarens fråga: ${userQuestion}

Svara kort på svenska (max 200 ord) och påminn om att kontakta vården vid osäkerhet.`;

    return analyzeWithAI(prompt, { maxTokens: 700, temperature: 0.3 });
  }, [analyzeWithAI]);

  // Generate questions for doctor
  const generateQuestions = useCallback(async (context) => {
    const { appointment, diagnosis, medications, recentDiary } = context;

    let prompt = `Du är en hjälpsam assistent i appen Vårdcoachen som hjälper patienter 
    förbereda sig inför läkarbesök genom att föreslå relevanta frågor.
    
    VIKTIGT: Frågorna ska hjälpa patienten få ut mer av sitt läkarbesök. 
    De ska vara konkreta, relevanta och lätta att förstå.
    
    Kommande besök: ${appointment.title}
    Datum: ${appointment.date}
    ${appointment.purpose ? `Syfte: ${appointment.purpose}` : ''}
    ${diagnosis ? `Kopplad diagnos: ${diagnosis.name}` : ''}
    ${medications?.length > 0 ? `Aktuella läkemedel: ${medications.map(m => m.name).join(', ')}` : ''}
    ${recentDiary?.length > 0 ? `Senaste dagboksanteckningar: ${recentDiary.map(d => d.notes).join('; ')}` : ''}
    
    Föreslå 5-7 relevanta frågor som patienten kan ställa vid besöket.
    Formatera som en numrerad lista.
    Skriv på svenska.`;

    return analyzeWithAI(prompt);
  }, [analyzeWithAI]);

  // Analyze diary patterns
  const analyzeDiaryPatterns = useCallback(async (entries) => {
    if (entries.length < 3) {
      return "Du behöver minst 3 dagboksanteckningar för att kunna se mönster.";
    }

    const entriesSummary = entries.slice(0, 10).map(e => 
      `${e.date}: Humör ${e.mood}/5, Symtom: ${e.symptoms?.join(', ') || 'inga'}, Anteckning: ${e.notes || 'ingen'}`
    ).join('\n');

    const prompt = `Du är en hjälpsam assistent i Vårdcoachen som analyserar hälsodagbok-mönster.
    
    VIKTIGT: Du ger INTE medicinska råd. Du identifierar endast mönster som kan vara 
    värdefulla att diskutera med vårdpersonal.
    
    Här är de senaste dagboksanteckningarna:
    ${entriesSummary}
    
    Analysera och sammanfatta:
    1. Eventuella mönster i humör
    2. Återkommande symtom
    3. Saker som kan vara värda att ta upp med läkaren
    
    Håll det kort (max 150 ord). Skriv på svenska.`;

    return analyzeWithAI(prompt);
  }, [analyzeWithAI]);

  const analyzeOverallHealth = useCallback((diagnoses = [], medications = []) => {
    if (!diagnoses.length) {
      return Promise.resolve('Lägg till minst en diagnos för att kunna göra en helhetsanalys.');
    }

    const diagnosisSummary = diagnoses.map((diag, index) => {
      const parts = [
        `Diagnos ${index + 1}: ${diag.name}`,
      ];
      if (diag.description) parts.push(`Beskrivning: ${diag.description}`);
      if (diag.treatment) parts.push(`Behandling: ${diag.treatment}`);
      if (diag.date) parts.push(`Datum: ${diag.date}`);
      return parts.join(' | ');
    }).join('\n');

    const medicationSummary = medications.length > 0
      ? medications.map((med, index) => {
          const details = [
            `Läkemedel ${index + 1}: ${med.name}`,
            med.dosage ? `Dos: ${med.dosage}` : '',
            med.times?.length ? `Tider: ${med.times.join(', ')}` : '',
            med.instructions ? `Instruktioner: ${med.instructions}` : '',
          ].filter(Boolean);
          return details.join(' | ');
        }).join('\n')
      : 'Inga läkemedel registrerade.';

    const prompt = `Du är en försiktig medicinsk informationsassistent i appen Vårdcoachen.

Användaren vill få en helhetsanalys av sina pågående diagnoser och läkemedel för att identifiera möjliga samband eller saker att diskutera med vården.

Diagnoser:
${diagnosisSummary}

Läkemedel:
${medicationSummary}

Analysera:
1. Eventuella samband eller överlapp mellan diagnoserna
2. Hur nuvarande läkemedel relaterar till diagnoserna (dubbla behandlingar, interaktioner att fråga om etc.)
3. Förslag på frågor eller observationer att ta med till nästa vårdbesök

Skriv på svenska, max 300 ord. Påminn alltid om att detta inte ersätter medicinsk rådgivning.`;

    return analyzeWithAI(prompt, { maxTokens: 900, temperature: 0.25 });
  }, [analyzeWithAI]);

  const askOverallFollowUp = useCallback((diagnoses = [], medications = [], question) => {
    if (!diagnoses.length) {
      return Promise.resolve('Lägg till minst en diagnos för att kunna analysera.');
    }

    const userQuestion = question?.trim();
    if (!userQuestion) {
      return Promise.resolve('Ange en fråga för att få ett svar.');
    }

    const prompt = `Du hjälper en användare i Vårdcoachen att förstå helheten i sina diagnoser och läkemedel.

Diagnoser:
${diagnoses.map(diag => `- ${diag.name}${diag.description ? ` (${diag.description})` : ''}`).join('\n')}

Läkemedel:
${medications.length ? medications.map(med => `- ${med.name}${med.dosage ? ` ${med.dosage}` : ''}`).join('\n') : 'Inga registrerade läkemedel.'}

Användarens följdfråga: ${userQuestion}

Svara kort och tydligt på svenska (max 200 ord) och påminn om att informationen inte ersätter medicinsk rådgivning.`;

    return analyzeWithAI(prompt, { maxTokens: 700, temperature: 0.3 });
  }, [analyzeWithAI]);

  const analyzeDoctorVisit = useCallback((visit, diagnosis) => {
    const prompt = `Du är en assistent som hjälper patienten att analysera vad som togs upp vid ett läkarbesök.

Besöksdatum: ${visit.date}
Diagnos: ${diagnosis ? diagnosis.name : 'Ej vald'}
Anteckningar från besöket: ${visit.notes || 'Ingen anteckning angiven'}

Sammanfatta:
1. Viktiga punkter från besöket
2. Eventuella uppföljningar eller åtgärder
3. Frågor som kan vara bra att ställa nästa gång

Svara kort på svenska och påminn om att kontakta vården vid frågor.`;

    return analyzeWithAI(prompt, { maxTokens: 700, temperature: 0.3 });
  }, [analyzeWithAI]);

  return {
    isLoading,
    analyzeWithAI,
    analyzeDiagnosis,
    askDiagnosisFollowUp,
    analyzeMedication,
    askMedicationFollowUp,
    analyzeMedicationInteractions,
    askMedicationInteractionsFollowUp,
    analyzeOverallHealth,
    askOverallFollowUp,
    generateQuestions,
    analyzeDiaryPatterns,
    analyzeDoctorVisit,
  };
}

export default useAI;

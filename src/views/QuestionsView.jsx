import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAI } from '../hooks/useAI';
import { Card, Button, Select } from '../components/common';
import { formatDate } from '../utils/helpers';
import './QuestionsView.css';

export function QuestionsView() {
  const { state } = useApp();
  const { appointments, diagnoses, medications, diaryEntries } = state;
  const { generateQuestions, isLoading } = useAI();
  
  const [selectedAptId, setSelectedAptId] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState(null);

  // Get upcoming appointments
  const upcomingAppointments = appointments
    .filter(a => new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const selectedAppointment = appointments.find(a => a.id === selectedAptId);

  const handleGenerateQuestions = async () => {
    if (!selectedAppointment) return;

    const diagnosis = selectedAppointment.diagnosisId 
      ? diagnoses.find(d => d.id === selectedAppointment.diagnosisId)
      : null;

    const activeMeds = medications.filter(m => m.active);
    const recentDiary = diaryEntries.slice(0, 5);

    const result = await generateQuestions({
      appointment: selectedAppointment,
      diagnosis,
      medications: activeMeds,
      recentDiary,
    });

    setGeneratedQuestions(result);
  };

  // Parse questions from AI response
  const parseQuestions = (text) => {
    if (!text) return [];
    const lines = text.split('\n').filter(line => line.trim());
    return lines.filter(line => /^\d+[\.\)]/.test(line.trim()) || line.trim().startsWith('-'));
  };

  const questions = generatedQuestions ? parseQuestions(generatedQuestions) : [];

  return (
    <div className="questions-view">
      <h1 className="page-title">Frågor till läkaren</h1>

      <Card className="intro-card">
        <p>
          Låt AI hjälpa dig förbereda relevanta frågor inför ditt nästa läkarbesök. 
          Frågorna baseras på ditt kommande besök, diagnoser, läkemedel och dagboksanteckningar.
        </p>
      </Card>

      {/* Appointment selector */}
      <Card className="selector-card">
        <h2>Välj besök</h2>
        
        {upcomingAppointments.length === 0 ? (
          <div className="no-appointments">
            <p>Du har inga kommande besök inbokade.</p>
            <Button 
              variant="outline"
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'calendar' }))}
            >
              Boka ett besök
            </Button>
          </div>
        ) : (
          <>
            <Select
              value={selectedAptId}
              onChange={(e) => {
                setSelectedAptId(e.target.value);
                setGeneratedQuestions(null);
              }}
              options={upcomingAppointments.map(apt => ({
                value: apt.id,
                label: `${apt.title} - ${formatDate(apt.date)}`
              }))}
              placeholder="Välj ett kommande besök..."
            />

            {selectedAppointment && (
              <div className="selected-appointment">
                <h3>{selectedAppointment.title}</h3>
                <div className="apt-details">
                  <span>📅 {formatDate(selectedAppointment.date)}</span>
                  <span>🕐 {selectedAppointment.time}</span>
                  <span>📍 {selectedAppointment.location}</span>
                </div>
                {selectedAppointment.purpose && (
                  <p className="apt-purpose">
                    <strong>Syfte:</strong> {selectedAppointment.purpose}
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={handleGenerateQuestions}
              disabled={!selectedAptId}
              loading={isLoading}
              fullWidth
            >
              🤖 Generera frågor
            </Button>
          </>
        )}
      </Card>

      {/* Generated questions */}
      {generatedQuestions && (
        <Card className="questions-card">
          <h2>📝 Föreslagna frågor</h2>
          
          <div className="questions-list">
            {questions.length > 0 ? (
              questions.map((question, idx) => (
                <div key={idx} className="question-item">
                  {question}
                </div>
              ))
            ) : (
              <div className="ai-response">
                {generatedQuestions.split('\n').map((para, idx) => (
                  para.trim() && <p key={idx}>{para}</p>
                ))}
              </div>
            )}
          </div>

          <div className="questions-actions">
            <Button 
              variant="outline"
              onClick={handleGenerateQuestions}
              loading={isLoading}
            >
              🔄 Generera nya frågor
            </Button>
          </div>
        </Card>
      )}

      {/* Tips card */}
      <Card className="tips-card">
        <h3>💡 Tips inför läkarbesöket</h3>
        <ul>
          <li>Skriv ner dina frågor i förväg så du inte glömmer dem</li>
          <li>Berätta om alla symtom, även de som verkar obetydliga</li>
          <li>Ta med en lista över alla läkemedel du tar</li>
          <li>Be om skriftlig information om du får nya instruktioner</li>
          <li>Fråga om du inte förstår - det är din rätt!</li>
        </ul>
      </Card>
    </div>
  );
}

export default QuestionsView;

import React, { useState } from 'react';
import { styles, colors } from '../styles/styles';
import { formatDate, getTypeIcon, isPast } from '../utils/helpers';

export function Questions({ diagnoses, medications, diaryEntries, appointments, ai, isMobile }) {
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [customQuestion, setCustomQuestion] = useState('');

  const nextAppointment = appointments
    .filter(a => !isPast(a.date))
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const handleGenerateQuestions = async () => {
    const result = await ai.generateQuestions({
      diagnoses,
      medications: medications.filter(m => m.active),
      diaryEntries: diaryEntries.slice(-5),
      nextAppointment,
    });

    if (result) {
      // Parse numbered questions from the response
      const questions = result
        .split('\n')
        .filter(line => line.trim() && /^\d/.test(line.trim()));
      setGeneratedQuestions(questions);
    }
  };

  const handleAskQuestion = () => {
    if (!customQuestion.trim()) return;
    
    ai.analyzeQuestion(customQuestion, {
      diagnoses,
      medications: medications.filter(m => m.active),
    });
    
    setCustomQuestion('');
  };

  return (
    <div style={styles.contentInner}>
      <h2 style={styles.pageTitle}>❓ Frågor till läkaren</h2>
      <p style={{ color: colors.textLight, marginBottom: '1.5rem' }}>
        Förbered frågor inför ditt nästa läkarbesök
      </p>

      {/* Next Appointment */}
      {nextAppointment && (
        <div style={{
          background: `linear-gradient(135deg, #e8f5e9, #c8e6c9)`,
          borderRadius: '16px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          border: `2px solid ${colors.primary}`,
        }}>
          <h3 style={{ color: colors.primary, margin: '0 0 0.75rem' }}>
            📅 Nästa besök
            {nextAppointment.reminder && ' 🔔'}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2rem' }}>{getTypeIcon(nextAppointment.type)}</span>
            <div>
              <strong>{nextAppointment.title}</strong>
              <div style={{ fontSize: '0.9rem', color: colors.textLight }}>
                {formatDate(nextAppointment.date)} kl {nextAppointment.time}
                {nextAppointment.location && ` • ${nextAppointment.location}`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Generated Questions */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🤖 Genererade uppföljningsfrågor</h3>
        <p style={{ color: colors.textMuted, fontSize: '0.9rem', marginBottom: '1rem' }}>
          Baserat på dina diagnoser, läkemedel och symtom
        </p>
        
        <button
          style={{
            ...styles.button,
            background: `linear-gradient(135deg, ${colors.purple}, #8e44ad)`,
          }}
          onClick={handleGenerateQuestions}
          disabled={ai.isLoading}
        >
          {ai.isLoading ? '⏳ Genererar...' : '✨ Generera frågor'}
        </button>

        {generatedQuestions.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            {generatedQuestions.map((question, i) => (
              <div
                key={i}
                style={{
                  padding: '1rem 1.25rem',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  borderLeft: `4px solid ${colors.purple}`,
                  marginBottom: '0.75rem',
                }}
              >
                {question}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Question */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>💬 Ställ en egen fråga</h3>
        <p style={{ color: colors.textMuted, fontSize: '0.9rem', marginBottom: '1rem' }}>
          AI hjälper dig förstå och formulera din fråga bättre
        </p>
        
        <textarea
          style={styles.textarea}
          rows={3}
          placeholder="Skriv din fråga här..."
          value={customQuestion}
          onChange={e => setCustomQuestion(e.target.value)}
        />
        
        <button
          style={{ ...styles.button, ...styles.buttonSecondary }}
          onClick={handleAskQuestion}
          disabled={ai.isLoading || !customQuestion.trim()}
        >
          {ai.isLoading ? '⏳ Analyserar...' : '🔍 Analysera fråga'}
        </button>
      </div>

      {/* AI Response */}
      {ai.response && (
        <div style={{
          background: '#f8fafc',
          borderRadius: '16px',
          marginTop: '1.5rem',
          overflow: 'hidden',
          border: `2px solid ${colors.border}`,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            background: `linear-gradient(135deg, ${colors.secondary}, #2980b9)`,
            color: 'white',
          }}>
            <span style={{ fontWeight: 600 }}>🤖 AI-svar</span>
            <button
              style={styles.modalClose}
              onClick={ai.clearResponse}
            >
              ✕
            </button>
          </div>
          <div style={{ padding: '1.25rem', maxHeight: '400px', overflowY: 'auto' }}>
            {ai.response.split('\n').map((line, i) => (
              <p key={i} style={{ margin: '0 0 0.5rem' }}>{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div style={{
        background: '#fef9e7',
        borderRadius: '16px',
        padding: '1.25rem',
        border: '2px solid #f7dc6f',
        marginTop: '1.5rem',
      }}>
        <h3 style={{ color: '#856404', marginTop: 0, marginBottom: '0.75rem' }}>
          💡 Tips inför läkarbesöket
        </h3>
        <ul style={{
          margin: 0,
          paddingLeft: '1.25rem',
          color: '#856404',
          lineHeight: 1.8,
        }}>
          <li>Skriv ner dina frågor i förväg</li>
          <li>Ta med en lista på alla dina läkemedel</li>
          <li>Beskriv symtom med när, var, hur ofta</li>
          <li>Be om förklaringar om du inte förstår</li>
          <li>Ta med någon som stöd om du behöver</li>
          <li>Skriv ner vad läkaren säger direkt efter besöket</li>
        </ul>
      </div>
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button, Modal, Input, Textarea } from '../components/common';
import { generateId, formatDate } from '../utils/helpers';
import './NotebookView.css';

export function NotebookView() {
  const { state, actions } = useApp();
  const { notes } = state;

  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    content: '',
  });

  const groupedNotes = useMemo(() => {
    const groups = notes.reduce((acc, note) => {
      const day = note.date || note.createdAt?.split('T')[0];
      if (!acc[day]) acc[day] = [];
      acc[day].push(note);
      return acc;
    }, {});

    return Object.keys(groups)
      .sort((a, b) => new Date(b) - new Date(a))
      .map(date => ({
        date,
        entries: groups[date].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      }));
  }, [notes]);

  const openNewNote = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      title: '',
      content: '',
    });
    setEditingNote(null);
    setShowModal(true);
  };

  const openEditNote = (note) => {
    setFormData({
      date: note.date || new Date().toISOString().split('T')[0],
      title: note.title || '',
      content: note.content || '',
    });
    setEditingNote(note);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.content.trim()) return;

    if (editingNote) {
      actions.updateNote({
        ...editingNote,
        ...formData,
        updatedAt: new Date().toISOString(),
      });
    } else {
      actions.addNote({
        id: generateId(),
        ...formData,
        createdAt: new Date().toISOString(),
      });
    }

    setShowModal(false);
  };

  const handleDelete = (note) => {
    if (window.confirm('Vill du ta bort anteckningen?')) {
      actions.deleteNote(note.id);
    }
  };

  return (
    <div className="notebook-view">
      <div className="view-header">
        <h1 className="page-title">Anteckningsbok</h1>
        <Button onClick={openNewNote}>+ Ny anteckning</Button>
      </div>
      <p className="page-subtitle">Skriv ner dina tankar och observationer. Alla anteckningar sorteras per dag.</p>

      {groupedNotes.length === 0 ? (
        <Card className="empty-state">
          <span className="empty-icon">📝</span>
          <p>Inga anteckningar ännu. Klicka på "Ny anteckning" för att börja.</p>
        </Card>
      ) : (
        <div className="notes-list">
          {groupedNotes.map(day => (
            <Card key={day.date} className="notes-day">
              <div className="notes-day-header">
                <h3>{formatDate(day.date)}</h3>
                <span>{day.entries.length} anteckningar</span>
              </div>
              <div className="notes-day-list">
                {day.entries.map(note => (
                  <div key={note.id} className="note-entry">
                    {note.title && <h4>{note.title}</h4>}
                    <p>{note.content}</p>
                    <div className="note-meta">
                      <span>{new Date(note.createdAt).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}</span>
                      <div className="note-actions">
                        <button onClick={() => openEditNote(note)}>✏️</button>
                        <button onClick={() => handleDelete(note)}>🗑</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingNote ? 'Redigera anteckning' : 'Ny anteckning'}
        icon="📝"
      >
        <div className="form-group">
          <Input
            label="Datum"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div className="form-group">
          <Input
            label="Rubrik"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Valfri rubrik"
          />
        </div>
        <div className="form-group">
          <Textarea
            label="Anteckning"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={5}
            placeholder="Skriv dina tankar..."
            required
          />
        </div>
        <div className="modal-actions">
          <div className="modal-actions-right">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Avbryt
            </Button>
            <Button onClick={handleSave}>
              {editingNote ? 'Spara' : 'Lägg till'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default NotebookView;

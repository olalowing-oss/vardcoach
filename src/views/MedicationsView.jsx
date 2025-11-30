import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button, Modal, Input, Textarea, Toggle } from '../components/common';
import { generateId, formatDate } from '../utils/helpers';
import './MedicationsView.css';

export function MedicationsView() {
  const { state, actions } = useApp();
  const { medications, medicationLog } = state;
  
  const [showModal, setShowModal] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [filter, setFilter] = useState('active'); // 'active', 'inactive', 'all'
  const [viewMode, setViewMode] = useState('list'); // 'list', 'history'
  
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    times: ['08:00'],
    instructions: '',
    startDate: new Date().toISOString().split('T')[0],
    active: true,
  });

  const filteredMeds = medications.filter(med => {
    if (filter === 'active') return med.active;
    if (filter === 'inactive') return !med.active;
    return true;
  });

  const medicationMap = useMemo(() => {
    const map = {};
    medications.forEach((med) => {
      map[med.id] = med.name;
    });
    return map;
  }, [medications]);

  const historyEntries = useMemo(() => {
    if (!medicationLog) return [];
    return Object.entries(medicationLog).map(([date, meds]) => {
      const medNames = Object.keys(meds)
        .map((id) => medicationMap[id])
        .filter(Boolean);
      return {
        date,
        medNames,
        count: medNames.length,
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [medicationLog, medicationMap]);

  const openNewMedication = () => {
    setFormData({
      name: '',
      dosage: '',
      times: ['08:00'],
      instructions: '',
      startDate: new Date().toISOString().split('T')[0],
      active: true,
    });
    setSelectedMed(null);
    setShowModal(true);
  };

  const openEditMedication = (med) => {
    setFormData({
      name: med.name,
      dosage: med.dosage,
      times: med.times || ['08:00'],
      instructions: med.instructions || '',
      startDate: med.startDate || new Date().toISOString().split('T')[0],
      active: med.active,
    });
    setSelectedMed(med);
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.dosage) return;

    if (selectedMed) {
      actions.updateMedication({ ...selectedMed, ...formData });
    } else {
      actions.addMedication({ id: generateId(), ...formData });
    }

    setShowModal(false);
  };

  const handleDelete = () => {
    if (selectedMed && window.confirm('Vill du ta bort detta läkemedel?')) {
      actions.deleteMedication(selectedMed.id);
      setShowModal(false);
    }
  };

  const addTime = () => {
    setFormData({ ...formData, times: [...formData.times, '12:00'] });
  };

  const removeTime = (index) => {
    const newTimes = formData.times.filter((_, i) => i !== index);
    setFormData({ ...formData, times: newTimes.length > 0 ? newTimes : ['08:00'] });
  };

  const updateTime = (index, value) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({ ...formData, times: newTimes });
  };

  const activeMeds = medications.filter(m => m.active).length;
  const inactiveMeds = medications.filter(m => !m.active).length;

  return (
    <div className="medications-view">
      <div className="view-header">
        <h1 className="page-title">Läkemedel</h1>
        <Button onClick={openNewMedication}>+ Lägg till</Button>
      </div>

      <div className="medications-tabs">
        <button
          className={`medications-tab ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          Mina läkemedel
        </button>
        <button
          className={`medications-tab ${viewMode === 'history' ? 'active' : ''}`}
          onClick={() => setViewMode('history')}
        >
          Intagshistorik
        </button>
      </div>

      {viewMode === 'list' ? (
        <>
      {/* Filter tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Aktiva ({activeMeds})
        </button>
        <button 
          className={`filter-tab ${filter === 'inactive' ? 'active' : ''}`}
          onClick={() => setFilter('inactive')}
        >
          Avslutade ({inactiveMeds})
        </button>
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Alla
        </button>
      </div>

      {/* Medications list */}
      {filteredMeds.length === 0 ? (
        <Card className="empty-state">
          <span className="empty-icon">💊</span>
          <p>
            {filter === 'active' 
              ? 'Inga aktiva läkemedel' 
              : filter === 'inactive' 
                ? 'Inga avslutade läkemedel' 
                : 'Inga läkemedel registrerade'}
          </p>
          <Button onClick={openNewMedication}>Lägg till ditt första läkemedel</Button>
        </Card>
      ) : (
        <div className="medications-list">
          {filteredMeds.map(med => (
            <Card key={med.id} className={`med-card ${!med.active ? 'inactive' : ''}`}>
              <div className="med-header">
                <div className="med-title-row">
                  <h3 className="med-name">{med.name}</h3>
                </div>
                <span className="med-dosage">{med.dosage}</span>
              </div>
              
              <div className="med-times">
                {med.times.map((time, idx) => (
                  <span key={idx} className="time-chip">{time}</span>
                ))}
              </div>
              
              {med.instructions && (
                <p className="med-instructions">{med.instructions}</p>
              )}
              
              <div className="med-footer">
                <span className="med-date">
                  Sedan {formatDate(med.startDate)}
                </span>
                <div className="med-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => openEditMedication(med)}
                  >
                    ✏️
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
        </>
      ) : (
        <div className="med-history-list">
          {historyEntries.length === 0 ? (
            <Card className="empty-state">
              <span className="empty-icon">📅</span>
              <p>Inga registrerade intag ännu. Markera läkemedel på dashboarden för att skapa historik.</p>
            </Card>
          ) : (
            historyEntries.map(entry => (
              <Card key={entry.date} className="history-card">
                <div className="history-header">
                  <div>
                    <h3>{formatDate(entry.date)}</h3>
                    <p>{entry.count} läkemedel markerade</p>
                  </div>
                </div>
                <div className="history-meds">
                  {entry.medNames.length > 0 ? (
                    entry.medNames.map((name, idx) => (
                      <span key={`${entry.date}-${name}-${idx}`} className="history-med-chip">
                        {name}
                      </span>
                    ))
                  ) : (
                    <p className="summary-empty">Inga läkemedel registrerade denna dag.</p>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedMed ? 'Redigera läkemedel' : 'Nytt läkemedel'}
        icon="💊"
      >
        <div className="form-group">
          <Input
            label="Läkemedelsnamn"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="T.ex. Alvedon"
            required
          />
        </div>

        <div className="form-group">
          <Input
            label="Dosering"
            value={formData.dosage}
            onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            placeholder="T.ex. 500mg"
            required
          />
        </div>

        <div className="form-group">
          <label className="input-label">Doseringstider</label>
          <div className="times-list">
            {formData.times.map((time, index) => (
              <div key={index} className="time-input-row">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => updateTime(index, e.target.value)}
                  className="time-input"
                />
                {formData.times.length > 1 && (
                  <button 
                    className="remove-time-btn"
                    onClick={() => removeTime(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button className="add-time-btn" onClick={addTime}>
            + Lägg till tid
          </button>
        </div>

        <div className="form-group">
          <Textarea
            label="Instruktioner"
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            placeholder="T.ex. Ta med mat"
            rows={2}
          />
        </div>

        <div className="form-group">
          <Input
            label="Startdatum"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>

        <div className="form-row">
          <Toggle
            label="Aktiv medicinering"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
          />
        </div>

        <div className="modal-actions">
          {selectedMed && (
            <Button variant="danger" onClick={handleDelete}>
              Ta bort
            </Button>
          )}
          <div className="modal-actions-right">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Avbryt
            </Button>
            <Button onClick={handleSubmit}>
              {selectedMed ? 'Spara' : 'Lägg till'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default MedicationsView;

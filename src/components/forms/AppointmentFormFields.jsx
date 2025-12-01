import React from 'react';
import { Input, Select, Textarea, Checkbox } from '../common';

export function AppointmentFormFields({
  formData,
  setFormData,
  appointmentTypes = [],
  diagnosisOptions = [],
  showDiagnosis = true,
  showPurpose = true,
  showPrepNotes = true,
  showReminder = true,
}) {
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <div className="form-grid">
        <Input
          label="Titel"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="T.ex. Läkarbesök"
          required
        />

        {appointmentTypes.length > 0 && (
          <Select
            label="Typ av besök"
            value={formData.type}
            onChange={(e) => updateField('type', e.target.value)}
            options={appointmentTypes}
          />
        )}

        <Input
          label="Datum"
          type="date"
          value={formData.date}
          onChange={(e) => updateField('date', e.target.value)}
          required
        />

        <Input
          label="Tid"
          type="time"
          value={formData.time}
          onChange={(e) => updateField('time', e.target.value)}
        />

        <Input
          label="Plats"
          value={formData.location}
          onChange={(e) => updateField('location', e.target.value)}
          placeholder="T.ex. Vårdcentralen"
        />

        <Input
          label="Läkare"
          value={formData.doctor}
          onChange={(e) => updateField('doctor', e.target.value)}
          placeholder="T.ex. Dr. Andersson"
        />

        {showDiagnosis && diagnosisOptions.length > 0 && (
          <Select
            label="Kopplad diagnos"
            value={formData.diagnosisId}
            onChange={(e) => updateField('diagnosisId', e.target.value)}
            options={diagnosisOptions}
            placeholder="Välj diagnos (valfritt)"
          />
        )}
      </div>

      {showPurpose && (
        <Textarea
          label="Syfte med besöket"
          value={formData.purpose}
          onChange={(e) => updateField('purpose', e.target.value)}
          placeholder="Vad vill du ta upp?"
          rows={3}
        />
      )}

      {showPrepNotes && (
        <Textarea
          label="Förberedelser"
          value={formData.prepNotes}
          onChange={(e) => updateField('prepNotes', e.target.value)}
          placeholder="Saker att tänka på innan besöket"
          rows={2}
        />
      )}

      {showReminder && (
        <Checkbox
          label="Påminn mig dagen innan"
          checked={Boolean(formData.reminder)}
          onChange={(e) => updateField('reminder', e.target.checked)}
        />
      )}
    </>
  );
}

export default AppointmentFormFields;

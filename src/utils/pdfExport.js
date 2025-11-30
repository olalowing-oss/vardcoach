import { getMoodLabel, formatDate } from './helpers';

// Load jsPDF dynamically
const loadJsPDF = () => {
  return new Promise((resolve, reject) => {
    if (window.jspdf) {
      resolve(window.jspdf);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => resolve(window.jspdf);
    script.onerror = () => reject(new Error('Failed to load jsPDF'));
    document.head.appendChild(script);
  });
};

export const exportToPDF = async (data, options) => {
  const { diagnoses, medications, appointments, diaryEntries } = data;
  const { includeDiagnoses, includeMedications, includeAppointments, includeDiary } = options;

  try {
    const jspdf = await loadJsPDF();
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    let y = 10;
    const pageWidth = 210;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    const checkPageBreak = (needed = 30) => {
      if (y + needed > 280) {
        doc.addPage();
        y = 20;
        return true;
      }
      return false;
    };

    const addHeader = () => {
      // Green header
      doc.setFillColor(46, 125, 92);
      doc.rect(0, 0, pageWidth, 28, 'F');
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Vårdcoachen - Vårdöversikt', margin, 18);
      
      // Export date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const exportDate = new Date().toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Exporterad: ${exportDate}`, pageWidth - margin - 50, 18);
      
      y = 38;
    };

    const addSectionTitle = (title, icon) => {
      checkPageBreak(20);
      doc.setTextColor(46, 125, 92);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${icon} ${title}`, margin, y);
      y += 8;
      
      // Underline
      doc.setDrawColor(46, 125, 92);
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin + 60, y);
      y += 8;
      
      doc.setTextColor(0, 0, 0);
    };

    // Start PDF
    addHeader();

    // Diagnoses Section
    if (includeDiagnoses && diagnoses.length > 0) {
      addSectionTitle('Diagnoser', '🔬');
      
      diagnoses.forEach((diag, index) => {
        checkPageBreak(40);
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${diag.name}`, margin, y);
        y += 6;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Diagnostiserad: ${formatDate(diag.date)} ${diag.doctor ? `av ${diag.doctor}` : ''}`, margin + 5, y);
        y += 5;
        
        doc.setTextColor(0, 0, 0);
        
        if (diag.description) {
          const descLines = doc.splitTextToSize(diag.description, contentWidth - 10);
          doc.text(descLines, margin + 5, y);
          y += descLines.length * 5;
        }
        
        if (diag.treatment) {
          doc.setFont('helvetica', 'italic');
          const treatLines = doc.splitTextToSize(`Behandling: ${diag.treatment}`, contentWidth - 10);
          doc.text(treatLines, margin + 5, y);
          y += treatLines.length * 5;
          doc.setFont('helvetica', 'normal');
        }
        
        y += 8;
      });
      
      y += 5;
    }

    // Medications Section
    if (includeMedications && medications.length > 0) {
      addSectionTitle('Läkemedel', '💊');
      
      const activeMeds = medications.filter(m => m.active);
      const inactiveMeds = medications.filter(m => !m.active);
      
      if (activeMeds.length > 0) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(46, 125, 92);
        doc.text('Aktiva läkemedel:', margin, y);
        y += 7;
        doc.setTextColor(0, 0, 0);
        
        activeMeds.forEach(med => {
          checkPageBreak(25);
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`• ${med.name} - ${med.dosage}`, margin + 3, y);
          y += 5;
          
          doc.setFont('helvetica', 'normal');
          doc.text(`  Doseringstider: ${med.times.join(', ')}`, margin + 3, y);
          y += 5;
          
          if (med.instructions) {
            const instrLines = doc.splitTextToSize(`  ${med.instructions}`, contentWidth - 15);
            doc.text(instrLines, margin + 3, y);
            y += instrLines.length * 4;
          }
          
          y += 3;
        });
      }
      
      if (inactiveMeds.length > 0) {
        y += 3;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(150, 150, 150);
        doc.text('Avslutade läkemedel:', margin, y);
        y += 7;
        
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        inactiveMeds.forEach(med => {
          checkPageBreak(15);
          doc.text(`• ${med.name} - ${med.dosage}`, margin + 3, y);
          y += 5;
        });
        
        doc.setTextColor(0, 0, 0);
      }
      
      y += 8;
    }

    // Appointments Section
    if (includeAppointments && appointments.length > 0) {
      addSectionTitle('Vårdbesök', '📅');
      
      const sortedApts = [...appointments]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);
      
      sortedApts.forEach(apt => {
        checkPageBreak(30);
        
        const isPast = new Date(apt.date) < new Date();
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${apt.title}`, margin, y);
        
        if (isPast) {
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text('(Genomfört)', margin + doc.getTextWidth(apt.title) + 5, y);
        }
        
        y += 5;
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(9);
        doc.text(`${formatDate(apt.date)} kl ${apt.time} • ${apt.location}`, margin + 3, y);
        y += 4;
        
        if (apt.doctor) {
          doc.text(`Läkare: ${apt.doctor}`, margin + 3, y);
          y += 4;
        }
        
        doc.setTextColor(0, 0, 0);
        
        if (apt.postNotes) {
          doc.setFontSize(9);
          const noteLines = doc.splitTextToSize(`Anteckningar: ${apt.postNotes}`, contentWidth - 10);
          doc.text(noteLines, margin + 3, y);
          y += noteLines.length * 4;
        }
        
        y += 6;
      });
      
      y += 5;
    }

    // Diary Section
    if (includeDiary && diaryEntries.length > 0) {
      addSectionTitle('Hälsodagbok', '📔');
      
      const recentEntries = diaryEntries.slice(0, 15);
      
      recentEntries.forEach(entry => {
        checkPageBreak(25);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${formatDate(entry.date)} - ${getMoodLabel(entry.mood)}`, margin, y);
        y += 5;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        if (entry.symptoms && entry.symptoms.length > 0) {
          doc.setTextColor(100, 100, 100);
          doc.text(`Symtom: ${entry.symptoms.join(', ')}`, margin + 3, y);
          y += 4;
        }
        
        doc.setTextColor(0, 0, 0);
        
        if (entry.notes) {
          const noteLines = doc.splitTextToSize(entry.notes, contentWidth - 10);
          doc.text(noteLines, margin + 3, y);
          y += noteLines.length * 4;
        }
        
        y += 5;
      });
    }

    // Footer on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(margin, 285, pageWidth - margin, 285);
      
      // Page number
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(`Sida ${i} av ${pageCount}`, margin, 292);
      
      // Disclaimer
      doc.text('Vårdcoachen - Ersätter inte medicinsk rådgivning', pageWidth - margin - 70, 292);
    }

    // Save the PDF
    const fileName = `vardcoachen-export-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw error;
  }
};

export default exportToPDF;

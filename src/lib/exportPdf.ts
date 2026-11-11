import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportToPdf(options: {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  fileName: string;
}) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Header banner
  doc.setFillColor(11, 27, 43); // Navy #0B1B2B
  doc.rect(0, 0, 297, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PEJABAT PENDIDIKAN DAERAH TUARAN — e-HADIR TUARAN', 14, 11);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(options.title.toUpperCase(), 14, 18);

  // Subtitle / metadata
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  const printDate = `Tarikh Cetakan: ${new Date().toLocaleDateString('ms-MY', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })} | Salinan Rasmi Pentadbiran`;
  doc.text(printDate, 14, 31);

  if (options.subtitle) {
    doc.text(options.subtitle, 14, 36);
  }

  const startY = options.subtitle ? 40 : 34;

  autoTable(doc, {
    head: [options.headers],
    body: options.rows,
    startY: startY,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 64, 175], // Blue #1E40AF
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${options.fileName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

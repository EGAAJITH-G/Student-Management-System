import { jsPDF } from 'jspdf';

// Helper to draw a border frame around the page
const drawPageBorder = (doc, width, height) => {
  doc.setDrawColor(220, 225, 235); // Light slate border
  doc.setLineWidth(0.5);
  doc.rect(10, 10, width - 20, height - 20); // 10mm margins border
  doc.rect(11.5, 11.5, width - 23, height - 23); // Double line frame
};

// Helper to draw a header crest placeholder
const drawHeaderCrest = (doc, x, y) => {
  doc.setFillColor(99, 102, 241); // Primary indigo
  doc.circle(x, y, 6, 'F');
  doc.setFillColor(255, 255, 255);
  doc.circle(x, y, 3, 'F');
  doc.setFillColor(168, 85, 247); // Purple detail
  doc.circle(x + 4, y + 4, 2, 'F');
};

const pdfGenerator = {
  /**
   * Generates and downloads a student's semester report card PDF
   */
  generateStudentReportCard: (student, semester, marks, gpa, totalCredits) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;

    // Page styling & borders
    drawPageBorder(doc, pageWidth, pageHeight);

    // 1. Institution Banner Header
    drawHeaderCrest(doc, 25, 25);
    
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('EDUPORTAL INSTITUTION OF ACADEMICS', 35, 24);
    
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Official Semester Evaluation & Transcript Record', 35, 29);

    // Decorative rule
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.8);
    doc.line(15, 35, pageWidth - 15, 35);

    // 2. Student Metadata Section
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('STUDENT PROFILE', 15, 45);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105); // Slate 600
    
    // Left Column details
    doc.text(`Full Name: ${student?.name || 'N/A'}`, 15, 52);
    doc.text(`Course/Major: ${student?.course || 'N/A'}`, 15, 58);
    doc.text(`Email Address: ${student?.email || 'N/A'}`, 15, 64);
    
    // Right Column details
    doc.text(`Academic Semester: Semester ${semester}`, 130, 52);
    doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`, 130, 58);
    doc.text(`Report Status: Final Consolidated`, 130, 64);

    // Dividers
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.4);
    doc.line(15, 70, pageWidth - 15, 70);

    // 3. Transcript Table Headers
    doc.setFillColor(248, 250, 252); // Slate 50 background
    doc.rect(15, 76, pageWidth - 30, 8, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, 76, pageWidth - 30, 8, 'S');

    doc.setTextColor(100, 116, 139);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    
    doc.text('Subject Course Name', 18, 81.5);
    doc.text('Credits', 90, 81.5, { align: 'center' });
    doc.text('Internals (/40)', 115, 81.5, { align: 'center' });
    doc.text('Semester (/60)', 140, 81.5, { align: 'center' });
    doc.text('Total (/100)', 165, 81.5, { align: 'center' });
    doc.text('Grade', 183, 81.5, { align: 'center' });
    doc.text('GP', 193, 81.5, { align: 'center' });

    // 4. Data Rows
    let currentY = 84;
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);

    marks.forEach((rec, idx) => {
      currentY += 8;
      // Zebra stripe row backgrounds
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, currentY - 5, pageWidth - 30, 8, 'F');
      }
      
      // Bottom border line for each row
      doc.setDrawColor(241, 245, 249);
      doc.line(15, currentY + 3, pageWidth - 15, currentY + 3);

      doc.text(rec.subject, 18, currentY);
      doc.text(`${rec.credits}`, 90, currentY, { align: 'center' });
      doc.text(`${rec.internalMarks}`, 115, currentY, { align: 'center' });
      doc.text(`${rec.semesterMarks}`, 140, currentY, { align: 'center' });
      doc.text(`${rec.totalMarks}%`, 165, currentY, { align: 'center' });
      doc.text(rec.grade, 183, currentY, { align: 'center' });
      doc.text(`${rec.gradePoints}`, 193, currentY, { align: 'center' });
    });

    // 5. Dynamic GPA Card Summary Section
    currentY += 15;
    
    // Draw card box
    doc.setFillColor(99, 102, 241); // Primary Indigo Card
    doc.roundedRect(15, currentY, pageWidth - 30, 24, 2, 2, 'F');

    // GPA highlights text
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('SEMESTER PERFORMANCE DASHBOARD', 20, currentY + 7);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Total Credits Completed: ${totalCredits} Credits`, 20, currentY + 13);
    doc.text(`Evaluation System: 10-Point Scale`, 20, currentY + 18);

    // Big GPA indicator on right
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(gpa > 0 ? gpa.toFixed(2) : '0.00', 170, currentY + 14, { align: 'center' });
    doc.setFontSize(8);
    doc.text('SEMESTER GPA', 170, currentY + 19, { align: 'center' });

    // 6. Signature Block
    currentY += 45;
    doc.setDrawColor(148, 163, 184); // Slate 400
    doc.setLineWidth(0.4);
    
    // Signature lines
    doc.line(20, currentY, 70, currentY);
    doc.line(140, currentY, 190, currentY);

    doc.setTextColor(100, 116, 139);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Student Signature', 45, currentY + 4, { align: 'center' });
    doc.text('Dean of Evaluation / Registrar', 165, currentY + 4, { align: 'center' });

    // 7. Electronic Notice Notice
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('This is an electronically verified transcript report generated from the academic student database.', pageWidth / 2, pageHeight - 15, { align: 'center' });

    // Trigger Download
    const filename = `Grade_Card_Sem_${semester}_${student?.name?.replace(/\s+/g, '_') || 'Student'}.pdf`;
    doc.save(filename);
  },

  /**
   * Generates and downloads a monthly attendance audit log PDF
   */
  generateAttendanceReport: (monthName, year, logs, isSingleStudent) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;

    drawPageBorder(doc, pageWidth, pageHeight);

    // 1. Institution Banner Header
    drawHeaderCrest(doc, 25, 25);
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('EDUPORTAL INSTITUTION OF ACADEMICS', 35, 24);
    
    doc.setTextColor(100, 116, 139);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Monthly Student Attendance Compliance Audit Ledger', 35, 29);

    // Decorative line
    doc.setDrawColor(168, 85, 247); // Purple line
    doc.setLineWidth(0.8);
    doc.line(15, 35, pageWidth - 15, 35);

    // 2. Metadata Section
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('ATTENDANCE REPORT DETAILS', 15, 45);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    
    doc.text(`Target Month/Year: ${monthName} ${year}`, 15, 52);
    doc.text(`Log Scope: ${isSingleStudent ? 'Individual Student Audit' : 'Cohort-wide Registry'}`, 15, 58);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 130, 52);
    doc.text(`Total Records: ${logs.length} Students`, 130, 58);

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(15, 64, pageWidth - 15, 64);

    // 3. Table Headers
    doc.setFillColor(248, 250, 252);
    doc.rect(15, 70, pageWidth - 30, 8, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, 70, pageWidth - 30, 8, 'S');

    doc.setTextColor(100, 116, 139);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);

    doc.text('Student Profile details', 18, 75.5);
    doc.text('Major / Course', 80, 75.5);
    doc.text('Present', 130, 75.5, { align: 'center' });
    doc.text('Absent', 150, 75.5, { align: 'center' });
    doc.text('Total Days', 170, 75.5, { align: 'center' });
    doc.text('Rate (%)', 190, 75.5, { align: 'center' });

    // 4. Data rows
    let currentY = 78;
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);

    logs.forEach((item, idx) => {
      currentY += 8;
      
      // Page overflow check (just in case)
      if (currentY > pageHeight - 30) {
        doc.addPage();
        drawPageBorder(doc, pageWidth, pageHeight);
        currentY = 25;
        // Redraw table headers on new page
        doc.setFillColor(248, 250, 252);
        doc.rect(15, currentY, pageWidth - 30, 8, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(15, currentY, pageWidth - 30, 8, 'S');
        doc.setTextColor(100, 116, 139);
        doc.setFont('Helvetica', 'bold');
        doc.text('Student Profile details', 18, currentY + 5.5);
        doc.text('Major / Course', 80, currentY + 5.5);
        doc.text('Present', 130, currentY + 5.5, { align: 'center' });
        doc.text('Absent', 150, currentY + 5.5, { align: 'center' });
        doc.text('Total Days', 170, currentY + 5.5, { align: 'center' });
        doc.text('Rate (%)', 190, currentY + 5.5, { align: 'center' });
        
        currentY += 10;
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
      }

      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, currentY - 5, pageWidth - 30, 8, 'F');
      }

      doc.setDrawColor(241, 245, 249);
      doc.line(15, currentY + 3, pageWidth - 15, currentY + 3);

      const name = item.student?.name || 'N/A';
      const course = item.student?.course || 'N/A';
      
      doc.text(name, 18, currentY);
      doc.text(course, 80, currentY);
      doc.text(`${item.presentCount}`, 130, currentY, { align: 'center' });
      doc.text(`${item.absentCount}`, 150, currentY, { align: 'center' });
      doc.text(`${item.totalDays}`, 170, currentY, { align: 'center' });

      // Highlight low attendance rates (< 75%) in bold red
      const isAlert = item.rate < 75;
      if (isAlert) {
        doc.setTextColor(239, 68, 68); // Red 500
        doc.setFont('Helvetica', 'bold');
        doc.text(`${item.rate.toFixed(1)}% [LOW]`, 190, currentY, { align: 'center' });
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
      } else {
        doc.setTextColor(34, 197, 94); // Green 500
        doc.setFont('Helvetica', 'bold');
        doc.text(`${item.rate.toFixed(1)}%`, 190, currentY, { align: 'center' });
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
      }
    });

    // 5. Audit verification seal
    currentY += 15;
    if (currentY > pageHeight - 40) {
      doc.addPage();
      drawPageBorder(doc, pageWidth, pageHeight);
      currentY = 30;
    }

    doc.setFillColor(250, 245, 255); // Purple 50 background
    doc.setDrawColor(233, 213, 255); // Purple 200 border
    doc.roundedRect(15, currentY, pageWidth - 30, 16, 1.5, 1.5, 'FD');

    doc.setTextColor(126, 34, 206); // Purple 700
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('COMPLIANCE NOTE & VERIFICATION', 20, currentY + 6);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(88, 28, 135);
    doc.setFontSize(7.5);
    doc.text('Institutional attendance registers enforce a minimum compliance bar of 75.0% attendance. Enrollees with critical low rates require corrective action.', 20, currentY + 11);

    // Footer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Official compliance log generated automatically. Audit Date: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

    // Download file trigger
    const fileSuffix = isSingleStudent ? 'Personal' : 'Cohort';
    const filename = `Attendance_Audit_${monthName}_${year}_${fileSuffix}.pdf`;
    doc.save(filename);
  }
};

export default pdfGenerator;

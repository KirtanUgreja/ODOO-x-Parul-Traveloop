import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const pdfService = {
  async generateTripPDF(trip: any) {
    const doc = new jsPDF() as any;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // --- Cover Page ---
    doc.setFillColor(15, 23, 42); // Dark background
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
    
    doc.setTextColor(99, 102, 241); // Primary color
    doc.setFontSize(40);
    doc.text('TRAVELOOP', margin, 60);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text(trip.name.toUpperCase(), margin, 80);
    
    doc.setFontSize(14);
    doc.setTextColor(150, 150, 150);
    doc.text(`${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`, margin, 90);
    
    doc.setFontSize(12);
    doc.text(`A personalized adventure curated for ${trip.user?.name || 'you'}`, margin, 110);

    // --- Itinerary Section ---
    doc.addPage();
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(22);
    doc.text('Your Itinerary', margin, 30);

    const activities = trip.activities || [];
    const grouped = activities.reduce((acc: any, a: any) => {
      const date = new Date(a.date).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(a);
      return acc;
    }, {});

    let currentY = 45;

    Object.entries(grouped).forEach(([date, dayActivities]: [string, any], index) => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 30;
      }

      doc.setFontSize(16);
      doc.setTextColor(99, 102, 241);
      doc.text(`Day ${index + 1}: ${date}`, margin, currentY);
      currentY += 10;

      const tableData = dayActivities.map((a: any) => [
        a.time || '--:--',
        a.title,
        a.location,
        `$${a.cost}`
      ]);

      doc.autoTable({
        startY: currentY,
        head: [['Time', 'Activity', 'Location', 'Cost']],
        body: tableData,
        margin: { left: margin },
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
      });

      currentY = doc.lastAutoTable.finalY + 15;
    });

    // --- Budget Summary ---
    doc.addPage();
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text('Budget Summary', margin, 30);
    
    const total = activities.reduce((sum: number, a: any) => sum + (a.cost || 0), 0);
    
    doc.autoTable({
      startY: 45,
      head: [['Category', 'Total Cost']],
      body: [
        ['Total Planned Spending', `$${total}`],
        ['Estimated Average Daily', `$${(total / (Object.keys(grouped).length || 1)).toFixed(2)}`],
      ],
      margin: { left: margin },
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] },
    });

    doc.save(`${trip.name.replace(/\s+/g, '_')}_Itinerary.pdf`);
  }
};

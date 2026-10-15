import PDFDocument from 'pdfkit';

/**
 * Generate a clean, editorial, printable PDF project blueprint
 * using PDFKit for server-side generation.
 * Formatted for A4 or Letter, printer-friendly with clear typography and page breaks.
 */
export function generateProjectPdf(project, fabric = null) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 45, right: 45 },
        info: {
          Title: `Re:Style Blueprint — ${project.title}`,
          Author: 'Re:Style Atelier Engine',
          Subject: 'Sustainable Circular Sewing & DIY Making Blueprint',
          Keywords: 'upcycling, sewing, circular fashion, zero-waste'
        }
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      // Color Palette Constants
      const NAVY = '#253247';
      const CHARCOAL = '#333333';
      const MUTED = '#666666';
      const CORAL = '#C96F52';
      const BLUEGRAY = '#E2EBF0';
      const PAPER_BG = '#F7F4EE';

      // --- HEADER & BRANDING ---
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor(CORAL)
        .text('RE:STYLE ATELIER // CIRCULAR MAKER BLUEPRINT', { align: 'left', tracking: 2 });

      doc.moveDown(0.2);

      // Title & Subtitle
      doc
        .fontSize(20)
        .font('Times-Bold')
        .fillColor(NAVY)
        .text(project.title);

      if (project.subtitle) {
        doc.moveDown(0.1);
        doc
          .fontSize(10)
          .font('Times-Italic')
          .fillColor(MUTED)
          .text(project.subtitle);
      }

      doc.moveDown(0.5);

      // Meta pills bar: Category, Difficulty, Estimated Time
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor(NAVY)
        .text(
          `Category: ${project.category || 'Accessories'}  |  Difficulty: ${project.difficulty || 'Intermediate'}  |  Time: ${project.timeEstimate || '2 Hours'}  |  Status: ${(project.status || 'Planned').toUpperCase()}`
        );

      doc.moveDown(0.4);
      doc.strokeColor(BLUEGRAY).lineWidth(1).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.6);

      // --- FABRIC PROFILE CARD ---
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor(NAVY)
        .text('1. FABRIC REMNANT SPECIFICATION');

      doc.moveDown(0.3);

      const fabName = fabric ? fabric.name : (project.fabricSnapshot?.name || 'Selected Textile Remnant');
      const fabFiber = fabric ? (fabric.materialLabel || fabric.material) : (project.fabricSnapshot?.material || 'Natural Fiber');
      const fabColor = fabric ? fabric.dominantColor : (project.fabricSnapshot?.dominantColor || 'Observed Tone');
      const fabDim = fabric ? `${fabric.dimensions.length} × ${fabric.dimensions.width} ${fabric.dimensions.unit}` : (project.fabricAllocated ? `${project.fabricAllocated.length} × ${project.fabricAllocated.width} ${project.fabricAllocated.unit}` : 'Standard Remnant');
      const fabCond = fabric ? (fabric.conditionLabel || fabric.condition) : 'Good Remnant';

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(CHARCOAL)
        .text(`• Remnant Label: ${fabName}`)
        .text(`• Fiber & Weave: ${fabFiber}`)
        .text(`• Color Profile: ${fabColor}`)
        .text(`• Physical Dimensions: ${fabDim}`)
        .text(`• Textile Condition: ${fabCond}`);

      if (project.suitabilityReason) {
        doc.moveDown(0.3);
        doc
          .fontSize(8.5)
          .font('Helvetica-Oblique')
          .fillColor(MUTED)
          .text(`Why this fabric matches: ${project.suitabilityReason}`, { indent: 10 });
      }

      doc.moveDown(0.6);

      // --- MATERIALS & TOOLS CHECKLIST ---
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor(NAVY)
        .text('2. MATERIALS & TOOLS CHECKLIST');

      doc.moveDown(0.3);

      // 2 columns: Tools on left, Materials on right
      const startY = doc.y;

      // Left Column: Required Tools
      doc
        .fontSize(9.5)
        .font('Helvetica-Bold')
        .fillColor(NAVY)
        .text('Required Tools & Equipment:', 45, startY);

      doc.moveDown(0.2);
      const tools = Array.isArray(project.toolsNeeded) && project.toolsNeeded.length > 0 
        ? project.toolsNeeded 
        : ['Fabric shears', 'Measuring tape & tailor chalk', 'Sewing machine or hand needle', 'Steam iron'];

      tools.forEach(tool => {
        doc
          .fontSize(8.5)
          .font('Helvetica')
          .fillColor(CHARCOAL)
          .text(`[  ]  ${tool}`, 50);
      });

      const toolsEndY = doc.y;

      // Right Column: Materials & Notions
      doc
        .fontSize(9.5)
        .font('Helvetica-Bold')
        .fillColor(NAVY)
        .text('Materials & Notions:', 300, startY);

      doc.moveDown(0.2);
      const materials = Array.isArray(project.materialsNeeded) && project.materialsNeeded.length > 0
        ? project.materialsNeeded
        : [
            { name: `Main fabric piece: ${fabDim}`, required: true },
            { name: 'Matching color thread (poly or cotton)', required: true },
            { name: 'Contrasting scrap for lining or pocket', required: false }
          ];

      materials.forEach(mat => {
        const name = typeof mat === 'string' ? mat : `${mat.name}${mat.required ? ' (Required)' : ' (Optional)'}`;
        doc
          .fontSize(8.5)
          .font('Helvetica')
          .fillColor(CHARCOAL)
          .text(`[  ]  ${name}`, 305);
      });

      const maxColY = Math.max(toolsEndY, doc.y);
      doc.y = maxColY + 12;

      // --- CUTTING PLAN & ZERO-WASTE GEOMETRY ---
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor(NAVY)
        .text('3. GEOMETRIC CUTTING PLAN & PATTERN PIECES', 45);

      doc.moveDown(0.3);

      const cutting = project.cuttingPlan || {};
      const pieces = Array.isArray(cutting.patternPieces) && cutting.patternPieces.length > 0
        ? cutting.patternPieces
        : [
            { name: 'Main Outer Body Panel', count: 2, width: 35, height: 25, unit: 'cm', notes: 'Grain parallel to warp' },
            { name: 'Interior Drop Pocket', count: 1, width: 14, height: 12, unit: 'cm', notes: 'Cut from corner scrap' }
          ];

      doc
        .fontSize(8.5)
        .font('Helvetica')
        .fillColor(CHARCOAL)
        .text(`• Seam Allowance: ${cutting.seamAllowance || '1.0 cm (3/8 in) included on all edges'}`)
        .text(`• Grainline Alignment: ${cutting.grainline || 'Parallel to weave selvedge or warp'}`)
        .text(`• Cutting Strategy: ${cutting.remainingFabricNotes || 'Deterministic tessellation designed to minimize offcuts'}`);

      doc.moveDown(0.4);

      // Pattern Pieces Table
      doc
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .fillColor(NAVY)
        .text('Pattern Piece Name', 45)
        .text('Qty', 240, doc.y - 10)
        .text('Cut Dimensions', 280, doc.y - 10)
        .text('Notes / Grain Orientation', 380, doc.y - 10);

      doc.moveDown(0.2);
      doc.strokeColor(BLUEGRAY).lineWidth(0.5).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.2);

      pieces.forEach(p => {
        const dimStr = `${p.width} × ${p.height} ${p.unit || 'cm'}`;
        const curY = doc.y;
        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor(CHARCOAL)
          .text(p.name, 45, curY, { width: 190 })
          .text(String(p.count || 1), 245, curY)
          .text(dimStr, 280, curY)
          .text(p.notes || 'Straight cut', 380, curY, { width: 170 });
        doc.moveDown(0.3);
      });

      doc.moveDown(0.5);

      // --- STEP-BY-STEP INSTRUCTIONS ---
      // Check if we need a new page for instructions to prevent awkward cutoffs
      if (doc.y > 600) {
        doc.addPage();
      }

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor(NAVY)
        .text('4. STEP-BY-STEP CONSTRUCTION INSTRUCTIONS', 45);

      doc.moveDown(0.3);

      const steps = Array.isArray(project.steps) && project.steps.length > 0
        ? project.steps
        : [
            { step: 1, title: 'Square & press remnant', description: 'Align weave grainline and press flat with iron.' },
            { step: 2, title: 'Cut pattern pieces', description: 'Mark dimensions according to cutting plan and slice cleanly.' },
            { step: 3, title: 'Assemble structural seams', description: 'Stitch primary panels right sides together.' },
            { step: 4, title: 'Hem and finish', description: 'Fold hems twice, topstitch, and complete with final steam press.' }
          ];

      steps.forEach((s, idx) => {
        // Prevent overflowing single step across page boundary
        if (doc.y > 720) {
          doc.addPage();
        }

        const isDone = s.completed ? '[x]' : '[  ]';
        const num = s.step || idx + 1;

        doc
          .fontSize(9.5)
          .font('Helvetica-Bold')
          .fillColor(NAVY)
          .text(`${isDone} Step ${num}: ${s.title}`);

        doc.moveDown(0.1);
        doc
          .fontSize(8.5)
          .font('Helvetica')
          .fillColor(CHARCOAL)
          .text(s.description, { indent: 15, width: 490 });

        if (s.tip) {
          doc.moveDown(0.1);
          doc
            .fontSize(8)
            .font('Helvetica-Oblique')
            .fillColor(CORAL)
            .text(`* Atelier Pro-Tip: ${s.tip}`, { indent: 15, width: 490 });
        }

        doc.moveDown(0.4);
      });

      doc.moveDown(0.5);

      // --- SAFETY, MEASUREMENT & ZERO-WASTE NOTES ---
      if (doc.y > 700) {
        doc.addPage();
      }

      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor(NAVY)
        .text('5. SAFETY, MEASUREMENT & CIRCULAR NOTES', 45);

      doc.moveDown(0.2);
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor(MUTED)
        .text('• Concept visuals are illustrative inspirations; cut strictly according to the numerical dimensions above.')
        .text('• Test fabric shears on scrap piece before cutting main body panels.')
        .text('• Press every seam open or to one side immediately after sewing for crisp boutique finishes.')
        .text('• Save all residual offcuts for Re:Style "Use My Leftovers" scrap projects (coasters, scrunchies, sachets).');

      // Footer timestamp
      doc.moveDown(0.8);
      doc
        .fontSize(7.5)
        .font('Helvetica')
        .fillColor(MUTED)
        .text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} via Re:Style 2.0 Atelier Engine`, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

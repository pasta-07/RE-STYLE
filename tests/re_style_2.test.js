import assert from 'assert';
import 'dotenv/config';
import app, { validateConceptsConstraints, isImageAssociatedWithFabric } from '../server.js';
import store from '../server/store.js';

console.log('================================================================');
console.log('🧪 Re:Style 2.0 Comprehensive Automated Integration Test Suite');
console.log('================================================================\n');

let server;
const TEST_PORT = 5099;
const BASE_URL = `http://localhost:${TEST_PORT}`;
const TEST_USER = `test-maker-${Date.now()}`;

let totalTests = 0;
let passedTests = 0;

async function runTest(name, fn) {
  totalTests++;
  process.stdout.write(`▶ ${name}... `);
  try {
    await fn();
    passedTests++;
    console.log('✅ PASSED');
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    console.error(err);
  }
}

// Start test HTTP server
await new Promise(resolve => {
  server = app.listen(TEST_PORT, () => {
    resolve();
  });
});

try {
  // ---------------------------------------------------------------------------
  // 1. INVENTORY TESTS (Feature 1)
  // ---------------------------------------------------------------------------
  let createdFabricId = null;

  await runTest('1.1 Stash — Add fabric piece with dimensions and properties', async () => {
    const res = await fetch(`${BASE_URL}/api/fabrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': TEST_USER },
      body: JSON.stringify({
        name: 'Deadstock Linen Slub',
        material: 'linen',
        materialLabel: '100% Normandy Flax Linen',
        dominantColor: 'Sage Green',
        secondaryColors: ['Ecru', 'Olive'],
        pattern: 'Slub Texture',
        dimensions: { length: 50, width: 40, unit: 'cm' },
        shape: 'rectangular',
        totalQuantity: 2,
        condition: 'new',
        conditionLabel: 'Crisp Remnant',
        stretch: 'none',
        thickness: 'medium',
        weightGsm: 210,
        purchaseCost: 14.5,
        storageLocation: 'Shelf 3',
        notes: 'Beautiful crisp drape for apparel or home',
        source: 'purchased'
      })
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.fabric.id);
    assert.strictEqual(data.fabric.name, 'Deadstock Linen Slub');
    assert.strictEqual(data.fabric.totalQuantity, 2);
    assert.strictEqual(data.fabric.availableQuantity, 2);
    assert.strictEqual(data.fabric.reservedQuantity, 0);
    assert.strictEqual(data.fabric.consumedQuantity, 0);
    createdFabricId = data.fabric.id;
  });

  await runTest('1.2 Stash — Reject invalid dimensions and negative quantities', async () => {
    const res = await fetch(`${BASE_URL}/api/fabrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': TEST_USER },
      body: JSON.stringify({
        name: 'Invalid Fabric',
        dimensions: { length: -10, width: 20, unit: 'cm' },
        totalQuantity: -1
      })
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  await runTest('1.3 Stash — Edit fabric dimensions and notes', async () => {
    const res = await fetch(`${BASE_URL}/api/fabrics/${createdFabricId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-id': TEST_USER },
      body: JSON.stringify({
        dimensions: { length: 55, width: 42, unit: 'cm' },
        notes: 'Updated dimension measurements after steam pressing'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.fabric.dimensions.length, 55);
    assert.strictEqual(data.fabric.dimensions.width, 42);
    assert.strictEqual(data.fabric.notes, 'Updated dimension measurements after steam pressing');
  });

  await runTest('1.4 Stash — Filter fabrics by material and availability', async () => {
    const res = await fetch(`${BASE_URL}/api/fabrics?material=linen&availability=available`, {
      headers: { 'x-user-id': TEST_USER }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.fabrics.length >= 1);
    assert.strictEqual(data.fabrics[0].material, 'linen');
  });

  await runTest('1.5 Stash — Reserve fabric quantity and prevent negative availability', async () => {
    const res = await fetch(`${BASE_URL}/api/fabrics/${createdFabricId}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': TEST_USER },
      body: JSON.stringify({ quantity: 1, projectId: 'proj-test-1' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.fabric.reservedQuantity, 1);
    assert.strictEqual(data.fabric.availableQuantity, 1);

    // Over-reservation should fail safely
    const failRes = await fetch(`${BASE_URL}/api/fabrics/${createdFabricId}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': TEST_USER },
      body: JSON.stringify({ quantity: 5, projectId: 'proj-test-fail' })
    });
    assert.strictEqual(failRes.status, 400);
  });

  await runTest('1.6 Stash — Consume fabric and prevent double-consumption by same project', async () => {
    const res = await fetch(`${BASE_URL}/api/fabrics/${createdFabricId}/consume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': TEST_USER },
      body: JSON.stringify({ quantity: 1, projectId: 'proj-test-1' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.fabric.consumedQuantity, 1);
    assert.strictEqual(data.fabric.reservedQuantity, 0);

    // Attempting same project consuming twice must be rejected
    const duplicateRes = await fetch(`${BASE_URL}/api/fabrics/${createdFabricId}/consume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': TEST_USER },
      body: JSON.stringify({ quantity: 1, projectId: 'proj-test-1' })
    });
    assert.strictEqual(duplicateRes.status, 400);
    const dupData = await duplicateRes.json();
    assert.ok(/duplicate consumption prevented/i.test(dupData.error));
  });

  // ---------------------------------------------------------------------------
  // 2. PROJECT PLANNER TESTS (Feature 2)
  // ---------------------------------------------------------------------------
  await runTest('2.1 Planner — Recommend feasible projects that fit available fabric', async () => {
    const res = await fetch(`${BASE_URL}/api/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': TEST_USER },
      body: JSON.stringify({
        fabric: {
          dimensions: { length: 45, width: 35, unit: 'cm' },
          material: 'denim',
          condition: 'good'
        },
        preferences: {
          skill: 'Intermediate',
          tools: ['Fabric shears', 'Sewing machine', 'Steam iron'],
          time: '1–3 hours',
          intendedUse: 'bags'
        }
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.recommendations.length > 0);
    const topRec = data.recommendations[0];
    assert.ok(topRec.matchScore >= 70);
    assert.strictEqual(topRec.feasibility.status, 'feasible');
    assert.ok(topRec.suitabilityReason.length > 0);
    assert.ok(topRec.cuttingPlan.patternPieces.length > 0);
    assert.ok(topRec.steps.length > 0);
  });

  await runTest('2.2 Planner — Reject or penalize projects when fabric is insufficient', async () => {
    const res = await fetch(`${BASE_URL}/api/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': TEST_USER },
      body: JSON.stringify({
        fabric: {
          dimensions: { length: 15, width: 10, unit: 'cm' }, // tiny scrap
          material: 'linen',
          condition: 'good'
        },
        preferences: {
          skill: 'Beginner',
          tools: ['Fabric shears', 'Hand-sewing supplies']
        }
      })
    });
    const data = await res.json();
    const largeTote = data.recommendations.find(r => r.id === 'rec-origami-tote');
    assert.ok(largeTote);
    assert.strictEqual(largeTote.feasibility.status, 'insufficient_material');
    assert.ok(/smaller than the required cutting blueprint minimum/i.test(largeTote.feasibility.notes));

    // But a small cord wrap or coaster should be feasible!
    const smallProject = data.recommendations.find(r => r.id === 'rec-cable-tie-wraps' || r.id === 'rec-scrunchie-duo');
    assert.ok(smallProject);
    assert.ok(['feasible', 'tight'].includes(smallProject.feasibility.status), 'Small project should be feasible or tight fit');
  });

  await runTest('2.3 Planner — Handle unknown dimensions with transparency', async () => {
    const res = await fetch(`${BASE_URL}/api/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': TEST_USER },
      body: JSON.stringify({
        fabric: {
          dimensions: { length: 0, width: 0, unit: 'cm' },
          material: 'cotton'
        }
      })
    });
    const data = await res.json();
    assert.ok(data.recommendations.length > 0);
    assert.strictEqual(data.recommendations[0].feasibility.status, 'unknown');
    assert.ok(/confirm remnant/i.test(data.recommendations[0].feasibility.notes));
  });

  await runTest('2.4 Planner — Parse colloquial dimensions (e.g. "a 4 × 4 piece") and scale blueprint feasibility', async () => {
    const res = await fetch(`${BASE_URL}/api/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': TEST_USER },
      body: JSON.stringify({
        fabric: {
          name: 'Compact Denim Offcut',
          dimensionsText: 'a 4 × 4 piece', // 4x4 in = ~10.16x10.16 cm = 103 cm²
          material: 'denim',
          condition: 'good'
        }
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.recommendations.length > 0);

    // Large tote bag (needs 56x34 cm) must be flagged as insufficient material
    const largeTote = data.recommendations.find(r => r.id === 'rec-origami-tote');
    assert.ok(largeTote);
    assert.strictEqual(largeTote.feasibility.status, 'insufficient_material');
    assert.ok(largeTote.matchScore < 50);

    // Compact lavender sachet (10x10 cm) or cable wrap (15x5 cm) should be feasible
    const compactProject = data.recommendations.find(r => r.id === 'rec-lavender-sachet' || r.id === 'rec-cable-tie-wraps');
    assert.ok(compactProject);
    assert.ok(['feasible', 'tight'].includes(compactProject.feasibility.status));
  });

  await runTest('2.5 Planner — Differentiate blueprints by garment type and distressed condition', async () => {
    const jeansRes = await fetch(`${BASE_URL}/api/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': TEST_USER },
      body: JSON.stringify({
        fabric: {
          name: 'Worn Jeans',
          clothingType: 'Vintage Denim Jeans',
          dimensions: { length: 80, width: 35, unit: 'cm' },
          material: 'denim',
          condition: 'distressed',
          notes: 'Torn knees and faded thighs'
        }
      })
    });
    assert.strictEqual(jeansRes.status, 200);
    const jeansData = await jeansRes.json();
    const jeansTote = jeansData.recommendations.find(r => r.id === 'rec-origami-tote' || r.id === 'rec-crossbody-utility-rig');
    assert.ok(jeansTote);
    assert.ok(jeansTote.materialNotes.includes('trousers') || jeansTote.suitabilityReason.includes('trousers'));

    // Compare with Silk Blouse
    const silkRes = await fetch(`${BASE_URL}/api/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': TEST_USER },
      body: JSON.stringify({
        fabric: {
          name: 'Silk Blouse',
          clothingType: 'Silk Blouse',
          dimensions: { length: 50, width: 40, unit: 'cm' },
          material: 'silk',
          condition: 'like-new'
        }
      })
    });
    assert.strictEqual(silkRes.status, 200);
    const silkData = await silkRes.json();
    // Heavy tote should be marked incompatible or lack tensile rigidity for silk
    const silkTote = silkData.recommendations.find(r => r.id === 'rec-origami-tote');
    assert.ok(silkTote);
    assert.strictEqual(silkTote.materialMatch, false);
  });

  await runTest('2.6 Generate Designs — Produce tailored concepts accepting custom clothing details', async () => {
    const res = await fetch(`${BASE_URL}/api/generate-designs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': TEST_USER },
      body: JSON.stringify({
        fabricType: 'Corduroy Trousers',
        clothingType: 'Corduroy Trousers',
        dimensionsText: 'a 4 × 4 piece',
        dominantColor: 'Terracotta',
        condition: 'frayed',
        texture: 'Ribbed wale',
        notes: 'Ribbed corduroy offcut from hem alteration'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    const concepts = data.concepts || data.designs;
    assert.ok(Array.isArray(concepts));
    assert.ok(concepts.length >= 2);
    // At least one concept should reference the fabric type, color, or condition
    const allTitles = concepts.map(c => `${c.title} ${c.subtitle || ''} ${c.description || ''}`).join(' ');
    assert.ok(/corduroy|terracotta|trousers|ribbed/i.test(allTitles));
  });

  // ---------------------------------------------------------------------------
  // 3. SAVING, SHARING, AND EXPORT TESTS (Feature 3)
  // ---------------------------------------------------------------------------
  let savedProjectId = null;
  let shareToken = null;

  await runTest('3.1 Projects — Save a recommended blueprint persistently', async () => {
    const res = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': TEST_USER },
      body: JSON.stringify({
        blueprintId: 'idea-patchwork-tote',
        title: 'Origami Boro Market Tote',
        category: 'Bags & Carry',
        difficulty: 'Intermediate',
        timeEstimate: '2 Hours',
        fabricId: createdFabricId,
        status: 'planned',
        isFavourite: true,
        steps: [
          { step: 1, title: 'Square remnant', description: 'Press and align' },
          { step: 2, title: 'Cut panels', description: 'Cut panels cleanly' }
        ],
        cuttingPlan: {
          patternPieces: [{ name: 'Main Body', count: 2, width: 38, height: 28, unit: 'cm' }],
          seamAllowance: '1.0 cm'
        }
      })
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.project.id);
    assert.strictEqual(data.project.title, 'Origami Boro Market Tote');
    assert.strictEqual(data.project.isFavourite, true);
    savedProjectId = data.project.id;
  });

  await runTest('3.2 Projects — Retrieve saved project and verify persistent state', async () => {
    const res = await fetch(`${BASE_URL}/api/projects/${savedProjectId}`, {
      headers: { 'x-user-id': TEST_USER }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.project.id, savedProjectId);
    assert.strictEqual(data.project.fabricId, createdFabricId);
    assert.ok(data.project.fabric);
    assert.strictEqual(data.project.fabric.name, 'Deadstock Linen Slub');
  });

  await runTest('3.3 Projects — Export printable PDF blueprint', async () => {
    const res = await fetch(`${BASE_URL}/api/projects/${savedProjectId}/pdf`, {
      headers: { 'x-user-id': TEST_USER }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('content-type'), 'application/pdf');
    const buffer = await res.arrayBuffer();
    assert.ok(buffer.byteLength > 1000, 'PDF should have substantial content');
    // Check PDF header %PDF-
    const header = Buffer.from(buffer.slice(0, 5)).toString();
    assert.strictEqual(header, '%PDF-');
  });

  await runTest('3.4 Projects — Create secure share token and fetch public read-only blueprint', async () => {
    const shareRes = await fetch(`${BASE_URL}/api/projects/${savedProjectId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': TEST_USER }
    });
    assert.strictEqual(shareRes.status, 200);
    const shareData = await shareRes.json();
    assert.ok(shareData.token);
    assert.ok(shareData.shareUrl.includes(shareData.token));
    shareToken = shareData.token;

    // Fetch shared public blueprint WITHOUT auth headers
    const publicRes = await fetch(`${BASE_URL}/api/share/${shareToken}`);
    assert.strictEqual(publicRes.status, 200);
    const pubData = await publicRes.json();
    assert.strictEqual(pubData.project.title, 'Origami Boro Market Tote');
    assert.ok(!pubData.project.userId, 'User ID must NOT be leaked');
    assert.ok(!pubData.project.purchaseCost, 'Private cost must NOT be leaked');
  });

  await runTest('3.5 Projects — Revoke share link and verify subsequent 404', async () => {
    const revokeRes = await fetch(`${BASE_URL}/api/projects/${savedProjectId}/share`, {
      method: 'DELETE',
      headers: { 'x-user-id': TEST_USER }
    });
    assert.strictEqual(revokeRes.status, 200);

    const publicRes = await fetch(`${BASE_URL}/api/share/${shareToken}`);
    assert.strictEqual(publicRes.status, 404);
  });

  // ---------------------------------------------------------------------------
  // 4. MAKER PROGRESS LOG & LEFTOVER REUSE TESTS (Feature 4, 5, 6)
  // ---------------------------------------------------------------------------
  await runTest('4.1 Progress — Toggle instruction steps and verify progress calculation', async () => {
    const stepRes = await fetch(`${BASE_URL}/api/projects/${savedProjectId}/steps/0`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-id': TEST_USER },
      body: JSON.stringify({ completed: true })
    });
    assert.strictEqual(stepRes.status, 200);
    const data = await stepRes.json();
    assert.strictEqual(data.project.steps[0].completed, true);
    assert.strictEqual(data.project.completedStepCount, 1);
    assert.strictEqual(data.project.progressPercent, 50); // 1 of 2 steps
  });

  await runTest('4.2 Progress — Log multiple crafting time sessions', async () => {
    const sess1 = await fetch(`${BASE_URL}/api/projects/${savedProjectId}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': TEST_USER },
      body: JSON.stringify({ durationMinutes: 45, notes: 'Cutting panels and pressing hems' })
    });
    assert.strictEqual(sess1.status, 201);

    const sess2 = await fetch(`${BASE_URL}/api/projects/${savedProjectId}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': TEST_USER },
      body: JSON.stringify({ durationMinutes: 30, notes: 'Joining side seams' })
    });
    assert.strictEqual(sess2.status, 201);

    const projRes = await fetch(`${BASE_URL}/api/projects/${savedProjectId}`, {
      headers: { 'x-user-id': TEST_USER }
    });
    const projData = await projRes.json();
    assert.strictEqual(projData.project.totalTimeSpentMinutes, 75); // 45 + 30
    assert.strictEqual(projData.project.sessionsCount, 2);
  });

  await runTest('4.3 Leftovers — Complete project and record confirmed scrap pieces', async () => {
    const completeRes = await fetch(`${BASE_URL}/api/projects/${savedProjectId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-id': TEST_USER },
      body: JSON.stringify({
        status: 'completed',
        details: {
          consumedQuantity: 1,
          leftovers: {
            confirmed: true,
            length: 25,
            width: 18,
            unit: 'cm',
            pieces: 2,
            notes: 'Two rectangular offcuts from side cuts'
          }
        }
      })
    });
    assert.strictEqual(completeRes.status, 200);
    const data = await completeRes.json();
    assert.strictEqual(data.project.status, 'completed');
    assert.ok(data.project.completedDate);
    assert.ok(data.project.leftoversConfirmed);
    assert.ok(data.project.leftoversConfirmed.stashFabricId);

    // Verify scrap was added to inventory stash
    const scrapFabric = await fetch(`${BASE_URL}/api/fabrics/${data.project.leftoversConfirmed.stashFabricId}`, {
      headers: { 'x-user-id': TEST_USER }
    });
    assert.strictEqual(scrapFabric.status, 200);
    const scrapData = await scrapFabric.json();
    assert.strictEqual(scrapData.fabric.source, 'scrap');
    assert.strictEqual(scrapData.fabric.dimensions.length, 25);
    assert.strictEqual(scrapData.fabric.dimensions.width, 18);
  });

  await runTest('4.4 Dashboard — Fetch verified Maker Stats and sustainability metrics', async () => {
    const statsRes = await fetch(`${BASE_URL}/api/maker-stats`, {
      headers: { 'x-user-id': TEST_USER }
    });
    assert.strictEqual(statsRes.status, 200);
    const data = await statsRes.json();
    assert.strictEqual(data.stats.projects.completed, 1);
    assert.strictEqual(data.stats.time.totalMinutes, 75);
    assert.strictEqual(data.stats.time.totalHours, 1.3);
    assert.ok(data.stats.fabric.scrapsInStash >= 1);
    assert.ok(data.stats.sustainability.confirmedConsumedExplanation.includes('transformed'));
  });

  // ---------------------------------------------------------------------------
  // 5. REGRESSION TESTS
  // ---------------------------------------------------------------------------
  await runTest('5.1 Regression — Health check returns all 2.0 endpoints', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'healthy');
    assert.ok(data.endpoints.fabrics);
    assert.ok(data.endpoints.projects);
    assert.ok(data.endpoints.recommendations);
    assert.ok(data.endpoints.makerStats);
  });

  // ---------------------------------------------------------------------------
  // 6. CONSTRAINT ENFORCEMENT & CONFLICT DETECTION TESTS
  // ---------------------------------------------------------------------------
  await runTest('6.1 Constraint Preservation — User blue fabric strictly preserves blue color across project recommendations', async () => {
    const res = await fetch(`${BASE_URL}/api/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': TEST_USER },
      body: JSON.stringify({
        fabric: {
          name: 'Vintage Indigo Denim',
          dominantColor: 'Indigo Blue',
          material: 'denim',
          userConfirmedColor: true,
          dimensions: { length: 50, width: 40, unit: 'cm' },
          condition: 'good'
        }
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.recommendations.length > 0);

    for (const rec of data.recommendations) {
      const lowerTitle = (rec.title || '').toLowerCase();
      const lowerCustomTitle = (rec.customizedTitle || '').toLowerCase();

      // Ensure no recommendation claims the project is purple, violet, brown, or rust
      assert.ok(!lowerTitle.includes('purple'), `Project title should not claim purple for blue fabric: ${rec.title}`);
      assert.ok(!lowerTitle.includes('violet'), `Project title should not claim violet for blue fabric: ${rec.title}`);
      assert.ok(!lowerTitle.includes('brown'), `Project title should not claim brown for blue fabric: ${rec.title}`);
      assert.ok(!lowerCustomTitle.includes('purple'), `Customized title should not claim purple for blue fabric: ${rec.customizedTitle}`);
      assert.ok(!lowerCustomTitle.includes('brown'), `Customized title should not claim brown for blue fabric: ${rec.customizedTitle}`);

      // Ensure that if the image does not match blue denim, it is marked as a generic reference
      if (rec.imageUrl && (rec.imageUrl.includes('jute') || rec.imageUrl.includes('yellow') || rec.imageUrl.includes('purple'))) {
        assert.strictEqual(rec.isGenericReference, true, `Non-matching image ${rec.imageUrl} must be flagged as isGenericReference`);
        assert.ok(rec.imageLabel.includes('Generic'), `Non-matching image must be labeled generic reference`);
      }
    }
  });

  await runTest('6.2 Photo Override Prevention — User confirmed color is preserved against photo analysis in pipeline', async () => {
    const res = await fetch(`${BASE_URL}/api/generate-designs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fabricType: 'denim',
        dominantColor: 'Electric Blue',
        userConfirmedColor: true,
        userConfirmedMaterial: true,
        quantity: '0.6 meters (50x40cm)'
      })
    });
    const data = await res.json();
    if (data.success && data.designs && data.designs.length > 0) {
      assert.strictEqual(data.fabric.dominantColor, 'Electric Blue');
      assert.strictEqual(data.fabric.userConfirmedColor, true);
      // All generated concept titles or descriptions must not be purple or brown
      for (const d of data.designs) {
        const text = `${d.title} ${d.design_description || ''}`.toLowerCase();
        assert.ok(!text.includes('purple silk') && !text.includes('brown jute'), 'Must not substitute purple or brown for electric blue');
      }
    } else if (data.noReliableMatch) {
      assert.ok(data.conflict || data.error);
    }
  });

  await runTest('6.3 Conflict Detection — validateConceptsConstraints identifies contradictory color output', async () => {
    const fabricDetails = { dominantColor: 'Indigo Blue', fabricType: 'denim' };
    
    // Contradictory concept proposing purple silk
    const conflictingConcepts = [
      {
        id: 'c-1',
        title: 'Deep Purple Silk Evening Clutch',
        description: 'Made from rich purple silk fabric with metallic accents.'
      }
    ];

    const result = validateConceptsConstraints(conflictingConcepts, fabricDetails);
    assert.strictEqual(result.isValid, false);
    assert.ok(result.conflict);
    assert.strictEqual(result.conflict.violatingTerm, 'purple');
    assert.strictEqual(result.conflict.expectedColor, 'Indigo Blue');

    // Matching concept proposing indigo denim
    const matchingConcepts = [
      {
        id: 'c-2',
        title: 'Indigo Denim Chore Vest',
        description: 'Tailored from durable indigo denim with double-needle topstitching.'
      }
    ];

    const validResult = validateConceptsConstraints(matchingConcepts, fabricDetails);
    assert.strictEqual(validResult.isValid, true);
  });

  await runTest('6.4 Image Association — Correctly distinguishes matched visual assets from generic references', async () => {
    const blueFabric = { dominantColor: 'Cobalt Blue', material: 'denim' };

    // Denim jacket is matched for denim fabric
    assert.strictEqual(isImageAssociatedWithFabric('/blueprints/denim-chore-jacket.jpg', blueFabric), true);

    // Purple silk scarf is conflicting for blue fabric
    assert.strictEqual(isImageAssociatedWithFabric('/blueprints/purple-silk-origami-scarf.jpg', blueFabric), false);

    // Terracotta corduroy is conflicting for blue fabric
    assert.strictEqual(isImageAssociatedWithFabric('/blueprints/terracotta-corduroy-tote.jpg', blueFabric), false);

    // Jute patchwork tote is conflicting for blue fabric
    assert.strictEqual(isImageAssociatedWithFabric('/blueprints/jute-patchwork-tote.jpg', blueFabric), false);
  });

  // ---------------------------------------------------------------------------
  // 7. IMAGE GENERATION / EDITING & ASSET INTEGRITY TESTS
  // ---------------------------------------------------------------------------
  await runTest('7.1 Image Editing API — POST /api/generate-project-preview rejects requests missing fabricImage', async () => {
    const res = await fetch(`${BASE_URL}/api/generate-project-preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectTitle: 'Zero-Waste Tote',
        fabricColor: 'Denim Blue',
        fabricMaterial: 'denim'
      })
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.error.includes('fabricImage is required'));
  });

  await runTest('7.2 Image Editing API — POST /api/generate-project-preview succeeds with conditioning in test mode', async () => {
    const res = await fetch(`${BASE_URL}/api/generate-project-preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fabricImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWPjfDwAEeQHzE1LqZgAAAABJRU5ErkJggg==',
        fabricColor: 'Midnight Navy',
        fabricMaterial: 'denim',
        fabricDimensions: '60x40 cm',
        projectTitle: 'Zero-Waste Utility Apron',
        projectDescription: 'Constructed from heavy midnight navy denim scrap with contrast stitching.',
        category: 'Accessories',
        testMode: true
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.isPhotoConditioned, true);
    assert.ok(data.imageUrl.startsWith('data:image/svg+xml;utf8,'));
    assert.ok(data.promptConstraints.dominantColor.includes('Midnight Navy'));
    assert.ok(data.promptConstraints.material.includes('denim'));
    assert.strictEqual(data.disclaimer, 'AI-generated concept visualization conditioned on uploaded fabric photo. Not a finished photograph of a real garment.');
  });

  await runTest('7.3 Image Editing Transparency — Reports setup required when API keys not provided (no silent generic model)', async () => {
    // When testMode is false and no API key is present, it returns requiresSetup: true rather than falling back to generic models
    const res = await fetch(`${BASE_URL}/api/generate-project-preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fabricImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWPjfDwAEeQHzE1LqZgAAAABJRU5ErkJggg==',
        fabricColor: 'Cobalt Blue',
        fabricMaterial: 'linen',
        projectTitle: 'Linen Crossbody Pouch',
        category: 'Accessories',
        testMode: false
      })
    });
    const data = await res.json();
    if (!process.env.STABILITY_API_KEY && !process.env.BFL_API_KEY) {
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.requiresSetup, true);
      assert.ok(data.message.includes('STABILITY_API_KEY') || data.message.includes('BFL_API_KEY'));
      assert.ok(!data.imageUrl, 'Must not return an unconditioned generic image when keys are missing');
    }
  });

  await runTest('7.4 Asset Audit — Verifies no silver dress or AI model images exist in blueprint catalogue or recommendations', async () => {
    const res = await fetch(`${BASE_URL}/api/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': TEST_USER },
      body: JSON.stringify({
        fabric: {
          name: 'Sage French Lace Remnant',
          dominantColor: 'Sage Green',
          material: 'lace',
          userConfirmedColor: true,
          dimensions: { length: 50, width: 40, unit: 'cm' },
          condition: 'good'
        }
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    for (const rec of data.recommendations) {
      const url = rec.imageUrl || '';
      assert.ok(!url.includes('sage-lace-french-evening-dress'), `Must not reference silver dress: ${url}`);
      assert.ok(!url.includes('sage-lace-overlay-top'), `Must not reference AI girl lace overlay top: ${url}`);
      assert.ok(!url.includes('test-yellow-cotton-gilet'), `Must not reference AI test doll: ${url}`);
      assert.ok(!url.includes('pollinations.ai'), `Must not reference unconditioned pollinations lookbook: ${url}`);
    }
  });

} finally {
  server.close();
}

console.log('\n================================================================');
console.log(`🏁 Test Summary: ${passedTests}/${totalTests} tests passed`);
console.log('================================================================');

if (passedTests !== totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}


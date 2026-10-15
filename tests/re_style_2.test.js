import assert from 'assert';
import 'dotenv/config';
import http from 'http';
import app from '../server.js';
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

} finally {
  server.close();
}

console.log('\n================================================================');
console.log(`🏁 Test Summary: ${passedTests}/${totalTests} tests passed`);
console.log('================================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}

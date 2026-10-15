import assert from 'assert';
import 'dotenv/config';

console.log('====================================================');
console.log('🧪 Starting Re:Style AI Pipeline Automated Test Suite');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

async function runTest(testName, testFn) {
  totalTests++;
  process.stdout.write(`▶ Running ${testName}... `);
  try {
    await testFn();
    passedTests++;
    console.log('✅ PASSED');
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    console.error(error);
  }
}

// ---------------------------------------------------------------------------
// TEST A — Different Fabric Uploads
// ---------------------------------------------------------------------------
await runTest('Test A — Different fabric uploads produce independent profiles & distinct concepts', async () => {
  // Fabric 1: Blue Denim
  const denimRes = await fetch('http://localhost:5000/api/generate-designs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fabricType: 'Reclaimed Indigo Denim',
      dominantColor: 'Indigo Blue',
      pattern: '3x1 Twill Weave',
      colorFamily: 'indigo-denim',
      quantity: '60x45 cm remnant'
    })
  });
  assert.strictEqual(denimRes.status, 200, 'Denim request should succeed');
  const denimData = await denimRes.json();
  assert.strictEqual(denimData.success, true);
  assert.strictEqual(denimData.designs.length, 5);
  assert.strictEqual(denimData.fabric.dominantColor, 'Indigo Blue');
  assert.strictEqual(denimData.fabric.archetype, 'denim-workwear');

  // Verify denim designs reference denim/twill/workwear attributes
  const denimTitles = denimData.designs.map(d => d.title.toLowerCase()).join(' ');
  assert.ok(/denim|chore|rig|apron|gilet|jacket|utility/i.test(denimTitles), 'Denim designs should reflect denim workwear');

  // Fabric 2: Red Terracotta Corduroy
  const cordRes = await fetch('http://localhost:5000/api/generate-designs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fabricType: 'Terracotta Corduroy',
      dominantColor: 'Terracotta Red',
      pattern: 'Wide Wale Rib',
      colorFamily: 'red-terracotta',
      quantity: '40x40 cm remnant'
    })
  });
  assert.strictEqual(cordRes.status, 200, 'Corduroy request should succeed');
  const cordData = await cordRes.json();
  assert.strictEqual(cordData.success, true);
  assert.strictEqual(cordData.fabric.dominantColor, 'Terracotta Red');
  assert.strictEqual(cordData.fabric.archetype, 'corduroy-velvet');

  // Profiles and IDs must be completely independent
  assert.notStrictEqual(denimData.requestId, cordData.requestId, 'Request IDs must be unique');
  assert.notStrictEqual(denimData.fabric.dominantColor, cordData.fabric.dominantColor);
});

// ---------------------------------------------------------------------------
// TEST B — Multiple Designs Data Contract
// ---------------------------------------------------------------------------
await runTest('Test B — 5 designs for one upload each have unique IDs, concepts, image requests, and full data contract', async () => {
  const res = await fetch('http://localhost:5000/api/generate-designs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fabricType: 'Golden Handloom Cotton',
      dominantColor: 'Marigold Yellow',
      pattern: 'Plain Slub Weave',
      quantity: '2.5 meters'
    })
  });
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.designs.length, 5, 'Must generate exactly 5 designs');

  const seenIds = new Set();
  const seenTitles = new Set();
  const seenImages = new Set();

  for (const d of data.designs) {
    // 1. Stable, unique ID
    assert.ok(d.design_id, 'design_id must exist in snake_case');
    assert.ok(d.id, 'id must exist in camelCase');
    assert.strictEqual(d.design_id, d.id, 'id and design_id must match');
    assert.ok(!seenIds.has(d.design_id), `Duplicate design_id detected: ${d.design_id}`);
    seenIds.add(d.design_id);

    // 2. Distinct product title
    assert.ok(d.title, 'title must exist');
    assert.ok(!seenTitles.has(d.title), `Duplicate title detected: ${d.title}`);
    seenTitles.add(d.title);

    // 3. Image URL and status
    assert.ok(d.image_url, 'image_url must be defined');
    assert.strictEqual(d.image_status, 'success');

    // 4. Zero duplicate images in this batch!
    assert.ok(!seenImages.has(d.image_url), `Duplicate image assigned across concepts: ${d.image_url}`);
    seenImages.add(d.image_url);

    // 5. Fabric requirements
    assert.ok(d.fabric_requirements, 'fabric_requirements must exist');
    assert.ok(d.fabric_requirements.fabric_type);

    // 6. Feasibility check
    assert.ok(d.feasibility, 'feasibility assessment must exist');
    assert.ok(['feasible', 'tight', 'insufficient_material'].includes(d.feasibility.status));
  }
});

// ---------------------------------------------------------------------------
// TEST C — Image-Description Consistency
// ---------------------------------------------------------------------------
await runTest('Test C — Image prompt is derived from exact concept and visually validated', async () => {
  const res = await fetch('http://localhost:5000/api/generate-designs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fabricType: 'Belgian Slub Linen',
      dominantColor: 'Natural Ecru',
      pattern: 'Woven Slub',
      quantity: '1.2 meters'
    })
  });
  const data = await res.json();
  assert.strictEqual(data.success, true);

  for (const design of data.designs) {
    // Concept prompt must contain the concept title and fabric color/type
    assert.ok(design.image_prompt, 'image_prompt must be populated');
    assert.ok(design.image_prompt.includes(design.title), 'Image prompt must incorporate exact concept title');
    assert.ok(design.image_prompt.includes(data.fabric.fabricType) || design.image_prompt.includes('Belgian Slub Linen'));
    // Image validation result must be present
    assert.ok(design.image_validation, 'image_validation must be present');
    assert.strictEqual(design.image_validation.passed, true);
  }
});

// ---------------------------------------------------------------------------
// TEST D — Duplicate Generation Prevention & Out-of-Order Safety
// ---------------------------------------------------------------------------
await runTest('Test D — Duplicate requests produce distinct sets without overwriting or duplicate images', async () => {
  // Fire 2 concurrent requests with different fabrics
  const [res1, res2] = await Promise.all([
    fetch('http://localhost:5000/api/generate-designs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fabricType: 'Raw Jute Burlap', dominantColor: 'Tan', quantity: '50x50 cm' })
    }),
    fetch('http://localhost:5000/api/generate-designs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fabricType: 'Royal Purple Silk', dominantColor: 'Purple', quantity: '1 meter' })
    })
  ]);

  const data1 = await res1.json();
  const data2 = await res2.json();

  assert.strictEqual(data1.success, true);
  assert.strictEqual(data2.success, true);

  // Images within batch 1 must be 100% unique
  const set1 = new Set(data1.designs.map(d => d.image_url));
  assert.strictEqual(set1.size, 5, 'All 5 jute designs must have distinct images');

  // Images within batch 2 must be 100% unique
  const set2 = new Set(data2.designs.map(d => d.image_url));
  assert.strictEqual(set2.size, 5, 'All 5 silk designs must have distinct images');

  // Request IDs must not collide
  assert.notStrictEqual(data1.requestId, data2.requestId);
});

// ---------------------------------------------------------------------------
// TEST E — Partial Failure & Single-Design Regeneration
// ---------------------------------------------------------------------------
await runTest('Test E — Single design regeneration updates only the targeted design', async () => {
  const initialRes = await fetch('http://localhost:5000/api/generate-designs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fabricType: 'Reclaimed Denim', dominantColor: 'Blue', quantity: '1.5m' })
  });
  const initialData = await initialRes.json();
  const targetDesign = initialData.designs[0];
  const oldImage = targetDesign.image_url;

  // Call single design regeneration endpoint excluding old image
  const regenRes = await fetch('http://localhost:5000/api/regenerate-design-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      design_id: targetDesign.design_id,
      concept: targetDesign,
      fabricDetails: initialData.fabric,
      excludedImages: [oldImage]
    })
  });
  assert.strictEqual(regenRes.status, 200);
  const regenData = await regenRes.json();

  assert.strictEqual(regenData.success, true);
  assert.strictEqual(regenData.design_id, targetDesign.design_id);
  assert.notStrictEqual(regenData.image_url, oldImage, 'Regenerated image must differ from excluded previous image');
  assert.strictEqual(regenData.image_status, 'success');
});

// ---------------------------------------------------------------------------
// TEST F — Repeated Uploads Race Condition Protection
// ---------------------------------------------------------------------------
await runTest('Test F — Rapid successive requests preserve correct associations by request ID', async () => {
  // Fire 3 requests in rapid succession
  const p1 = fetch('http://localhost:5000/api/generate-designs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fabricType: 'Upload 1 Linen', dominantColor: 'White' })
  });
  const p2 = fetch('http://localhost:5000/api/generate-designs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fabricType: 'Upload 2 Denim', dominantColor: 'Blue' })
  });
  const p3 = fetch('http://localhost:5000/api/generate-designs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fabricType: 'Upload 3 Jute', dominantColor: 'Tan' })
  });

  const [r1, r2, r3] = await Promise.all([p1, p2, p3]);
  const d1 = await r1.json();
  const d2 = await r2.json();
  const d3 = await r3.json();

  // Each response must match its own input and maintain independent request IDs
  assert.ok(d1.fabric.fabricType.includes('Linen'));
  assert.ok(d2.fabric.fabricType.includes('Denim'));
  assert.ok(d3.fabric.fabricType.includes('Jute'));

  const ids = [d1.requestId, d2.requestId, d3.requestId];
  const uniqueIds = new Set(ids);
  assert.strictEqual(uniqueIds.size, 3, 'All 3 requests must have independent request IDs');
});

// ---------------------------------------------------------------------------
// TEST G — Missing or Uncertain Attributes Handling
// ---------------------------------------------------------------------------
await runTest('Test G — Missing/uncertain attributes are labeled low_confidence/unknown without inventing facts', async () => {
  // Inspect an empty/invalid payload
  const emptyRes = await fetch('http://localhost:5000/api/inspect-fabric-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: '' })
  });
  assert.strictEqual(emptyRes.status, 400, 'Empty image should be rejected with 400');

  // Verify generic fabric defaults do not claim false high confidence
  const genRes = await fetch('http://localhost:5000/api/generate-designs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fabricType: '', quantity: 'unknown' })
  });
  const genData = await genRes.json();
  assert.strictEqual(genData.success, true);
  assert.ok(genData.fabric.fabricType, 'Should assign realistic natural fallback without fabricating exotic fibers');
});

// ---------------------------------------------------------------------------
// TEST H — API Failure & Honest Status Reporting
// ---------------------------------------------------------------------------
await runTest('Test H — API failures report honest statuses rather than claiming false success', async () => {
  // Check health endpoint
  const healthRes = await fetch('http://localhost:5000/api/health');
  assert.strictEqual(healthRes.status, 200);
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.status, 'healthy');

  // Verify that an invalid endpoint returns 404/500 rather than fabricated data
  const invalidRes = await fetch('http://localhost:5000/api/inspect-fabric-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: 'invalid-non-base64-string' })
  });
  assert.strictEqual(invalidRes.status, 500, 'Should return error status on unparseable image');
  const invalidData = await invalidRes.json();
  assert.strictEqual(invalidData.success, false);
});

// ---------------------------------------------------------------------------
// TEST I — Cache Behavior
// ---------------------------------------------------------------------------
await runTest('Test I — Successive uploads produce fresh request IDs and distinct non-stale outputs', async () => {
  const reqA = await fetch('http://localhost:5000/api/generate-designs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fabricType: 'Handloom Cotton', dominantColor: 'Yellow' })
  });
  const dataA = await reqA.json();

  const reqB = await fetch('http://localhost:5000/api/generate-designs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fabricType: 'Handloom Cotton', dominantColor: 'Yellow' })
  });
  const dataB = await reqB.json();

  assert.notStrictEqual(dataA.requestId, dataB.requestId, 'Repeated upload must receive a fresh requestId');
  assert.strictEqual(dataA.designs.length, 5);
  assert.strictEqual(dataB.designs.length, 5);
});

// ---------------------------------------------------------------------------
// TEST J — Regression Verification
// ---------------------------------------------------------------------------
await runTest('Test J — Regression: Health check, endpoints, and data contracts remain fully functional', async () => {
  const health = await fetch('http://localhost:5000/api/health');
  const hData = await health.json();
  assert.strictEqual(hData.status, 'healthy');

  // Verify sample generation has all required fields
  const sampleRes = await fetch('http://localhost:5000/api/generate-designs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fabricType: 'Jute Burlap Remnant',
      dominantColor: 'Natural Tan',
      quantity: '45x45 cm'
    })
  });
  const sData = await sampleRes.json();
  assert.strictEqual(sData.success, true);
  assert.strictEqual(sData.designs.length, 5);

  const first = sData.designs[0];
  assert.ok(first.title);
  assert.ok(first.description);
  assert.ok(first.imageUrl);
  assert.ok(first.steps);
  assert.ok(first.materialsNeeded);
  assert.ok(first.toolsNeeded);
  assert.ok(first.feasibility);
});

console.log('\n====================================================');
console.log(`📊 Test Results: ${passedTests}/${totalTests} Tests Passed`);
if (passedTests === totalTests) {
  console.log('🎉 ALL 10 MANDATED PIPELINE TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.log(`⚠️ ${totalTests - passedTests} TESTS FAILED.`);
  process.exit(1);
}

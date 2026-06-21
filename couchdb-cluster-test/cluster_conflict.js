const COUCHDB_URL = "http://localhost:5984/my_test_db";
const authHeader = "Basic " + btoa("admin:password");

// Generate a random document ID so we can run this script multiple times safely
const DOC_ID = "test_doc_" + Date.now();

async function createConflict() {
  console.log(`\n--- PHASE 1: INJECTING CONFLICT ---`);
  console.log(
    `[1] Forcing two conflicting versions into document: ${DOC_ID}...`,
  );

  const payload = {
    new_edits: false, // This tells CouchDB to accept our custom, conflicting revision histories
    docs: [
      {
        _id: DOC_ID,
        _revisions: { start: 2, ids: ["aaaaaa", "111111"] },
        text: "The dragon is Green",
        updatedBy: "cloud_server",
      },
      {
        _id: DOC_ID,
        _revisions: { start: 2, ids: ["bbbbbb", "111111"] },
        text: "The dragon is Blue",
        updatedBy: "mobile_device",
      },
    ],
  };

  const res = await fetch(`${COUCHDB_URL}/_bulk_docs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    console.log(`[2] Conflict successfully injected into CouchDB!`);
  } else {
    throw new Error("Failed to inject conflict");
  }
}

async function resolveConflict() {
  console.log(`\n--- PHASE 2: RESOLVING CONFLICT ---`);

  // 1. Fetch document and conflicts
  console.log(`[3] Fetching document ${DOC_ID} to detect active conflicts...`);
  const res = await fetch(`${COUCHDB_URL}/${DOC_ID}?conflicts=true`, {
    headers: { Authorization: authHeader },
  });
  const winner = await res.json();

  if (!winner._conflicts || winner._conflicts.length === 0) {
    console.log("No conflicts found. Something went wrong in Phase 1.");
    return;
  }

  const losingRevs = winner._conflicts;
  console.log(`[4] CouchDB detected a conflict!`);
  console.log(`    Winner: ${winner._rev} (${winner.text})`);
  console.log(`    Losers: ${losingRevs.join(", ")}`);

  // 2. Fetch the losing payload
  const losingDocs = [];
  for (const rev of losingRevs) {
    const lostRes = await fetch(`${COUCHDB_URL}/${DOC_ID}?rev=${rev}`, {
      headers: { Authorization: authHeader },
    });
    losingDocs.push(await lostRes.json());
  }

  // 3. Merge the texts
  console.log("[5] Executing custom merge logic...");
  const mergedText = `${winner.text} + merged with + ${losingDocs.map((d) => d.text).join(", ")}`;

  const mergedDoc = {
    ...winner,
    text: mergedText,
    updatedBy: "auto_resolver",
    resolvedAt: new Date().toISOString(),
  };

  // 4. Save the merged version
  console.log("[6] Saving merged document to the winning branch...");
  const saveRes = await fetch(`${COUCHDB_URL}/${DOC_ID}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: authHeader },
    body: JSON.stringify(mergedDoc),
  });
  const saveResult = await saveRes.json();
  console.log(`    New winning revision created: ${saveResult.rev}`);

  // 5. Prune the losing branch
  console.log(
    "[7] Pruning the losing conflict branch to clean the database...",
  );
  for (const rev of losingRevs) {
    const deleteRes = await fetch(`${COUCHDB_URL}/${DOC_ID}?rev=${rev}`, {
      method: "DELETE",
      headers: { Authorization: authHeader },
    });
    const deleteResult = await deleteRes.json();
    console.log(
      `    Deleted revision ${rev}: ${deleteResult.ok ? "SUCCESS" : "FAILED"}`,
    );
  }

  // 6. Verify success
  const verifyRes = await fetch(`${COUCHDB_URL}/${DOC_ID}?conflicts=true`, {
    headers: { Authorization: authHeader },
  });
  const finalDoc = await verifyRes.json();
  console.log(`\n--- PHASE 3: VERIFICATION ---`);
  console.log(
    "[8] Did we fix it? ->",
    finalDoc._conflicts
      ? "NO, STILL CONFLICTED ❌"
      : "YES, RESOLVED SUCCESSFULLY ✅",
  );
  console.log("Final Database State:", JSON.stringify(finalDoc, null, 2));
}

// Run the orchestrator
async function runDemo() {
  try {
    await createConflict();
    await resolveConflict();
  } catch (err) {
    console.error("Demo failed:", err.message);
  }
}

runDemo();

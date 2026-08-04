const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          process.env[key.trim()] = val;
        }
      });
      console.log("ℹ️ Loaded environment configuration from .env");
    }
  } catch (err) {
    console.warn("⚠️ Warning: Could not load .env:", err.message);
  }
}
loadEnv();

const shopName = process.env.SHOPIFY_SHOP_NAME;
const clientId = process.env.SHOPIFY_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

async function rollback() {
  const backupArg = process.argv[2];
  if (!backupArg) {
    console.error("❌ Usage: node scripts/rollback_products.js <path-to-backup-json>");
    console.error("Example: node scripts/rollback_products.js product_backups/backup_2026-08-04_14-53-46.json");
    process.exit(1);
  }

  const backupFilePath = path.resolve(process.cwd(), backupArg);
  if (!fs.existsSync(backupFilePath)) {
    console.error(`❌ Error: Backup file not found at ${backupFilePath}`);
    process.exit(1);
  }

  const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
  const backupEntries = Object.values(backupData).filter(item => item.status === "SUCCESS" || item.originalTitle);

  if (backupEntries.length === 0) {
    console.log("ℹ️ No modified products found in this backup file to roll back.");
    return;
  }

  console.log(`⏪ Starting rollback for ${backupEntries.length} products using snapshot: ${path.basename(backupFilePath)}...\n`);

  if (!shopName || !clientId || !clientSecret) {
    console.error("❌ Error: Missing SHOPIFY_SHOP_NAME, SHOPIFY_CLIENT_ID, or SHOPIFY_CLIENT_SECRET in .env.");
    return;
  }

  // 1. Authenticate with Shopify
  const tokenResponse = await fetch(`https://${shopName}.myshopify.com/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials"
    })
  });

  if (!tokenResponse.ok) {
    throw new Error(`Authentication failed: ${tokenResponse.status}`);
  }

  const { access_token: accessToken } = await tokenResponse.json();
  console.log("✅ Authenticated with Shopify.\n");

  async function queryGraphQL(query, variables = {}) {
    const res = await fetch(`https://${shopName}.myshopify.com/admin/api/2026-01/graphql.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query, variables })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GraphQL Error: ${res.statusText} - ${text}`);
    }
    return await res.json();
  }

  const updateMutation = `
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  for (let i = 0; i < backupEntries.length; i++) {
    const entry = backupEntries[i];
    console.log(`🔄 [${i + 1}/${backupEntries.length}] Restoring product "${entry.originalTitle}" (${entry.id})...`);

    const input = {
      id: entry.id,
      title: entry.originalTitle,
      descriptionHtml: entry.originalDescriptionHtml,
      tags: entry.originalTags || []
    };

    if (entry.originalCategory) {
      input.category = entry.originalCategory;
    }

    try {
      const result = await queryGraphQL(updateMutation, { input });
      const errors = result.data?.productUpdate?.userErrors || [];

      if (errors.length > 0) {
        console.log(`   ❌ Failed to restore: ${errors.map(e => e.message).join(", ")}`);
      } else {
        console.log(`   ✅ Restored original state successfully!`);
      }
    } catch (err) {
      console.log(`   ❌ Exception restoring product: ${err.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    console.log("-".repeat(50));
  }

  console.log("\n🎉 Rollback completed successfully!");
}

rollback().catch(err => {
  console.error("❌ Rollback script failed:", err);
});

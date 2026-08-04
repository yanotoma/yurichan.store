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

// Backup Directory & Timestamped File Location
const BACKUP_DIR = path.resolve(__dirname, '../product_backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const timestampStr = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
const BACKUP_FILE = path.join(BACKUP_DIR, `backup_${timestampStr}.json`);

// Save backup state to disk
function saveBackup(backups) {
  try {
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(backups, null, 2), 'utf8');
    console.log(`💾 Backup status saved to ${BACKUP_FILE}`);
  } catch (err) {
    console.error("❌ Failed to write backup file:", err.message);
  }
}

// Shopify Standard Taxonomy IDs
const CATEGORY_MAPPING = {
  "Pet Apparel": "gid://shopify/TaxonomyCategory/ap-2-6",
  "Pet Beds": "gid://shopify/TaxonomyCategory/ap-2-9",
  "Cat Toys": "gid://shopify/TaxonomyCategory/ap-2-2-5",
  "Dog Toys": "gid://shopify/TaxonomyCategory/ap-2-3-7",
  "Pet Collars & Harnesses": "gid://shopify/TaxonomyCategory/ap-2-17",
  "Pet Bowls, Feeders & Waterers": "gid://shopify/TaxonomyCategory/ap-2-14",
  "Pet Carriers & Crates": "gid://shopify/TaxonomyCategory/ap-2-16",
  "Pet Accessories": "gid://shopify/TaxonomyCategory/ap-2"
};

function getCategoryInfo(title) {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes("bed") || lowerTitle.includes("house") || lowerTitle.includes("villa") || lowerTitle.includes("cooling pad") || lowerTitle.includes("mat")) {
    return { name: "Pet Beds", id: CATEGORY_MAPPING["Pet Beds"] };
  }
  if (lowerTitle.includes("toy") || lowerTitle.includes("ball") || lowerTitle.includes("shrimp") || lowerTitle.includes("carrot") || lowerTitle.includes("plaything") || lowerTitle.includes("teaser")) {
    if (lowerTitle.includes("cat")) {
      return { name: "Cat Toys", id: CATEGORY_MAPPING["Cat Toys"] };
    }
    return { name: "Dog Toys", id: CATEGORY_MAPPING["Dog Toys"] };
  }
  if (lowerTitle.includes("leash") || lowerTitle.includes("harness") || lowerTitle.includes("collar")) {
    return { name: "Pet Collars & Harnesses", id: CATEGORY_MAPPING["Pet Collars & Harnesses"] };
  }
  if (lowerTitle.includes("bowl") || lowerTitle.includes("feeder") || lowerTitle.includes("bottle") || lowerTitle.includes("water cup") || lowerTitle.includes("dispenser") || lowerTitle.includes("drinking")) {
    return { name: "Pet Bowls, Feeders & Waterers", id: CATEGORY_MAPPING["Pet Bowls, Feeders & Waterers"] };
  }
  if (lowerTitle.includes("jacket") || lowerTitle.includes("vest") || lowerTitle.includes("costume") || lowerTitle.includes("sweater") || lowerTitle.includes("hoodie") || lowerTitle.includes("hat") || lowerTitle.includes("cape") || lowerTitle.includes("clothes") || lowerTitle.includes("clothing") || lowerTitle.includes("shirt") || lowerTitle.includes("outfit") || lowerTitle.includes("dress")) {
    return { name: "Pet Apparel", id: CATEGORY_MAPPING["Pet Apparel"] };
  }
  if (lowerTitle.includes("bag") || lowerTitle.includes("carrier") || lowerTitle.includes("backpack") || lowerTitle.includes("crate")) {
    return { name: "Pet Carriers & Crates", id: CATEGORY_MAPPING["Pet Carriers & Crates"] };
  }
  
  return { name: "Pet Accessories", id: CATEGORY_MAPPING["Pet Accessories"] };
}

function enhanceDescription(html, title) {
  // Strip existing highlights block if present so we can move it to the top cleanly
  const cleanHtml = (html || "").replace(/<div class="product-highlights[\s\S]*?<\/div>/gi, '').trim();

  const isHalloween = title.toLowerCase().includes("halloween") || title.toLowerCase().includes("spooky") || title.toLowerCase().includes("ghost") || title.toLowerCase().includes("witch") || title.toLowerCase().includes("pumpkin");
  
  let highlights = "";
  if (isHalloween) {
    highlights = `<div class="product-highlights mb-6 p-4 border-2 border-[#ff7a00] bg-[#1d0e2e] text-white rounded-xl shadow-[4px_4px_0px_#ff7a00]">
  <h4 class="font-fredoka font-bold text-lg text-white mb-2">🎃 Spooky Highlights:</h4>
  <ul class="list-disc pl-5 space-y-1 text-sm font-quicksand">
    <li>✨ Ultra-soft, lightweight materials suitable for all-day wear.</li>
    <li>🎨 Spooky design with high-contrast festive details.</li>
    <li>💖 Tailored fit to ensure your pet stays cozy and happy.</li>
  </ul>
</div>`;
  } else {
    let typeIcon = "🐾";
    let listItems = [
      "✨ Crafted from safe, pet-friendly premium materials.",
      "🎨 Cute and stylish aesthetic inspired by love for pets.",
      "👌 Comfortable fit and easy to use daily."
    ];
    
    if (title.toLowerCase().includes("bed") || title.toLowerCase().includes("house") || title.toLowerCase().includes("mat")) {
      typeIcon = "💤";
      listItems = [
        "☁️ Cloud-like padding that supports joints and muscles.",
        "🧼 Durable, easy-to-clean fabric for stress-free maintenance.",
        "🎨 Minimalist kawaii design that matches any stylish room."
      ];
    } else if (title.toLowerCase().includes("toy") || title.toLowerCase().includes("ball") || title.toLowerCase().includes("teaser")) {
      typeIcon = "🎉";
      listItems = [
        "💪 Highly durable, pet-safe materials designed to last.",
        "🌟 Stimulates healthy exercise and mental agility.",
        "💖 Fun, colorful designs that pets absolutely love!"
      ];
    } else if (title.toLowerCase().includes("bowl") || title.toLowerCase().includes("feeder") || title.toLowerCase().includes("dispenser")) {
      typeIcon = "🍽️";
      listItems = [
        "📐 Ergonomic elevation to support healthy digestion.",
        "🛡️ Non-slip base to prevent spills and protect floors.",
        "🧼 Easy to wash and maintain."
      ];
    }
    
    highlights = `<div class="product-highlights mb-6 p-4 border-2 border-yuri-dark bg-yuri-bg text-yuri-dark rounded-xl shadow-[4px_4px_0px_#2b2b2b]">
  <h4 class="font-fredoka font-bold text-lg mb-2">${typeIcon} Yurichan Highlights:</h4>
  <ul class="list-disc pl-5 space-y-1 text-sm font-quicksand">
    ${listItems.map(item => `<li>${item}</li>`).join('\n    ')}
  </ul>
</div>`;
  }

  // Prepend highlights at the top!
  return cleanHtml ? `${highlights}\n${cleanHtml}` : highlights;
}



async function run() {
  if (!shopName || !clientId || !clientSecret) {
    console.error("❌ Error: Missing SHOPIFY_SHOP_NAME, SHOPIFY_CLIENT_ID, or SHOPIFY_CLIENT_SECRET in .env file.");
    return;
  }

  console.log(`🐾 Connecting to Shopify store: ${shopName}...`);
  
  try {
    // 1. Get Access Token
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
    console.log("✅ Authenticated successfully.\n");

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

    // 2. Fetch all products (limit to 50 for safety)
    console.log("📦 Fetching products from catalog...");
    const productsQuery = `
      query {
        products(first: 50) {
          edges {
            node {
              id
              title
              descriptionHtml
              tags
              productCategory {
                productTaxonomyNode {
                  id
                  fullName
                }
              }
            }
          }
        }
      }
    `;
    const productsResult = await queryGraphQL(productsQuery);
    const products = productsResult.data?.products?.edges || [];
    
    // Filter for products that need description enhancement or corrected category mapping
    const productsToProcess = products.filter(edge => {
      const p = edge.node;
      const enhancedDesc = enhanceDescription(p.descriptionHtml, p.title);
      const targetCat = getCategoryInfo(p.title);
      const currentCatId = p.productCategory?.productTaxonomyNode?.id;
      return currentCatId !== targetCat.id || enhancedDesc !== p.descriptionHtml;
    });

    console.log(`📋 Found ${productsToProcess.length} products to enhance (out of ${products.length} total).\n`);

    if (productsToProcess.length === 0) {
      console.log("🎉 All products are already up to date and enhanced!");
      return;
    }

    const backups = {};

    // 3. Process products
    for (let i = 0; i < productsToProcess.length; i++) {
      const product = productsToProcess[i].node;
      const id = product.id;
      const title = product.title;
      const desc = product.descriptionHtml || "";
      const tags = product.tags ? product.tags : [];
      const categoryId = product.productCategory?.productTaxonomyNode?.id || null;
      
      const targetCategory = getCategoryInfo(title);
      
      // Capitalize title nicely
      let formattedTitle = title.trim();
      if (formattedTitle === formattedTitle.toLowerCase() || formattedTitle === formattedTitle.toUpperCase()) {
        formattedTitle = formattedTitle.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }

      // Preserve images and layout, only append highlights
      const enhancedDesc = enhanceDescription(desc, formattedTitle);

      // Handle tags additions
      let updatedTagsList = [...tags];
      const isHalloween = title.toLowerCase().includes("halloween") || desc.toLowerCase().includes("halloween") || tags.join(", ").toLowerCase().includes("halloween");
      if (isHalloween && !updatedTagsList.includes("Halloween")) {
        updatedTagsList.push("Halloween");
      }

      console.log(`🔄 [${i + 1}/${productsToProcess.length}] Backing up & updating "${title}"...`);

      // Initialize backup record with pre-modification state
      backups[id] = {
        id: id,
        originalTitle: title,
        originalDescriptionHtml: desc,
        originalTags: tags,
        originalCategory: categoryId,
        targetCategory: targetCategory.name,
        targetCategoryId: targetCategory.id,
        status: "PENDING",
        timestamp: new Date().toISOString()
      };

      console.log(`   - Category mapping: ➡️ "${targetCategory.name}"`);
      console.log(`   - Description: Preserved content, appended Highlights block.`);

      // GraphQL Update
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

      const input = {
        id: id,
        title: formattedTitle,
        descriptionHtml: enhancedDesc,
        tags: updatedTagsList,
        category: targetCategory.id
      };

      try {
        const updateResult = await queryGraphQL(updateMutation, { input });
        const errors = updateResult.data?.productUpdate?.userErrors || [];
        
        if (errors.length > 0) {
          const errMsg = errors.map(e => e.message).join(", ");
          console.log(`   ❌ Error updating: ${errMsg}`);
          backups[id].status = "FAILED";
          backups[id].error = errMsg;
        } else {
          console.log(`   ✅ Update completed successfully!`);
          backups[id].status = "SUCCESS";
        }
      } catch (err) {
        console.log(`   ❌ Exception updating: ${err.message}`);
        backups[id].status = "FAILED";
        backups[id].error = err.message;
      }
      
      // Save incremental backup to disk after each item
      saveBackup(backups);

      // Rate limit safety delay
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log("-".repeat(50));
    }

    console.log("\n🎉 Process finished!");

  } catch (error) {
    console.error("❌ Error running script:", error.message);
  }
}

run();

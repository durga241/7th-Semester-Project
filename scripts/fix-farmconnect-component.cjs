/**
 * Script to fix FarmConnectMarketplace.tsx
 * Removes dummy product data and adds real-time database calls
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing FarmConnectMarketplace.tsx...\n');

const filePath = path.join(__dirname, 'src', 'components', 'FarmConnectMarketplace.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Find the line number where initialProducts starts
const lines = content.split('\n');
let dummyDataStart = -1;
let dummyDataEnd = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// Dummy data for products') || lines[i].includes('const initialProducts')) {
    dummyDataStart = i;
    console.log(`Found dummy data start at line ${i + 1}`);
  }
  if (dummyDataStart > -1 && lines[i].trim() === '];' && dummyDataEnd === -1) {
    dummyDataEnd = i;
    console.log(`Found dummy data end at line ${i + 1}`);
    break;
  }
}

if (dummyDataStart === -1 || dummyDataEnd === -1) {
  console.error('❌ Could not find dummy data boundaries');
  process.exit(1);
}

// Calculate how many lines to remove
const linesToRemove = dummyDataEnd - dummyDataStart + 1;
console.log(`\n📝 Removing ${linesToRemove} lines of dummy data...\n`);

// Create the replacement
const replacement = `// No more dummy data - all products will be loaded from the database
const initialProducts: FrontendProduct[] = [];`;

// Remove the dummy data lines and replace with our clean version
const newLines = [
  ...lines.slice(0, dummyDataStart),
  replacement,
  ...lines.slice(dummyDataEnd + 1)
];

// Write back to file
fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');

console.log('✅ Removed dummy product data');
console.log('✅ Set initialProducts to empty array');
console.log('\n📝 Next steps:');
console.log('1. Open src/components/FarmConnectMarketplace.tsx');
console.log('2. Add useEffect to load products from database');
console.log('3. Update handleAddProduct to use createProduct() API');
console.log('4. Update handleDeleteProduct to use deleteProduct() API');
console.log('\nSee AUTHENTICATION_AND_REALTIME_DATA_FIX.md for detailed instructions\n');


// Quick verification script
console.log('Verifying project structure...\n');

const fs = require('fs');
const path = require('path');

const files = [
  'src/components/ConnectWallet.tsx',
  'src/components/index.ts',
  'src/pages/AssetsPage.tsx',
  'src/lib/hooks/index.ts',
  'src/lib/hooks/useMultiChainBalance.ts',
  'src/lib/chains/config.ts',
  'src/lib/index.ts',
  'src/config/wagmi.ts',
  'src/App.tsx',
];

let allExist = true;

files.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${file}`);
  if (!exists) allExist = false;
});

console.log('\n' + (allExist ? '✅ All files exist!' : '❌ Some files are missing!'));

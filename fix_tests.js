const fs = require('fs');
const files = [
  'src/app/features/inventory/products/products.component.spec.ts',
  'src/app/features/reports/audit/audit.component.spec.ts',
  'src/app/features/inventory/incomes/incomes.component.spec.ts',
  'src/app/features/inventory/reconciliation/reconciliation.component.spec.ts',
  'src/app/features/quick-search/quick-search.component.spec.ts',
  'src/app/features/reports/profitability/profitability.component.spec.ts'
];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  if(!c.includes("import { vi }")) {
      c = "import { vi } from 'vitest';\n" + c.replace(/jasmine\.createSpy\('[^']+'\)/g, 'vi.fn()');
      fs.writeFileSync(f, c);
  }
});
console.log('Fixed');

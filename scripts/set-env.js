const fs = require('fs');

const targetPath = './src/environments/environment.prod.ts';
const targetPathDev = './src/environments/environment.ts';

// Puedes configurar esto en Vercel como variable de entorno
const apiUrl = process.env.API_URL || 'https://proyectoinventariobackend-production.up.railway.app';

const envConfigFile = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}'
};
`;

const envConfigFileDev = `export const environment = {
  production: false,
  apiUrl: '${apiUrl}'
};
`;

fs.mkdirSync('./src/environments', { recursive: true });

fs.writeFileSync(targetPath, envConfigFile);
console.log(`Output generated at ${targetPath}`);

fs.writeFileSync(targetPathDev, envConfigFileDev);
console.log(`Output generated at ${targetPathDev}`);

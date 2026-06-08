const fs = require('fs');
const dotenv = require('dotenv');

// Configurar dotenv para leer el archivo .env
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Crear el contenido del archivo environment.ts
const envConfigFile = `export const environment = {
  production: ${isProduction},
  apiUrl: '${process.env.API_URL || 'http://localhost:8080'}'
};
`;

const targetPath = './src/env.ts';

fs.writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    console.error('Error al generar env.ts:', err);
    throw err;
  }
  console.log(`El archivo env.ts se ha generado correctamente usando las variables de .env.`);
});

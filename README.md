# Proyecto Inventario - Frontend

Sistema de gestión de inventario construido con **Angular 21** y **Tailwind CSS**.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior) - [Descargar](https://nodejs.org/)
- **npm** (versión 10.9.2 o superior) - Se instala con Node.js
- **Git** - Para clonar el repositorio

Verifica las versiones instaladas:

```bash
node --version
npm --version
```

---

## 🚀 Guía de Instalación y Ejecución

### 1. Clonar el Repositorio

```bash
git clone <URL-del-repositorio>
cd Proyecto_Inventario_Frontend
```

### 2. Instalar Dependencias

```bash
npm install
```

Este comando descargará todas las dependencias necesarias del proyecto. El script `postinstall` se ejecutará automáticamente para configurar las variables de entorno.

### 3. Configurar Variables de Entorno

El proyecto utiliza un archivo de configuración `environment.ts` para definir la URL del backend. 

**Para desarrollo:**

1. Crea un archivo `.env` en la raíz del proyecto (o copia `environment.example.ts`)
2. Configura la URL de tu backend:

```env
API_URL=http://localhost:8080
```

O edita directamente `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'  // Cambia según tu backend
};
```

### 4. Ejecutar el Servidor de Desarrollo

```bash
npm start
```

Este comando ejecutará automáticamente:
- Script de configuración (`scripts/set-env.js`)
- Servidor Angular en modo desarrollo

La aplicación estará disponible en: **http://localhost:4200/**

> ✨ **La aplicación se recargará automáticamente** cuando modifiques los archivos del código fuente.

---

## 📦 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor de desarrollo |
| `npm run build` | Compila el proyecto para producción |
| `npm run watch` | Compila en modo observación (desarrollo) |
| `npm test` | Ejecuta los tests unitarios |
| `ng serve` | Inicia servidor sin configuración de env (alternativa) |
| `ng generate component <nombre>` | Genera un nuevo componente |

---

## 🛠️ Desarrollo

### Generar Componentes

```bash
ng generate component features/mi-componente
```

### Generar Servicios

```bash
ng generate service core/services/mi-servicio
```

### Ver opciones de generación disponibles

```bash
ng generate --help
```

---

## ✅ Ejecutar Tests

### Tests Unitarios

```bash
npm test
```

Los tests se ejecutarán usando [Vitest](https://vitest.dev/).

---

## 📦 Build para Producción

```bash
npm run build
```

Los artefactos compilados se guardarán en el directorio `dist/`. La compilación para producción optimiza automáticamente la aplicación para rendimiento y velocidad.

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── core/              # Servicios, guards, interceptores, modelos
│   ├── features/          # Módulos de características (auth, dashboard, admin)
│   ├── shared/            # Componentes compartidos
│   ├── app.routes.ts      # Configuración de rutas
│   └── app.config.ts      # Configuración de la aplicación
├── environments/          # Configuraciones por ambiente
├── styles.scss            # Estilos globales
└── main.ts                # Punto de entrada
```

---

## 🔑 Características del Proyecto

- ✅ **Angular 21** - Framework moderno
- 🎨 **Tailwind CSS** - Utilidades CSS
- 🔐 **JWT Interceptor** - Autenticación
- 🛡️ **Guards** - Protección de rutas (admin, auth)
- 🧪 **Vitest** - Testing unitario
- 📱 **Responsive** - Diseño adaptativo
- 🔄 **Standalone Components** - Componentes independientes

---

## 🔐 Autenticación

El proyecto incluye un sistema de autenticación con:
- `AuthService` - Gestión de login/logout
- `JwtInterceptor` - Interceptor para agregar tokens a las peticiones
- Guards protegidos: `AuthGuard`, `AdminGuard`

---

## 🚨 Solución de Problemas

### "npm command not found"
Asegúrate de que Node.js está instalado correctamente. Reinicia tu terminal después de instalar.

### Puerto 4200 en uso
El servidor intenta usar otro puerto automáticamente, o puedes especificar uno:
```bash
ng serve --port 4300
```

### Errores de variables de entorno
Verifica que `scripts/set-env.js` se ejecutó correctamente y que existe `src/environments/environment.ts`.

---

## 📚 Recursos Útiles

- [Angular Documentation](https://angular.dev)
- [Angular CLI Command Reference](https://angular.dev/tools/cli)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vitest Documentation](https://vitest.dev)

---

## 📝 Notas Adicionales

- **Backend**: Asegúrate de que tu servidor backend está ejecutándose en la URL configurada
- **CORS**: Si hay errores CORS, verifica la configuración del backend
- **Node Version**: Se recomienda usar Node 18+ para mejor compatibilidad

---

Generado con ❤️ para el Proyecto Inventario

# 💰 MiDinero UI

**MiDinero UI** es la interfaz frontend moderna y responsiva para el sistema de gestión de finanzas personales "MiDinero". Construido con las últimas tecnologías de Angular, ofrece una experiencia de usuario fluida para el seguimiento de ingresos, gastos y ahorros.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Angular](https://img.shields.io/badge/Angular-18-red.svg)
![PrimeNG](https://img.shields.io/badge/PrimeNG-17-green.svg)

## 🚀 Características Principales

*   **Dashboard Interactivo:** Visualización en tiempo real de balance, ingresos y gastos con gráficos dinámicos (Charts.js).
*   **Gestión de Transacciones:**
    *   Listados completos de Ingresos y Gastos con filtrado y paginación.
    *   Creación, Edición y Eliminación de transacciones.
    *   **Exportación a Excel** integrada.
*   **Autenticación Segura:**
    *   Login y Registro con validaciones robustas.
    *   Recuperación de contraseña (Forgot/Reset Password).
    *   Manejo de tokens JWT y expiración de sesión.
*   **Diseño Responsivo (Mobile-First):**
    *   **Desktop:** Sidebar lateral colapsable.
    *   **Mobile:** Barra de navegación inferior (estilo app nativa) para fácil acceso.
*   **Modo Oscuro:** Soporte nativo para cambio de tema (Light/Dark).

## 🛠️ Tecnologías

*   **Framework:** [Angular 21](https://angular.dev/) (Standalone Components, Signals).
*   **UI Component Library:** [PrimeNG 21](https://primeng.org/) (Tablas, Diálogos, Gráficos).
*   **Estilos:** CSS moderno con variables CSS y Flexbox/Grid.
*   **Gráficos:** Chart.js & ng2-charts.
*   **Testing:** [Vitest](https://vitest.dev/) (Unit Testing).
*   **Build Tool:** Angular CLI / Vite.

## 📦 Instalación y Ejecución

### Prerrequisitos
*   Node.js (v18 o superior)
*   NPM (v9 o superior)
*   Backend "MiDinero" en ejecución (por defecto en `http://localhost:8080`).

### Pasos

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/midinero-ui.git
    cd midinero-ui
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno (Opcional):**
    Si tu backend no está en `localhost:8080`, edita `src/environments/environment.ts`.

4.  **Ejecutar en Desarrollo:**
    ```bash
    ng serve
    ```
    Abre tu navegador en `http://localhost:4200/`.

## 🧪 Testing

El proyecto utiliza **Vitest** para pruebas unitarias rápidas y eficientes.

*   **Ejecutar Tests:**
    ```bash
    npm test
    # o
    ng test
    ```
*   **Cobertura:**
    El proyecto cuenta con configuración para coverage (ver `vite.config.ts`).

## 📂 Estructura del Proyecto

```
src/app/
├── core/               # Modelos, Guards, Interceptores y Servicios Globales
├── features/           # Módulos funcionales (Auth, Dashboard, Transactions, Categories)
├── layout/             # Componentes estructurales (Sidebar, Navbar, Layout)
└── shared/             # Componentes y Pipes reutilizables
```

## 🔒 Seguridad

*   Protección contra **XSS** mediante sanitización de Angular.
*   Manejo seguro de rutas con **Guards** (`auth.guard.ts`).
*   Interceptor HTTP para inyección automática de Tokens JWT.

## 🤝 Contribución

1.  Fork el proyecto.
2.  Crea tu rama de feature (`git checkout -b feature/AmazingFeature`).
3.  Commit tus cambios (`git commit -m 'Add some AmazingFeature'`).
4.  Push a la rama (`git push origin feature/AmazingFeature`).
5.  Abre un Pull Request.

---
Desarrollado por Andrés Serrano.

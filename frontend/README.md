# Simple POS Full Stack - Frontend

The frontend application for the Simple POS system, built with React, TypeScript, and Vite. This application provides a responsive interface for managing orders, tables, and reports.

## Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [MobX](https://mobx.js.org/) (with `mobx-react-lite`)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Localization**: [i18next](https://www.i18next.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router](https://reactrouter.com/)

## Prerequisites

- Node.js (v18 or higher)
- npm or pnpm

## Getting Started

1.  **Install Dependencies**

    ```bash
    npm install
    ```

2.  **Environment Setup**

    Copy the example environment file and configure it:

    ```bash
    cp .env.example .env
    ```

3.  **Run Development Server**

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:5173`.

4.  **Build for Production**

    ```bash
    npm run build
    ```

## Project Structure

```
src/
├── components/         # Shared UI components
├── constants/          # App constants and configuration
├── features/           # Feature-based modules
│   ├── auth/           # Authentication feature
│   ├── dashboard/      # Dashboard and statistics
│   ├── pos/            # Point of Sale interface
│   ├── reports/        # Reporting and history
│   └── settings/       # Application settings
├── hooks/              # Custom React hooks
├── locales/            # i18n translation files
├── services/           # API services and data fetching
├── stores/             # MobX stores for global state
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Design System

The application follows a mobile-first responsive design approach.

- **Colors**: Defined in `tailwind.config.js` with semantic naming.
- **Dark Mode**: Fully supported via Tailwind's `dark` variant.

## Localization

Translations are managed in `src/locales/`. The default language is Turkish (`tr`).
To add a new key, update `src/locales/tr.json` and use the `useTranslation` hook in components:

```tsx
const { t } = useTranslation();
<h1>{t("section.key")}</h1>;
```


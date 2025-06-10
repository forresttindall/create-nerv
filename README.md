# NERV Stack

<p align="center">
  <img src="public/images/dot-triangle.png" alt="NERV Stack Logo" width="100"/>
</p>

<p align="center">
  A fast, fullstack, and serverless solution for modern web applications.
</p>

---

## About NERV Stack

The **NERV Stack** is a robust and efficient boilerplate designed for building modern, scalable web applications with a focus on speed and serverless deployment. It combines popular and powerful technologies to provide a seamless development experience from frontend to backend.

**Purpose:**
NERV Stack is engineered for:
* **Rapid Development:** Get your fullstack application up and running quickly with pre-configured tools.
* **Fullstack Capabilities:** Seamlessly integrate your React frontend with an Express.js backend.
* **Serverless Readiness:** Optimized for deployment on serverless platforms, ensuring scalability and cost-efficiency.
* **Sleek Design:** A minimalist, dark-mode aesthetic inspired by modern interfaces like Supabase.

## Technologies Used

* **Vite:** A lightning-fast build tool and development server for modern web projects.
* **Express.js:** A flexible and minimalist Node.js web application framework, ideal for creating robust APIs.
* **React:** A declarative, component-based JavaScript library for building dynamic user interfaces.
* **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine, enabling server-side execution.
* **Plain CSS:** Styled with a clean, custom minimalist dark theme, avoiding heavy CSS frameworks for leaner builds.

## Getting Started

Follow these steps to get your NERV Stack project up and running locally.

### Prerequisites

Ensure you have the following installed on your machine:

* **Node.js** (version 18.0.0 or higher)
* **npm** (version 8.0.0 or higher)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/forresttindall/nerv.git](https://github.com/forresttindall/nerv.git) 
    cd nerv
    ```

2.  **Install dependencies:**
    Navigate to the project root and install all necessary packages for both the frontend and backend:
    ```bash
    npm install
    ```

### Running the Application

### Development Mode

To start the development server with Hot Module Replacement (HMR) for live updates:

```bash
npm run dev
```
### Production Build
To build the application for production:
```bash
npm run build
```
### Running the Backend
Navigate to the backend directory and start the Express.js server:
```bash
cd backend
npm start
```

### Project Structure
```
nerv/
├── public/                     # Static assets (images, favicon)
│   └── images/
│       └── dot-triangle.png    # NERV Stack Logo
├── src/                        # Frontend source code
│   ├── assets/                 # (Optional) Images, fonts, etc.
│   ├── components/             # (Optional) Reusable React components
│   ├── App.jsx                 # Main React component
│   ├── index.css               # Global styles (Supabase dark minimalist theme)
│   └── main.jsx                # React entry point
├── api/                        # Serverless API routes (for Express backend)
│   └── status.js               # Example API endpoint
├── .gitignore                  # Specifies untracked files to ignore
├── index.html                  # Main HTML file
├── package.json                # Project dependencies and scripts
├── vite.config.js              # Vite configuration
└── README.md                   # This file
```

## Built by CreationBase

NERV Stack is proudly developed and maintained by **[CreationBase](https://creationbase.io)**.

---
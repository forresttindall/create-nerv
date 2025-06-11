<h1 align="center"> NERV Stack </h1>

<p align="center">
  <img src="https://github.com/user-attachments/assets/9464965d-6a68-48f6-88db-4448157a2d2e" alt="NERV Stack Logo" width="100px" />
</p>

<p align="center">
  A fast, fullstack, and serverless solution for modern web applications by Creationbase.io
</p>

---
<img width="871" alt="nerv" src="https://github.com/user-attachments/assets/24d22c81-f25a-4702-afc7-71ef3a038fd8" />



## About NERV Stack

### Use npx create-nerv your-app

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
```
npx create-nerv your-app
```

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
│   ├── contact.js              # API endpoint for contact forms/data
│   ├── data.js                 # API endpoint for general data operations
│   └── status.js               # API endpoint for application status checks
├── .gitignore                  # Specifies untracked files to ignore
├── index.html                  # Main HTML file
├── package.json                # Project dependencies and scripts
├── vite.config.js              # Vite configuration
└── README.md                   # This file
```

## Built by CreationBase

NERV Stack is proudly developed and maintained by **[CreationBase](https://creationbase.io)**.

---
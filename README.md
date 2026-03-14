# PHC Inventory System

A complete Medicine Inventory Management System for Primary Health Centres.

## Features


- **Role-Based Access Control**: Admin and Staff roles.
- **Inventory Management**: Add, update, delete medicines. Track quantity, expiry, and min stock levels.
- **Stock Tracking**: Real-time stock updates (IN/OUT).
- **Dashboard**: Visual analytics of stock levels and low stock alerts.
- **Security**: JWT Authentication, Password Hashing, Secure Headers.

## Tech Stack


- **Frontend**: React, Vite, Recharts, Lucide React (Icons), CSS Modules.
- **Backend**: Node.js, Express, Sequelize, SQLite (Zero-config database).

## Prerequisites

- Node.js (v16+)
- npm

## Setup & Run

1.  **Install Dependencies**
    ```bash
    # Install Server Dependencies
    cd server
    npm install
    
    # Install Client Dependencies
    cd ../client
    npm install
    ```

2.  **Seed Database** (Populate with initial data)
    ```bash
    cd server
    npm run seed
    ```

3.  **Run Application**

    *Terminal 1 (Server)*:
    ```bash
    cd server
    npm start
    ```
    Server runs on `http://localhost:5000`.

    *Terminal 2 (Client)*:
    ```bash
    cd client
    npm run dev
    ```
    Client will run on `http://localhost:5173`.

## Default Credentials

- **Admin**: `admin` / `adminpassword`
- **Staff**: `staff` / `staffpassword`

## Project Structure

```
phc-inventory-system/
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/         # DB Config
│   │   ├── controllers/    # Logic
│   │   ├── models/         # Database Models
│   │   ├── routes/         # API Routes
│   │   └── index.js        # Main Entry
├── client/                 # Frontend
│   ├── src/
│   │   ├── components/     # React Components
│   │   ├── App.jsx         # Main App
│   │   └── index.css       # Global Styles
```

## Architecture

- **MVC Pattern**: The backend follows Model-View-Controller (MVC) separation.
- **REST API**: API endpoints are RESTful using standard HTTP verbs.
- **Normalized DB**: SQLite database with foreign key relationships between Users, Medicines, and Transactions.

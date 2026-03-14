# Prompt to Generate the React Native Mobile App

You can copy the prompt below and paste it into a new conversation (or provide it to any AI agent) to build the mobile application version using React Native and Expo.

***

**Build a Mobile App for a Primary Health Center (PHC) Inventory System**

**Context & Goal**
I have an existing web-based Primary Health Center (PHC) Inventory System. I need to build a native mobile application (iOS & Android) that acts as a client for this system. The backend is already built using Node.js, Express, and Sequelize (SQLite/MySQL) with a REST API secured by JWT authentication. 

**Technology Stack**
- Framework: React Native with Expo
- Navigation: React Navigation (Bottom Tabs + Stack Navigator)
- State Management: React Context or Zustand
- API Requests: Axios
- UI Styling: NativeWind (Tailwind CLI) or standard StyleSheet with a modern, clean, and accessible UI (Support for Dark Mode is a plus). Icons from `lucide-react-native` or `@expo/vector-icons`.

**Backend API Endpoints (Pre-existing)**
The mobile app should communicate with these existing endpoints:
- `POST /api/auth/login`: Accepts `username` and `password`, returns JWT token and user info (role: admin/staff).
- `GET /api/auth/me`: Verifies token and returns current user.
- `GET /api/inventory`: Fetches all medicines (including stock, expiry, minStockLevel, supplier info).
- `POST /api/inventory`: Adds a new medicine.
- `PUT /api/inventory/:id/stock`: Updates stock (type: 'IN' or 'OUT', quantity, reason).
- `POST /api/inventory/dispense`: Dispenses medicines to a patient. Payload: `items` (array of medicineIds and quantities), `patientName`, `patientAge`, `patientGender`, `patientContact`, `doctorName`.
- `GET /api/inventory/transactions`: Fetches all IN/OUT transactions.
- `GET /api/suppliers`: Fetches list of suppliers.
- `GET /api/reorders`: Fetches low-stock reorder requests.
- `GET /api/audit`: Fetches system audit logs (Admin only).

**Mobile App Structure & UI Requirements**

1.  **Authentication Flow**
    - **Login Screen**: Simple, clean form asking for Username and Password. 
    - **Secure Storage**: Store the JWT token securely (e.g., using `expo-secure-store`). Check for existing token on app launch to auto-login.

2.  **Main App Navigation (Bottom Tabs)**
    Once logged in, the user should see a Bottom Tab Navigator with the following main screens:
    - **Dashboard (Home)**: High-level metrics (Total Medicines, Low Stock Alerts, Recent Transactions).
    - **Issue / Dispense**: A flow to issue medicines to patients.
    - **Inventory**: Browse, search, and manage medicine stock.
    - **More / Menu**: A drawer or a simple list screen providing access to Transactions, Suppliers, Reorders, Audit Logs, and Logout.

3.  **Detailed Screen Requirements**
    - **Issue Medicine Screen (Crucial Feature)**:
        - Must have a Search bar to find medicines.
        - Tap to add medicines to a temporary "Cart".
        - A "Review Cart" bottom sheet or secondary screen to adjust quantities.
        - A form to enter Patient Details (Name, Age, Gender, Contact, Doctor).
        - A "Complete Issue" button that submits the payload to `/api/inventory/dispense`.
    - **Inventory List Screen**:
        - List of all medicines with clear stock indicators. Color-code stock numbers (e.g., green for healthy, red for low/out of stock).
        - Tap a medicine to open a Details screen to perform quick "Restock (IN)" actions.
    - **History / Transactions Screen**:
        - A chronological feed of stock ins and outs. Show positive numbers with green (+) and issues to patients with red (-).

**Design Guidelines**
- **Modern & Premium Feel**: Use a dark-mode friendly palette (e.g., deep backgrounds `#121212`, clean surface cards `#1E1E1E`, and vibrant accent colors like blue `#3b82f6` or emerald `#10b981`).
- **Mobile First**: Use larger touch targets, swipe gestures where appropriate (e.g., swipe left to remove an item from the Issue cart), and native-feeling transitions.
- **Feedback**: Show toast notifications or native alerts for successful actions (e.g., "Issued Successfully") and clear error messages if an API call fails or stock is insufficient.

Please generate the foundational code for this React Native (Expo) app, starting with `App.js` (including navigation setup) and the `Issue Medicine` screen logic.

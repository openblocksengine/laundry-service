# Service Laundry Management System

A comprehensive web-based management system for laundry businesses, featuring specialized portals for Admin, Cashier, Driver, and Customers.

## 🚀 Tech Stack

### Backend
- **Framework:** Python Flask
- **Database:** MySQL
- **Authentication:** JWT (Flask-JWT-Extended) & Bcrypt
- **Environment:** python-dotenv

### Frontend
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS & Framer Motion
- **UI Components:** Radix UI & Lucide React
- **State Management:** Zustand
- **API Client:** Axios

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [XAMPP](https://www.apachefriends.org/index.html) or MySQL Server
- [Git](https://git-scm.com/)

---

## 📦 Installation & Setup

### 1. Database Setup
1. Open **phpMyAdmin** or your preferred MySQL client.
2. Create a new database named `laundry_db`.
3. Import the `schema.sql` file located in the root directory of this project.
   - This will create the necessary tables and seed an initial Admin account.

### 2. Backend Setup
1. Open your terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows:** `venv\Scripts\activate`
   - **Mac/Linux:** `source venv/bin/activate`
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Configure environment variables (Check `.env` file):
   - Ensure `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` match your MySQL configuration.
6. Run the backend server:
   ```bash
   python run.py
   ```
   The API will be available at `http://127.0.0.1:5000`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

---

## 🔐 Default Credentials

After importing the SQL schema, you can use the following default account:

| Role  | Username | Password |
| :---  | :---     | :---     |
| Admin | `admin`  | `admin123` |

---

## 📁 Project Structure

```text
service-laundry/
├── backend/            # Flask API
│   ├── app/            # Application logic (routes, models)
│   ├── .env            # Environment configuration
│   └── run.py          # Entry point
├── frontend/           # React Application
│   ├── src/
│   │   ├── api/        # Axios configuration
│   │   ├── components/ # Reusable UI components
│   │   └── pages/      # Specific role dashboards
│   └── package.json
└── schema.sql          # Database structure & seed data
```

---

## 📝 Features
- **Admin Dashboard:** Manage services, users, and track overall business performance.
- **Cashier Portal:** Handle new orders, manage payments, and update order statuses.
- **Driver App:** View delivery schedules and update delivery progress.
- **Customer Portal:** Place new orders and track laundry status in real-time.
- **Real-time Tracking:** Log-based tracking for every stage of the laundry process.

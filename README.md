CreditSea

CreditSea** is a application that processes and visualizes **Experian Soft Credit Pull XML files**.

It allows users to:
- Upload XML files via REST API.
- Parse and extract core credit information.
- Store structured reports in MongoDB.
- View data-rich reports with labeled tables (Basic Details, Summary, Credit Accounts).
- Export CSV data for offline review.


**Prerequisites**

Before running

1. Backend Setup

Install dependencies
cd backend

npm install
npm install express mongoose multer xml2js helmet cors dotenv
npm install --save-dev nodemon

.env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/creditsea

To Run the server
---- npm run dev


2. Frontend Setup

Install dependencies
cd frontend

npm install 
npm install react-router-dom @tanstack/react-query axios tailwindcss recharts

To Run the server
---- npm run dev



Postman Endpoint

| # | API                   | Method | Test                          |
| - | --------------------- | ------ | ----------------------------- |
| 1 | `/health`             | GET    | Should return `{status:"ok"}` |
| 2 | `/api/reports/upload` | POST   | Upload `experian1.xml`        |
| 3 | `/api/reports`        | GET    | Should list uploaded report   |
| 4 | `/api/reports/:id`    | GET    | Should show parsed data       |
| 5 | `/api/reports/:id`    | DELETE | Should delete that report     |

Architecture

+-------------------------------------------------------------+
|                        FRONTEND (React)                     |
|-------------------------------------------------------------|
|  • Upload Page – Upload XML → /api/reports/upload           |
|  • Reports List Page – Fetch /api/reports                   |
|  • Report Detail Page – Fetch /api/reports/:id              |
|  • CSV Export, Pagination, Search, Responsive UI             |
|-------------------------------------------------------------|
| Built with: React + Vite + Tailwind + React Query + Axios   |
+-------------------------------------------------------------+
                              │
                              ▼
+-------------------------------------------------------------+
|                       BACKEND (Node.js + Express)           |
|-------------------------------------------------------------|
|  Routes:                                                    |
|   • POST /api/reports/upload   → File upload (multer)       |
|   • GET  /api/reports          → Fetch all reports          |
|   • GET  /api/reports/:id      → Fetch single report        |
|   • DELETE /api/reports/:id    → Delete report (optional)   |
|   • GET /health                → Health check endpoint      |
|-------------------------------------------------------------|
|  Controllers:                                                |
|   • reports.controller.js → handle XML parsing, storage     |
|-------------------------------------------------------------|
|  Middleware:                                                 |
|   • multer.middleware.js → handles XML upload validation    |
|   • error.middleware.js  → unified error logging/response   |
|-------------------------------------------------------------|
|  Services:                                                   |
|   • xmlParser.service.js → parse XML via fast-xml-parser    |
|-------------------------------------------------------------|
|  Models:                                                     |
|   • Report.js → stores extracted info in MongoDB            |
|-------------------------------------------------------------|
|  Tech: Express, Mongoose, Multer, xml2js, Helmet, CORS      |
+-------------------------------------------------------------+
                              │
                              ▼
+-------------------------------------------------------------+
|                       DATABASE (MongoDB)                    |
|-------------------------------------------------------------|
| Collection: reports                                          |
|-------------------------------------------------------------|
| Example Document:                                            |
| {                                                            |
|   _id: ObjectId("..."),                                      |
|   basic: { name, pan, mobile, creditScore },                 |
|   summary: { totalAccounts, activeAccounts, ... },           |
|   accounts: [ { bank, accountNumber, status, balance } ],    |
|   createdAt: ISODate(),                                      |
|   updatedAt: ISODate()                                       |
| }                                                            |
+-------------------------------------------------------------+

Data Flow

1. Upload Flow

 - User selects Experian XML in the React Upload Page.
 - Axios sends POST /api/reports/upload → multipart/form-data.
 - Express + Multer middleware validates file type (.xml).
 - File content parsed by fast-xml-parser/xml2js.
 - Parsed data transformed into structured JSON:
 - Basic info: name, PAN, phone, credit score
 - Summary: total accounts, active, closed, secured/unsecured
 - Accounts: bank, account number, overdue, balance, etc.
 - Data saved in MongoDB (reports collection).
 - Backend returns { message, reportId }.

2️. Listing Flow

 - Frontend calls GET /api/reports?page=1&limit=10.
 - Backend queries MongoDB and returns paginated data.
 - Frontend shows it in a clean table with search, sort, and CSV download.

3️. Report Detail Flow

 - User clicks “View” → triggers GET /api/reports/:id.
 - Backend fetches full JSON (basic + summary + accounts).
 - Frontend displays it in 3 sections:
 - Basic Details Table
 - Report Summary Table
 -Credit Accounts Table



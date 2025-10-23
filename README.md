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




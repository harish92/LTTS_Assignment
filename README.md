# **Sales Transaction Management System**  

A full-stack web application for **uploading, processing, and visualizing sales transaction data** from CSV files.  

## **📌 Features**
✅ **CSV Upload & Parsing** – Stream-based processing for large files  
✅ **MongoDB Data Storage** – Efficient schema design for querying  
✅ **Material UI DataGrid** – Interactive UI with sorting & filtering  
✅ **Total Sales Calculation** – Aggregate customer sales insights  
✅ **REST API** – Fetch transactions, customers, and products  
✅ **Containerized Deployment** – Run with Docker & Docker Compose  

---

## **🛠️ Tech Stack**
- **Frontend:** React (Vite), Material UI  
- **Backend:** Node.js, Express, Mongoose  
- **Database:** MongoDB  
- **Containerization:** Docker, Docker Compose  

---

## **🚀 Project Installation & Running the App**  

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/harish92/LTTS_Assignment.git
cd sales-data-management

📌 Build & Run Containers


docker-compose up --build

docker ps

📌 Check Container Logs


docker-compose logs -f backend

docker-compose logs -f frontend



```
---
## Access the Application
Frontend URL: http://localhost:3000
Backend API URL: http://localhost:5000
MongoDB Connection: mongodb://localhost:27017/sales_db

---
# Tostçu POS Backend

Robust, scalable, and secure POS (Point of Sale) backend system designed for fast-food businesses. Built with Go (Golang), Fiber, and SQLite to ensure high performance and reliability.

## 🚀 Features

### core Functionalities

- **Order Management**:
  - Open, Modify (Add/Remove items), and Close orders via REST API.
  - **ACID Transactions**: Ensures data integrity when closing orders and recording financial data.
  - **Dynamic Totals**: Automatically recalculates order totals using GORM hooks.
- **Menu Management**:
  - Manage Categories and Products.
  - Efficient filtering and retrieval.
- **Financial & Expense Management**:
  - **Daily Reports**: Automated calculation of Total Sales, Cash/POS split, and Net Profit.
  - **Expense Tracking**: Full CRUD support for manual expenses (e.g., bills, supplies).
- **User Management**:
  - Role-Based Access Control (RBAC): Admin vs. Waiter roles.
  - Secure PIN-based Login (Bcrypt hashing + JWT).

### 🛠 Technical Highlights

- **Architecture**: Follows **SOLID** principles, utilizing **Repository Pattern** and **Service Layer** for Clean Architecture.
- **Database**: **SQLite** with **GORM** (ORM), configured with **WAL Mode** for high concurrency.
- **Soft Deletes**: Data is never physically removed; `gorm.DeletedAt` is used for auditing and safety.
- **Logging**: High-performance structured logging with **Zap** and **Lumberjack** (Log rotation support).
- **Security**:
  - Strict input validation using `go-playground/validator`.
  - Panic Recovery Middleware.

### 📐 Development Guidelines

This project is built with a strong focus on **Maintainability**, **Reliability**, and **Scalability**.

1.  **Clean Architecture**: Separation of concerns is strictly enforced.
    - `Handler`: Handles HTTP requests/responses.
    - `Service`: Contains core business logic.
    - `Repository`: Handles database interactions.
2.  **Standardized Responses**: All API endpoints return a predictable JSON structure, making frontend integration seamless.
3.  **ACID compliance**: Financial transactions (Order closing, Expense recording) are wrapped in atomic database transactions to prevent data inconsistency.
4.  **Concurrency Safety**: Go's concurrency primitives and SQLite's WAL mode are utilized to handle multiple requests efficiently.

## 📦 Standard API Response

Every API response follows this strict contract:

```json
{
  "success": true,             // Boolean status
  "code": "SUCCESS",           // Machine-readable code (e.g., TABLE_OCCUPIED)
  "message": "Operation done", // Human-readable message
  "data": { ... }              // Optional payload
}
```

This consistency allows the frontend to have a single, robust `apiClient` interceptor for error handling and success messages.

## 🧰 Tech Stack

- **Language**: Go 1.24+
- **Framework**: [Fiber v2](https://gofiber.io/) (Fastest Go Web Framework)
- **Database**: SQLite3
- **ORM**: [GORM](https://gorm.io/)
- **Logging**: [Zap](https://github.com/uber-go/zap)
- **Validation**: Validator v10

## 📂 Project Structure

```
backend/
├── cmd/
│   ├── api/            # Main entry point (server)
│   └── seed/           # Database seeder script
├── internal/
│   ├── handlers/       # HTTP Handlers (Controllers)
│   ├── middleware/     # Auth, Logging, Recovery Middleware
│   ├── models/         # Database Models (Entitites)
│   ├── repositories/   # Data Access Layer (Interfaces & GORM implementations)
│   ├── routes/         # Route definitions and wiring
│   └── services/       # Business Logic Layer
├── pkg/
│   ├── config/         # Configuration loader
│   ├── constants/      # App-wide constants (Error codes)
│   ├── logger/         # Structured logger setup
│   └── utils/          # Shared utilities (JWT, Responses)
└── logs/               # Application logs (Auto-rotated)
```

## ⚡️ Setup & Installation

### Prerequisites

- Go 1.24 or higher
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd simple-pos-full-stack/backend
```

### 2. Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
DB_PATH=./tostcu.db
JWT_SECRET=your-super-secret-key-change-this
LOG_FILE_PATH=./logs/tostcu-pos.log
```

### 3. Install Dependencies

```bash
go mod tidy
```

### 4. Seed Database (Optional)

Populate the database with default Categories, Products, and Admin User:

```bash
go run cmd/seed/main.go
# Admin Login -> UserID: 1, PIN: 1234
```

### 5. Run Server

```bash
go run cmd/api/main.go
```

The server will start at `http://localhost:3000`.

## 📡 API Documentation

### Authentication

| Method | Endpoint      | Description              | Auth Required |
| :----- | :------------ | :----------------------- | :------------ |
| `POST` | `/auth/login` | Login with User ID & PIN | No            |

### Orders

| Method   | Endpoint                           | Description           | Auth Required |
| :------- | :--------------------------------- | :-------------------- | :------------ |
| `POST`   | `/api/v1/orders`                   | Create a new Order    | Yes           |
| `POST`   | `/api/v1/orders/:id/items`         | Add Item to Order     | Yes           |
| `PUT`    | `/api/v1/orders/:id/items/:itemId` | Update Item Quantity  | Yes           |
| `DELETE` | `/api/v1/orders/:id/items/:itemId` | Remove Item           | Yes           |
| `POST`   | `/api/v1/orders/:id/close`         | Close Order (Payment) | Yes           |

### Transactions (Expenses)

| Method   | Endpoint                           | Description    | Auth Required |
| :------- | :--------------------------------- | :------------- | :------------ |
| `GET`    | `/api/v1/transactions/expense`     | List Expenses  | Admin         |
| `POST`   | `/api/v1/transactions/expense`     | Create Expense | Admin         |
| `PUT`    | `/api/v1/transactions/expense/:id` | Update Expense | Admin         |
| `DELETE` | `/api/v1/transactions/expense/:id` | Delete Expense | Admin         |

### Management

| Method | Endpoint                       | Description                | Auth Required |
| :----- | :----------------------------- | :------------------------- | :------------ |
| `POST` | `/api/v1/management/start-day` | Start Work Period          | Admin         |
| `GET`  | `/api/v1/analytics/daily`      | Get Daily Financial Report | Admin         |

---

Developed with by [kaancaman](https://github.com/kaancaman)

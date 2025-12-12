# Simple POS Backend

A robust, production-ready backend system designed for the fast-paced environment of small food businesses (kiosks, cafes). It manages the entire lifecycle of a business day, from opening the shutter to closing the register.

## 📖 Real-World Scenario: A Day at "Tostçu Kaan Usta"

To understand the capabilities of this system, let's look at a typical day:

### 1. 🌅 Opening the Shop (Vardiya Başlatma)

**Scenario**: You arrive at 08:00 AM.

- **Action**: Login as Admin and click **"Start Day"**.
- **System**: Creates a new `WorkPeriod`. From this moment, all sales and expenses are tracked within this specific shift.
- **Status**: Shop is now **OPEN**.

### 2. 👨‍🍳 Staff Login

**Scenario**: Your waiter, Ali, arrives.

- **Action**: Ali logs in with his **4-digit PIN**.
- **Security**: As a waiter, he can manage tables and orders but cannot access financial reports or sensitive admin settings.

### 3. 📝 Taking Orders (Sipariş Yönetimi)

**Scenario**: A customer sits at **Table 1** and orders a "Mixed Toast" and "Large Ayran".

- **Action**: Ali selects Table 1 -> Adds items from the menu -> Clicks "Send".
- **System**:
  - Creates an `Order` with status `OPEN`.
  - Marks Table 1 as `OCCUPIED`.
  - Kitchen receives the order instantly.
- **Dynamics**: Customer asks for another Ayran? Ali simply updates the quantity. The total updates dynamically (e.g., 150 TL -> 180 TL).

### 4. 💸 Managing Expenses (Gider Takibi)

**Scenario**: You run out of dish soap during the rush. You buy one from the market for 50 TL cash.

- **Problem**: Cash left the drawer, but no sale was made.
- **Action**: Admin records a new **Expense**: "Cleaning Supplies", 50 TL, Cash.
- **System**: This amount is deducted from the day's **Net Profit** calculation.

### 5. 💳 Closing & Payment

**Scenario**: Table 1 asks for the bill. They pay via Credit Card.

- **Action**: Ali selects "Close Order" -> Choose "Credit Card".
- **System**:
  - Order status becomes `COMPLETED`.
  - Table 1 becomes `AVAILABLE` again.
  - Revenue is recorded under "POS Sales".

### 6. 🌙 Closing the Shop (Z Raporu)

**Scenario**: It's closing time. You want to see how much you earned.

- **Action**: Admin clicks **"End Day"**.
- **System Generates Z-Report**:
  - **Total Sales**: 5,000 TL
  - **Expenses**: -50 TL
  - **Net Profit**: 4,950 TL
- **Status**: Shift is closed. The system allows no more sales until the next day starts.

---

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

## This consistency allows the frontend to have a single, robust `apiClient` interceptor for error handling and success messages.

## 🧪 Testing Philosophy (E2E)

Reliability is non-negotiable for a POS system. We don't just test functions; we test **flows**.

### End-to-End (E2E) Test Suite

The `tests/e2e/e2e_test.go` suite simulates the exact scenario above, running against a real SQLite database.

**The Test Flow:**

1.  **Auth**: Admin logs in, gets JWT.
2.  **Start Day**: API call to open a new work period.
3.  **User Cycle**: Create Waiter -> Update Profile -> Change PIN -> Delete User.
4.  **Menu Cycle**: Create Category -> Create Product -> Update Price.
5.  **Order Cycle**:
    - Open Order for Table.
    - Add Items -> Update Quantity -> Remove Item.
    - **Strict Check**: Verify order total calculation.
    - Close Order with Payment (CASH).
6.  **Expense Cycle**: Add manual expense -> Verify it links to the active Work Period.
7.  **End Day**: Close shift.
8.  **Verification**:
    - **Z-Report Check**: Does (Sales - Expenses) = Net Profit?
    - **Data Integerity**: Are all records status correct?

### 📂 Test Logs

We separate test outputs to keep things clean:

- **Console**: Minimal output (Step progress).
- **File (`tests/e2e/logs/test-output.log`)**: Detailed HTTP Request/Response logs for every step, useful for debugging.

---

## 🛠 Technical Stack

- **Language**: Go (Golang)
- **Framework**: Fiber v2 (High Performance)
- **Database**: SQLite with GORM (WAL Mode enabled for concurrency)
- **Architecture**: Clean Architecture (Handler -> Service -> Repository)
- **Security**: JWT Auth + BCrypt PIN Hashing + Input Validation

## 🚀 Setup

1.  **Clone & Install**:
    ```bash
    git clone <repo>
    go mod tidy
    ```
2.  **Run Tests**:
    ```bash
    go test -v ./tests/e2e/...
    ```
3.  **Start Server**:
    ```bash
    go run cmd/api/main.go
    ```

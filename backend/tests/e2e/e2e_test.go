package e2e

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"testing"
	"time"

	"simple-pos/internal/models"
	"simple-pos/internal/platform/database"
	"simple-pos/internal/server"
	"simple-pos/pkg/config"
	"simple-pos/pkg/utils"

	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

var (
	baseURL    = "http://localhost:8378"
	authToken  string
	cfg        *config.Config
	testDBPath = "tostcu_test.db"
	adminPin   = "1234"
	adminUser  = "admin"
)

// TestMain controls the main entry point for E2E tests
func TestMain(m *testing.M) {
	// 1. Setup Environment
	_ = godotenv.Load("../../.env")
	os.Setenv("APP_PORT", "8378")
	os.Setenv("DB_PATH", testDBPath)
	os.Setenv("APP_ENV", "test")
	os.Setenv("JWT_SECRET", "test-secret-key")

	cfg = config.LoadConfig()

	// Initialize JWT for tests
	utils.InitJWT(cfg.JWTSecret)

	// Clean up any previous test db
	cleanupDBFiles(testDBPath)

	// 2. Initialize Server
	app := server.New(cfg)

	// 3. Seed Data (Directly to DB)
	seedAdminUser()

	// 4. Start Server in Goroutine
	go func() {
		if err := app.Listen(":" + cfg.AppPort); err != nil {
			log.Printf("Test server error: %v", err)
		}
	}()

	// Wait for server to start
	waitForServer()

	// 5. Run Tests
	exitCode := m.Run()

	// 6. Cleanup
	cleanupDBFiles(testDBPath)
	os.Exit(exitCode)
}

func waitForServer() {
	for i := 0; i < 10; i++ {
		resp, err := http.Get(baseURL + "/health")
		if err == nil && resp.StatusCode == 200 {
			return
		}
		time.Sleep(200 * time.Millisecond)
	}
	log.Println("Server did not start in time")
}

func cleanupDBFiles(dbName string) {
	os.Remove(dbName)
	os.Remove(dbName + "-wal")
	os.Remove(dbName + "-shm")
}

func seedAdminUser() {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(adminPin), bcrypt.DefaultCost)
	admin := models.User{
		Name:     adminUser,
		PinCode:  string(hashedPassword),
		Role:     "admin",
		IsActive: true,
	}
	if err := database.DB.Create(&admin).Error; err != nil {
		log.Fatalf("Failed to seed admin user: %v", err)
	}
}

// TestE2E_FullFlow executes the entire lifecycle test with detailed logging
func TestE2E_FullFlow(t *testing.T) {
	// ==========================================
	// 1. AUTH & SETUP
	// ==========================================

	t.Run("1_Auth_Login", func(t *testing.T) {
		payload := map[string]interface{}{
			"user_id": 1,
			"pin":     adminPin,
		}
		resp, code := logAndRequest(t, "Admin Login", "POST", "/auth/login", payload, "")
		require.Equal(t, http.StatusOK, code)

		var result map[string]interface{}
		extractData(t, resp, &result)

		token, ok := result["token"].(string)
		require.True(t, ok, "Token should be present")
		authToken = token
	})

	t.Run("1_Management_StartDay", func(t *testing.T) {
		payload := map[string]interface{}{
			"user_id": 1,
		}
		_, code := logAndRequest(t, "Start Work Day", "POST", "/api/v1/management/start-day", payload, authToken)
		require.True(t, code == http.StatusOK || code == http.StatusCreated)
	})

	// ==========================================
	// 2. USER CRUD
	// ==========================================
	var createdUserID uint

	t.Run("2_User_Create", func(t *testing.T) {
		payload := map[string]interface{}{
			"name": "Ali Garson",
			"pin":  "1111",
			"role": "waiter",
		}
		resp, code := logAndRequest(t, "Create Waiter User", "POST", "/api/v1/users", payload, authToken)
		require.True(t, code == http.StatusCreated || code == http.StatusOK, "Expected 201 or 200")

		var user models.User
		extractData(t, resp, &user)
		createdUserID = user.ID
		assert.Equal(t, "Ali Garson", user.Name)
	})

	t.Run("2_User_Update", func(t *testing.T) {
		payload := map[string]interface{}{
			"name":      "Ali Veli",
			"role":      "waiter",
			"is_active": true,
		}
		resp, code := logAndRequest(t, "Update Waiter Name", "PUT", fmt.Sprintf("/api/v1/users/%d", createdUserID), payload, authToken)
		require.Equal(t, http.StatusOK, code)

		var user models.User
		extractData(t, resp, &user)
		assert.Equal(t, "Ali Veli", user.Name)
	})

	t.Run("2_User_ChangePin", func(t *testing.T) {
		payload := map[string]interface{}{
			"pin": "2222",
		}
		_, code := logAndRequest(t, "Change Waiter PIN", "PUT", fmt.Sprintf("/api/v1/users/%d/pin", createdUserID), payload, authToken)
		require.Equal(t, http.StatusOK, code)
	})

	t.Run("2_User_Delete", func(t *testing.T) {
		// Create a dummy user to delete, preserving Ali for later logic if needed
		// Actually Ali is needed for Order creation test?
		// Previous test used created user ID. Let's create another one for delete test.
		payload := map[string]interface{}{
			"name": "Mehmet Delete",
			"pin":  "9999",
			"role": "waiter",
		}
		resp, code := logAndRequest(t, "Create Temp User for Delete", "POST", "/api/v1/users", payload, authToken)
		require.True(t, code == http.StatusCreated || code == http.StatusOK, "Expected 201 or 200")
		var tempUser models.User
		extractData(t, resp, &tempUser)

		// Now Delete
		_, delCode := logAndRequest(t, "Delete Temp User", "DELETE", fmt.Sprintf("/api/v1/users/%d", tempUser.ID), nil, authToken)
		require.Equal(t, http.StatusOK, delCode)
	})

	// ==========================================
	// 3. MENU CRUD (Category & Product)
	// ==========================================
	var categoryID uint
	var productID uint

	t.Run("3_Category_Create", func(t *testing.T) {
		payload := map[string]interface{}{
			"name":       "Içecekler",
			"icon":       "drink",
			"color":      "#FF0000",
			"sort_order": 1,
		}
		resp, code := logAndRequest(t, "Create Category", "POST", "/api/v1/categories", payload, authToken)
		require.Equal(t, http.StatusOK, code, "Expected 200/201")
		// Note from previous run: Returns 200

		var cat models.Category
		extractData(t, resp, &cat)
		categoryID = cat.ID
	})

	t.Run("3_Product_Create", func(t *testing.T) {
		payload := map[string]interface{}{
			"category_id": categoryID,
			"name":        "Ayran",
			"price":       1500,
			"description": "Yayık",
		}
		resp, code := logAndRequest(t, "Create Product", "POST", "/api/v1/products", payload, authToken)
		require.Equal(t, http.StatusOK, code)

		var prod models.Product
		extractData(t, resp, &prod)
		productID = prod.ID
	})

	t.Run("3_Product_Update", func(t *testing.T) {
		payload := map[string]interface{}{
			"category_id": categoryID,
			"name":        "Ayran Büyük",
			"price":       2000,
		}
		resp, code := logAndRequest(t, "Update Product Price/Name", "PUT", fmt.Sprintf("/api/v1/products/%d", productID), payload, authToken)
		require.Equal(t, http.StatusOK, code)

		var prod models.Product
		extractData(t, resp, &prod)
		assert.Equal(t, "Ayran Büyük", prod.Name)
		assert.Equal(t, int64(2000), prod.Price)
	})

	// ==========================================
	// 4. TABLE CRUD
	// ==========================================
	var tableID uint

	t.Run("4_Table_Create", func(t *testing.T) {
		payload := map[string]interface{}{
			"name": "Masa 1",
		}
		resp, code := logAndRequest(t, "Create Table", "POST", "/api/v1/tables", payload, authToken)
		require.True(t, code == http.StatusCreated || code == http.StatusOK, "Expected 201 or 200")

		var table models.Table
		extractData(t, resp, &table)
		tableID = table.ID
		assert.Equal(t, "available", table.Status)
	})

	// ==========================================
	// 5. ORDER OPERATION FLOW
	// ==========================================
	var orderID uint

	t.Run("5_Order_Create", func(t *testing.T) {
		payload := map[string]interface{}{
			"table_id":  tableID,
			"waiter_id": createdUserID,
		}
		resp, code := logAndRequest(t, "Open Order for Table", "POST", "/api/v1/orders", payload, authToken)
		require.True(t, code == http.StatusCreated || code == http.StatusOK, "Expected 201 or 200")

		var order models.Order
		extractData(t, resp, &order)
		orderID = order.ID
		assert.Equal(t, "OPEN", order.Status)
	})

	t.Run("5_Order_AddItem", func(t *testing.T) {
		payload := map[string]interface{}{
			"product_id": productID, // Ayran Büyük (2000)
			"quantity":   3,
		}
		_, code := logAndRequest(t, "Add Item to Order", "POST", fmt.Sprintf("/api/v1/orders/%d/items", orderID), payload, authToken)
		require.True(t, code == http.StatusCreated || code == http.StatusOK, "Expected 201 or 200")
	})

	t.Run("5_Order_UpdateItem", func(t *testing.T) {
		// Need to find Item ID first - not returned by AddItem cleanly in APIResponse payload sometimes?
		// Let's fetch order to find item ID
		// Note: AddItem response usually returns the created item.
		// Let's re-add and capture output or fetch order details.
		// Assuming we don't have GetOrderById readily for Waiter/Public?
		// We can use Database check for simplicity in E2E
		var item models.OrderItem
		database.DB.Where("order_id = ?", orderID).First(&item)

		payload := map[string]interface{}{
			"quantity": 5,
		}
		_, code := logAndRequest(t, "Update Item Quantity to 5", "PUT", fmt.Sprintf("/api/v1/orders/%d/items/%d", orderID, item.ID), payload, authToken)
		require.Equal(t, http.StatusOK, code)
	})

	t.Run("5_Order_Close", func(t *testing.T) {
		payload := map[string]interface{}{
			"payment_method": "CASH",
		}
		_, code := logAndRequest(t, "Close Order (Payment)", "POST", fmt.Sprintf("/api/v1/orders/%d/close", orderID), payload, authToken)
		require.Equal(t, http.StatusOK, code)

		// Verify
		var order models.Order
		database.DB.First(&order, orderID)
		assert.Equal(t, "COMPLETED", order.Status)
		// 5 items * 2000 = 10000
		assert.Equal(t, int64(10000), order.TotalAmount)
	})

	// ==========================================
	// 6. FINANCIALS (Expenses)
	// ==========================================
	t.Run("6_Expense_Create", func(t *testing.T) {
		payload := map[string]interface{}{
			"type":           "expense",
			"category":       "Market",
			"amount":         1500,
			"description":    "Temizlik Malzemesi",
			"payment_method": "CASH",
		}
		resp, code := logAndRequest(t, "Add Expense", "POST", "/api/v1/transactions/expense", payload, authToken)
		require.Equal(t, http.StatusOK, code) // or 201

		var tx models.Transaction
		extractData(t, resp, &tx)
		assert.Equal(t, int64(1500), tx.Amount)
	})

	// ==========================================
	// 7. CLOSING & REPORTS
	// ==========================================
	t.Run("7_Management_EndDay", func(t *testing.T) {
		payload := map[string]interface{}{
			"user_id": 1,
		}
		resp, code := logAndRequest(t, "End Work Day", "POST", "/api/v1/management/end-day", payload, authToken)
		require.Equal(t, http.StatusOK, code)

		// Verify response contains report
		// Check logs for output
		t.Logf("End Day Response: %s", string(resp))
	})

	t.Run("7_Analytics_ZReport", func(t *testing.T) {
		resp, code := logAndRequest(t, "Get Daily Z Report", "GET", "/api/v1/analytics/daily", nil, authToken)
		require.Equal(t, http.StatusOK, code)
		t.Logf("Z Report: %s", string(resp))
	})
}

// ----------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------

func extractData(t *testing.T, body []byte, target interface{}) {
	var apiResp utils.APIResponse
	err := json.Unmarshal(body, &apiResp)
	require.NoError(t, err, "Failed to unmarshal APIResponse")

	if !apiResp.Success {
		t.Fatalf("API Error: %s (%s)", apiResp.Message, apiResp.Code)
	}

	dataBytes, err := json.Marshal(apiResp.Data)
	require.NoError(t, err)
	err = json.Unmarshal(dataBytes, target)
	require.NoError(t, err)
}

// logAndRequest performs the request and logs details explicitly
func logAndRequest(t *testing.T, stepDesc, method, path string, payload interface{}, token string) ([]byte, int) {
	fmt.Printf("\n>>> [STEP] %s\n", stepDesc)
	fmt.Printf("    Request: %s %s\n", method, path)

	var body []byte
	var err error
	if payload != nil {
		body, err = json.MarshalIndent(payload, "", "  ") // Indent for readability
		require.NoError(t, err)
		fmt.Printf("    Payload:\n%s\n", string(body))
	} else {
		fmt.Println("    Payload: <nil>")
	}

	req, err := http.NewRequest(method, baseURL+path, bytes.NewBuffer(body))
	require.NoError(t, err)

	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	start := time.Now()
	client := &http.Client{}
	resp, err := client.Do(req)
	require.NoError(t, err)
	defer resp.Body.Close()
	duration := time.Since(start)

	respBody, err := io.ReadAll(resp.Body)
	require.NoError(t, err)

	fmt.Printf("    Response Status: %d (%v)\n", resp.StatusCode, duration)

	// Try to pretty print response body if JSON
	var prettyJSON bytes.Buffer
	if err := json.Indent(&prettyJSON, respBody, "", "  "); err == nil {
		fmt.Printf("    Response Body:\n%s\n", prettyJSON.String())
	} else {
		fmt.Printf("    Response Body (Raw): %s\n", string(respBody))
	}
	fmt.Println("----------------------------------------------------------------")

	return respBody, resp.StatusCode
}

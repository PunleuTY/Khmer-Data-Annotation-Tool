# Khmer Validate Tool Backend

This is the backend service for user management, built with Go, PostgreSQL, and GORM.

## Project Setup

### 1. Create PostgreSQL Database

* Open pgAdmin or your PostgreSQL client.

* Create a new database named `Khmer_Validate_Tool` (you can change the name, but update the config accordingly).

### 2. Configure Database Connection

* Open `/database/db.go`

* Update the `dsn` string with your PostgreSQL credentials and database name:

```go
dsn := "host=localhost user=postgres password=170905 dbname=Khmer_Validate_Tool port=5432 sslmode=disable"
```
Replace YOUR_PASSWORD with your PostgreSQL user password, and update Khmer_Validate_Tool if you chose a different database name.

### 3. User Table Structure
```table
| Column     | Type   | Description            |
|------------|--------|------------------------|
| FirstName  | string | User's first name      |
| LastName   | string | User's last name       |
| Email      | string | User's email (unique)  |
| Password   | string | Hashed user password   |
```
### 4. Install Project Dependencies
Run the following commands in your project root directory:

```bash
go mod init backend
go get gorm.io/gorm
go get gorm.io/driver/postgres
go get [github.com/gorilla/mux](https://github.com/gorilla/mux)
go get golang.org/x/crypto/bcrypt
go mod tidy
```
### 5. Running the Server
Start your Go server by running:
Run `go run server.go` to start the backend.
### 6. Test User Registration API
Send a POST request to http://localhost:8080/register with the following JSON body:
```json
{
  "first_name": "Pov",
  "last_name": "Yanghai",
  "email": "povyanghai@student.cadt.edu.kh",
  "password": "12345678",
  "confirm_password": "12345678"
}
```
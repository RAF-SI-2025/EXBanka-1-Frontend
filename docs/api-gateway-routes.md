# API Gateway Routes

Base URL: `http://localhost:8080`

---

## Authentication

Protected routes require a JWT access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Token validation is performed by the `AuthMiddleware`, which calls the Auth service via gRPC. On success, the middleware injects `user_id`, `email`, `role`, and `permissions` into the request context.

Some protected routes additionally require a specific **permission** string (enforced by `RequirePermission` middleware).

---

## Route Overview

| Method | Path | Protected | Required Permission |
|--------|------|-----------|---------------------|
| POST | `/api/auth/login` | No | — |
| POST | `/api/auth/refresh` | No | — |
| POST | `/api/auth/logout` | No | — |
| POST | `/api/auth/password/reset-request` | No | — |
| POST | `/api/auth/password/reset` | No | — |
| POST | `/api/auth/activate` | No | — |
| GET | `/api/employees` | Yes | `employees.read` |
| GET | `/api/employees/:id` | Yes | `employees.read` |
| POST | `/api/employees` | Yes | `employees.create` |
| PUT | `/api/employees/:id` | Yes | `employees.update` |

---

## Public Routes

### POST `/api/auth/login`

Authenticate a user and receive access and refresh tokens.

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | Yes | Must be a valid email |
| `password` | string | Yes | — |

**Response `200 OK`**

```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ..."
}
```

---

### POST `/api/auth/refresh`

Exchange a refresh token for a new access/refresh token pair.

**Request Body**

```json
{
  "refresh_token": "eyJ..."
}
```

| Field | Type | Required |
|-------|------|----------|
| `refresh_token` | string | Yes |

**Response `200 OK`**

```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ..."
}
```

---

### POST `/api/auth/logout`

Invalidate the current refresh token.

**Request Body**

```json
{
  "refresh_token": "eyJ..."
}
```

| Field | Type | Required |
|-------|------|----------|
| `refresh_token` | string | Yes |

**Response `200 OK`**

```json
{
  "message": "logged out successfully"
}
```

---

### POST `/api/auth/password/reset-request`

Send a password reset email if the given email exists in the system.

**Request Body**

```json
{
  "email": "user@example.com"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | Yes | Must be a valid email |

**Response `200 OK`**

```json
{
  "message": "if the email exists, a reset link has been sent"
}
```

---

### POST `/api/auth/password/reset`

Reset a user's password using a reset token.

**Request Body**

```json
{
  "token": "reset-token-string",
  "new_password": "newSecret123",
  "confirm_password": "newSecret123"
}
```

| Field | Type | Required |
|-------|------|----------|
| `token` | string | Yes |
| `new_password` | string | Yes |
| `confirm_password` | string | Yes |

**Response `200 OK`**

```json
{
  "message": "password reset successfully"
}
```

---

### POST `/api/auth/activate`

Activate a newly created employee account using an activation token.

**Request Body**

```json
{
  "token": "activation-token-string",
  "password": "myPassword123",
  "confirm_password": "myPassword123"
}
```

| Field | Type | Required |
|-------|------|----------|
| `token` | string | Yes |
| `password` | string | Yes |
| `confirm_password` | string | Yes |

**Response `200 OK`**

```json
{
  "message": "account activated successfully"
}
```

---

## Protected Routes

All routes below require `Authorization: Bearer <access_token>`.

---

### GET `/api/employees`

**Required permission:** `employees.read`

List employees with optional filters and pagination.

**Query Parameters**

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `email` | string | No | — |
| `name` | string | No | — |
| `position` | string | No | — |
| `page` | int | No | `1` |
| `page_size` | int | No | `20` |

**Response `200 OK`**

```json
{
  "employees": [
    {
      "id": 1,
      "first_name": "Jane",
      "last_name": "Doe",
      "date_of_birth": 946684800,
      "gender": "Female",
      "email": "jane.doe@example.com",
      "phone": "+38161000000",
      "address": "123 Main St",
      "username": "jane.doe",
      "position": "Teller",
      "department": "Retail",
      "active": true,
      "role": "Employee",
      "permissions": ["accounts.read", "transactions.create"]
    }
  ],
  "total_count": 42
}
```

---

### GET `/api/employees/:id`

**Required permission:** `employees.read`

Get a single employee by ID.

**URL Parameter**

| Parameter | Type | Required |
|-----------|------|----------|
| `id` | int64 | Yes |

**Response `200 OK`**

```json
{
  "id": 1,
  "first_name": "Jane",
  "last_name": "Doe",
  "date_of_birth": 946684800,
  "gender": "Female",
  "email": "jane.doe@example.com",
  "phone": "+38161000000",
  "address": "123 Main St",
  "username": "jane.doe",
  "position": "Teller",
  "department": "Retail",
  "active": true,
  "role": "Employee",
  "permissions": ["accounts.read", "transactions.create"]
}
```

---

### POST `/api/employees`

**Required permission:** `employees.create`

Create a new employee. After creation, an activation email is automatically sent to the provided email address.

**Request Body**

```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "date_of_birth": 946684800,
  "gender": "Female",
  "email": "jane.doe@example.com",
  "phone": "+38161000000",
  "address": "123 Main St",
  "username": "jane.doe",
  "position": "Teller",
  "department": "Retail",
  "role": "Employee",
  "active": true
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `first_name` | string | Yes | — |
| `last_name` | string | Yes | — |
| `date_of_birth` | int64 | Yes | Unix timestamp |
| `gender` | string | No | — |
| `email` | string | Yes | Must be a valid email |
| `phone` | string | No | — |
| `address` | string | No | — |
| `username` | string | Yes | — |
| `position` | string | No | — |
| `department` | string | No | — |
| `role` | string | Yes | — |
| `active` | bool | No | — |

**Response `200 OK`**

Same structure as GET `/api/employees/:id`.

---

### PUT `/api/employees/:id`

**Required permission:** `employees.update`

Partially update an existing employee. Cannot update employees with the `EmployeeAdmin` role.

**URL Parameter**

| Parameter | Type | Required |
|-----------|------|----------|
| `id` | int64 | Yes |

**Request Body** (all fields optional)

```json
{
  "last_name": "Smith",
  "gender": "Female",
  "phone": "+38161111111",
  "address": "456 New St",
  "position": "Senior Teller",
  "department": "Retail",
  "role": "Employee",
  "active": true
}
```

**Response `200 OK`**

Same structure as GET `/api/employees/:id`.

---

## Error Responses

| Status | Meaning |
|--------|---------|
| `400 Bad Request` | Invalid or missing request body/parameters |
| `401 Unauthorized` | Missing or invalid access token |
| `403 Forbidden` | Valid token but insufficient permissions |
| `404 Not Found` | Resource not found |
| `500 Internal Server Error` | Unexpected server error |

---

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `GATEWAY_HTTP_ADDR` | `:8080` | HTTP server address |
| `AUTH_GRPC_ADDR` | `localhost:50051` | Auth service gRPC address |
| `USER_GRPC_ADDR` | `localhost:50052` | User service gRPC address |

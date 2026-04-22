# Bill Bloom Backend - API Endpoints Guide

## Base URL
```
http://localhost:5000/api
```

## API Endpoints

### A. Authentication & Users

#### 1. Register User
```
POST /auth/register
Content-Type: application/json

{
  "username": "alice",
  "email": "alice@example.com",
  "password": "password123"
}
```
**Response (201):**
```json
{
  "_id": "60d5ec49c1234567890abcd0",
  "username": "alice",
  "email": "alice@example.com",
  "message": "User registered successfully"
}
```

#### 2. Login User
```
POST /auth/login
```
(Currently scaffold - ready for implementation)

---

### B. Group Management

#### 1. Create a Group
```
POST /groups
Content-Type: application/json

{
  "name": "DelhiTrip",
  "memberIds": ["60d5ec49c1234567890abcd1", "60d5ec49c1234567890abcd2"],
  "createdBy": "60d5ec49c1234567890abcd1"
}
```
**Requirements:**
- Group must have at least 2 members
- Name must be unique
- Valid MongoDB ObjectIDs required

**Response (201):**
```json
{
  "_id": "60d5ec49c1234567890abcd3",
  "name": "DelhiTrip",
  "members": [
    { "_id": "60d5ec49c1234567890abcd1", "username": "alice", "email": "alice@example.com" },
    { "_id": "60d5ec49c1234567890abcd2", "username": "bob", "email": "bob@example.com" }
  ],
  "createdBy": { "_id": "60d5ec49c1234567890abcd1", "username": "alice", "email": "alice@example.com" },
  "createdAt": "2024-04-22T10:30:00.000Z",
  "updatedAt": "2024-04-22T10:30:00.000Z"
}
```

#### 2. Get All Groups
```
GET /groups
```
**Response (200):** Array of all groups with populated members and creator

#### 3. Get Specific Group
```
GET /groups/:id
```
**Response (200):** Group details with populated members, creator, and expenses

#### 4. Update a Group
```
PUT /groups/:id
Content-Type: application/json

{
  "name": "ModifiedGroupName",
  "memberIds": ["60d5ec49c1234567890abcd1", "60d5ec49c1234567890abcd2", "60d5ec49c1234567890abcd4"]
}
```
**Note:** Creator details are NOT updated

#### 5. Delete a Group
```
DELETE /groups/:id
```
**Response (200):**
```json
{
  "message": "Group deleted successfully",
  "groupId": "60d5ec49c1234567890abcd3"
}
```

---

### C. Expense Tracking

#### 1. Add an Expense
```
POST /expenses
Content-Type: application/json

// Group Expense
{
  "amount": 1200,
  "description": "Grocery shopping",
  "category": "Grocery",
  "type": "group",
  "groupId": "60d5ec49c1234567890abcd3",
  "paidBy": "60d5ec49c1234567890abcd1",
  "participants": ["60d5ec49c1234567890abcd1", "60d5ec49c1234567890abcd2"],
  "date": "2025-12-18T00:00:00.000Z"
}

// Personal Expense
{
  "amount": 100,
  "description": "Snacks",
  "category": "Food",
  "type": "personal",
  "paidBy": "60d5ec49c1234567890abcd1",
  "date": "2025-12-18T00:00:00.000Z"
}
```
**Requirements:**
- For group expenses: minimum 2 participants
- Amount must be positive
- Valid category required
- Valid paidBy user ID

**Response (201):** Expense object with populated user details

#### 2. Get All Group Expenses
```
GET /expenses/group/:groupId
```
**Response (200):** Array of group expenses with paidBy and participants populated

#### 3. Get Personal Expenses by User
```
GET /expenses/personal/:userId
```
**Response (200):** Array of personal expenses paid by the user

#### 4. Delete an Expense
```
DELETE /expenses/:expenseId
```
**Response (200):**
```json
{
  "message": "Expense deleted successfully",
  "expenseId": "60d5ec49c1234567890abcd5"
}
```

---

### D. Recording Settlements

#### 1. Create a Settlement
```
POST /settlements
Content-Type: application/json

{
  "fromUser": "60d5ec49c1234567890abcd1",
  "toUser": "60d5ec49c1234567890abcd2",
  "amount": 450,
  "groupId": "60d5ec49c1234567890abcd3"
}
```
**Requirements:**
- fromUser ≠ toUser
- Amount must be positive
- Valid group ID

**Response (201):** Settlement object with populated user and group details

#### 2. Get Group Settlements
```
GET /settlements/group/:groupId
```
**Response (200):** Array of settlements for the group

#### 3. Get All Settlements
```
GET /settlements
```
**Response (200):** Array of all settlements

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Group must have at least 2 members"
}
```

### 404 Not Found
```json
{
  "message": "Group not found"
}
```

### 409 Conflict
```json
{
  "message": "Username already exists"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Validation Rules

### User Registration
- ✅ Username required and non-empty
- ✅ Valid email format required
- ✅ Password minimum 6 characters
- ✅ Username must be unique
- ✅ Email must be unique

### Group Creation
- ✅ Minimum 2 members required
- ✅ Unique group name
- ✅ Valid createdBy user ID
- ✅ Valid member IDs

### Expense Creation
- ✅ Amount must be positive
- ✅ Description required
- ✅ Category required
- ✅ Type must be 'group' or 'personal'
- ✅ For group: minimum 2 participants, groupId required
- ✅ Valid user IDs required

### Settlement Creation
- ✅ FromUser ≠ ToUser
- ✅ Amount must be positive
- ✅ Valid group ID
- ✅ Group must exist

---

## Testing the APIs

### Quick Postman Setup
1. Create collection "Bill Bloom"
2. Add requests for each endpoint
3. Use environment variables for base URL
4. Test validation with invalid data

### Example Test Sequence
1. Register 2-3 users
2. Create a group with registered users
3. Add group expenses
4. Add personal expenses
5. Create settlements
6. Retrieve all data
7. Update and delete as needed

---

**Status:** All CRUD operations implemented and tested ✅
**Server:** Running on http://localhost:5000 ✅

# Aiven PostgreSQL Database Setup Guide

SkillBridge AI uses **PostgreSQL** managed through **Prisma ORM**. This guide provides step-by-step instructions to create, configure, connect, and migrate your free cloud PostgreSQL database on **Aiven**.

---

## 1. Why Aiven PostgreSQL?
- Fully managed PostgreSQL cloud database.
- Turnkey SSL support (required for production).
- High availability with standard SQL compatibility.
- Zero budget friendly.

---

## 2. Step-by-Step Aiven Setup Instructions

### Step 1: Create an Aiven Account
1. Open your browser and navigate to [https://aiven.io](https://aiven.io).
2. Click **Start free trial** or **Sign up**.
3. Register using your Google, GitHub, or email account.
4. Verify your email address.

### Step 2: Create a PostgreSQL Service
1. In the Aiven Console, click **Create service** (or **+ Create Service**).
2. Select **PostgreSQL** as the service type.
3. Choose a cloud provider and region closest to your users (e.g., **AWS / Google Cloud** in `us-east-1` or `eu-west-1`).
4. Select the **Free plan** (or lowest tier plan available).
5. Enter a service name, e.g., `skillbridge-db`.
6. Click **Create service**.
7. Wait 2–3 minutes while Aiven provisions your database cluster (status will change to **Running**).

### Step 3: Obtain Connection String & Credentials
1. In your `skillbridge-db` service overview page, locate the **Connection information** panel.
2. Ensure the toggle is set to **Service URI**.
3. Click **Copy** to copy the full connection URI. It looks like:
   ```text
   postgres://avnadmin:YOUR_PASSWORD@your-service-name.aivencloud.com:12345/defaultdb?sslmode=require
   ```
4. **Important SSL parameter:** Ensure `?sslmode=require` is present at the end of the connection string. Prisma requires SSL when connecting to Aiven.

---

## 3. Configuring Local Development Environment

1. Open your `backend/.env` file (create one from `backend/.env.example` if it does not exist).
2. Set the `DATABASE_URL` variable:
   ```env
   DATABASE_URL="postgres://avnadmin:YOUR_COPIED_PASSWORD@your-service-name.aivencloud.com:12345/defaultdb?sslmode=require"
   ```
3. Save the file.

---

## 4. Running Database Migrations

Once your `DATABASE_URL` is configured, apply the database schema:

```bash
cd backend

# Option A: Apply the initial migration
npx prisma migrate deploy

# Option B: Or push the schema directly
npx prisma db push
```

You will see:
```text
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "defaultdb", schema "public"
1 migration applied: 20260330000000_init
```

---

## 5. Verifying Database Connectivity

### Check via Health Check Endpoint:
Start your backend server:
```bash
cd backend
npm run dev
```
Open [http://localhost:5000/api/health](http://localhost:5000/api/health) in your browser. You will see:
```json
{
  "success": true,
  "message": "SkillBridge AI API is healthy",
  "data": {
    "status": "UP",
    "services": {
      "database": {
        "connected": true,
        "message": "Connected to PostgreSQL successfully."
      }
    }
  }
}
```

### Inspect Data with Prisma Studio:
To view and manage your tables visually in your browser:
```bash
cd backend
npx prisma studio
```
Prisma Studio opens at `http://localhost:5555`.

---

## 6. Configuring `DATABASE_URL` in Production (Render)

When deploying your backend to Render:
1. Go to your Render Dashboard.
2. Open your backend web service.
3. Click **Environment** in the left menu.
4. Click **Add Environment Variable**.
5. Set:
   - **Key:** `DATABASE_URL`
   - **Value:** `postgres://avnadmin:YOUR_PASSWORD@your-service-name.aivencloud.com:12345/defaultdb?sslmode=require`
6. Click **Save Changes**. Render will automatically redeploy and connect to Aiven.

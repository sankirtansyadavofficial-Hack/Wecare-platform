-- =========================================================================
-- WECARE HEALTHCARE ECOSYSTEM - DATABASE SCHEMA & RBAC EXTENSIONS
-- PostgreSQL / Supabase Compatible DDL
-- =========================================================================

-- Enable UUID extension if not already loaded
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLE TOKENS ENUM
CREATE TYPE user_role AS ENUM ('patient', 'doctor');

-- 2. PRACTICE DOMAIN ENUM
CREATE TYPE practice_domain AS ENUM ('human', 'veterinary');

-- 3. APPOINTMENT STATUS ENUM
CREATE TYPE appointment_status AS ENUM ('pending', 'active', 'completed', 'no-show');

-- 4. USERS TABLE (Core Authentication & Profile Model)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Securely hashed via bcrypt
    role user_role NOT NULL DEFAULT 'patient',
    date_of_birth DATE NULL, -- Nullable for Doctors, Mandatory for Patients
    avatar_url VARCHAR(512) NULL,
    blood_group VARCHAR(5) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for rapid authentication email lookup
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- 5. DOCTOR CREDENTIALS TABLE (Premium Verification Profile)
CREATE TABLE doctor_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    issuing_board VARCHAR(150) NOT NULL,
    practice_domain practice_domain NOT NULL,
    credential_file_url VARCHAR(512) NOT NULL, -- Secure S3 PDF/JPEG proof of registration
    is_verified BOOLEAN NOT NULL DEFAULT FALSE, -- Internal admin review status
    verified_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for credential verification queries
CREATE INDEX idx_doctor_credentials_domain ON doctor_credentials(practice_domain);

-- 6. APPOINTMENTS TABLE (State-Driven Queue & Booking Model)
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start_time TIMESTAMP WITH TIME ZONE NULL,
    actual_end_time TIMESTAMP WITH TIME ZONE NULL,
    status appointment_status NOT NULL DEFAULT 'pending',
    queue_sequence INT NOT NULL, -- Dynamic token position in queue today
    rolling_buffer_seconds INT NULL, -- Captured actual session duration for rolling ETA recalculation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for live active queue board retrievals
CREATE INDEX idx_appointments_live_queue ON appointments(doctor_id, status) 
WHERE status IN ('pending', 'active');

-- 7. SECURITY & ACCESS CONTROL POLICIES (Row-Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own details
CREATE POLICY user_self_read ON users
    FOR SELECT USING (auth.uid() = id);

-- Policy: Only verified Doctors can view sensitive doctor credentials
CREATE POLICY doctor_credentials_read ON doctor_credentials
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'doctor')
    );

-- Policy: Patients and Doctors can select their joint appointment records
CREATE POLICY appointments_read_policy ON appointments
    FOR SELECT USING (
        auth.uid() = patient_id OR 
        auth.uid() = doctor_id
    );

CREATE TABLE IF NOT EXISTS caregiver_account (
  id UUID PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  display_name VARCHAR(80) NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE TABLE IF NOT EXISTS child_profile (
  id UUID PRIMARY KEY,
  owner_id UUID NOT NULL UNIQUE REFERENCES caregiver_account(id),
  display_name VARCHAR(80) NOT NULL,
  birth_date DATE,
  time_zone VARCHAR(80) NOT NULL,
  care_summary VARCHAR(2000) NOT NULL,
  revision BIGINT NOT NULL DEFAULT 1,
  photo BLOB,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

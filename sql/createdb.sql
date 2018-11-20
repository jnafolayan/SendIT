CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  ref_id UUID UNIQUE DEFAULT gen_random_uuid(),
  firstname VARCHAR (100) NOT NULL,
  lastname VARCHAR (100) NOT NULL,
  othernames VARCHAR (355) NOT NULL,
  email VARCHAR (355) NOT NULL,
  username VARCHAR (100) NOT NULL,
  password VARCHAR (100) NOT NULL,
  registered DATE DEFAULT CURRENT_DATE,
  is_admin BOOLEAN DEFAULT FALSE
);

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE parcels (
  id SERIAL PRIMARY KEY,
  placed_by UUID REFERENCES users (ref_id) ON DELETE CASCADE,
  weight REAL NOT NULL,
  weightmetric VARCHAR (5) NOT NULL,
  sent_on DATE DEFAULT CURRENT_DATE,
  delivered_on DATE,
  status VARCHAR (20) NOT NULL,
  from_loc VARCHAR (355) NOT NULL,
  to_loc VARCHAR (355) NOT NULL,
  current_loc VARCHAR (355) NOT NULL
);

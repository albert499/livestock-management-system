const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS farmers (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      phone       TEXT UNIQUE NOT NULL,
      location    TEXT NOT NULL,
      region      TEXT NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS livestock (
      id           TEXT PRIMARY KEY,
      farmer_id    TEXT NOT NULL,
      species      TEXT NOT NULL CHECK(species IN ('cattle','goat','sheep','camel','donkey','pig','poultry')),
      breed        TEXT,
      age_months   INTEGER NOT NULL,
      weight_kg    REAL,
      price_ghs    REAL NOT NULL,
      quantity     INTEGER NOT NULL DEFAULT 1,
      description  TEXT,
      location     TEXT NOT NULL,
      region       TEXT NOT NULL,
      status       TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available','sold','reserved')),
      image_url    TEXT,
      created_at   TIMESTAMPTZ DEFAULT NOW(),
      FOREIGN KEY (farmer_id) REFERENCES farmers(id)
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id           TEXT PRIMARY KEY,
      livestock_id TEXT NOT NULL,
      buyer_name   TEXT NOT NULL,
      buyer_phone  TEXT NOT NULL,
      message      TEXT,
      status       TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','responded','closed')),
      created_at   TIMESTAMPTZ DEFAULT NOW(),
      FOREIGN KEY (livestock_id) REFERENCES livestock(id)
    );

    CREATE TABLE IF NOT EXISTS market_prices (
      id          TEXT PRIMARY KEY,
      species     TEXT NOT NULL,
      region      TEXT NOT NULL,
      avg_price   REAL NOT NULL,
      recorded_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS health_records (
      id            TEXT PRIMARY KEY,
      livestock_id  TEXT NOT NULL,
      record_date   TEXT NOT NULL,
      condition     TEXT NOT NULL CHECK(condition IN ('healthy','sick','recovering','deceased')),
      treatment     TEXT,
      veterinarian  TEXT,
      notes         TEXT,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      FOREIGN KEY (livestock_id) REFERENCES livestock(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS productivity_records (
      id              TEXT PRIMARY KEY,
      livestock_id    TEXT NOT NULL,
      record_date     TEXT NOT NULL,
      weight_kg       REAL,
      milk_yield_l    REAL,
      offspring_count INTEGER DEFAULT 0,
      notes           TEXT,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      FOREIGN KEY (livestock_id) REFERENCES livestock(id) ON DELETE CASCADE
    );
  `);

  // Seed only if empty
  const { rows } = await pool.query('SELECT COUNT(*) as c FROM farmers');
  if (parseInt(rows[0].c) === 0) {
    const f1 = uuidv4(), f2 = uuidv4(), f3 = uuidv4();

    await pool.query('INSERT INTO farmers (id, name, phone, location, region) VALUES ($1,$2,$3,$4,$5)', [f1, 'Kofi Mensah', '0244123456', 'Tamale', 'Northern']);
    await pool.query('INSERT INTO farmers (id, name, phone, location, region) VALUES ($1,$2,$3,$4,$5)', [f2, 'Amina Issah', '0557891234', 'Bolgatanga', 'Upper East']);
    await pool.query('INSERT INTO farmers (id, name, phone, location, region) VALUES ($1,$2,$3,$4,$5)', [f3, 'Yaw Boateng', '0201456789', 'Kumasi', 'Ashanti']);

    const l1=uuidv4(),l2=uuidv4(),l3=uuidv4(),l4=uuidv4(),l5=uuidv4(),l6=uuidv4();
    await pool.query('INSERT INTO livestock (id,farmer_id,species,breed,age_months,weight_kg,price_ghs,quantity,description,location,region) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
      [l1,f1,'cattle','West African Shorthorn',36,280,4500,2,'Healthy bulls, vaccinated','Tamale','Northern']);
    await pool.query('INSERT INTO livestock (id,farmer_id,species,breed,age_months,weight_kg,price_ghs,quantity,description,location,region) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
      [l2,f1,'goat','Savannah Brown',18,35,650,5,'Female goats, good milk production','Tamale','Northern']);
    await pool.query('INSERT INTO livestock (id,farmer_id,species,breed,age_months,weight_kg,price_ghs,quantity,description,location,region) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
      [l3,f2,'sheep','Djallonke',24,40,800,3,'Ram sheep, ready for sale','Bolgatanga','Upper East']);
    await pool.query('INSERT INTO livestock (id,farmer_id,species,breed,age_months,weight_kg,price_ghs,quantity,description,location,region) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
      [l4,f2,'cattle','Zebu',48,350,6200,1,'Prize bull, excellent condition','Bolgatanga','Upper East']);
    await pool.query('INSERT INTO livestock (id,farmer_id,species,breed,age_months,weight_kg,price_ghs,quantity,description,location,region) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
      [l5,f3,'poultry','Local Breed',6,2.5,85,20,'Free-range chickens','Kumasi','Ashanti']);
    await pool.query('INSERT INTO livestock (id,farmer_id,species,breed,age_months,weight_kg,price_ghs,quantity,description,location,region) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
      [l6,f3,'goat','West African Dwarf',12,22,420,8,'Young goats for fattening','Kumasi','Ashanti']);

    await pool.query('INSERT INTO market_prices (id,species,region,avg_price) VALUES ($1,$2,$3,$4)', [uuidv4(),'cattle','Northern',4800]);
    await pool.query('INSERT INTO market_prices (id,species,region,avg_price) VALUES ($1,$2,$3,$4)', [uuidv4(),'cattle','Upper East',5200]);
    await pool.query('INSERT INTO market_prices (id,species,region,avg_price) VALUES ($1,$2,$3,$4)', [uuidv4(),'goat','Northern',620]);
    await pool.query('INSERT INTO market_prices (id,species,region,avg_price) VALUES ($1,$2,$3,$4)', [uuidv4(),'sheep','Upper East',750]);
    await pool.query('INSERT INTO market_prices (id,species,region,avg_price) VALUES ($1,$2,$3,$4)', [uuidv4(),'poultry','Ashanti',90]);

    await pool.query('INSERT INTO health_records (id,livestock_id,record_date,condition,treatment,veterinarian,notes) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [uuidv4(),l1,'2026-05-10','healthy','FMD Vaccine','Dr. Anane','Annual vaccination completed']);
    await pool.query('INSERT INTO health_records (id,livestock_id,record_date,condition,treatment,veterinarian,notes) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [uuidv4(),l1,'2026-06-01','healthy','Deworming','Dr. Anane','Routine deworming, all clear']);
    await pool.query('INSERT INTO health_records (id,livestock_id,record_date,condition,treatment,veterinarian,notes) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [uuidv4(),l2,'2026-05-20','sick','Antibiotics 3-day','Dr. Issah','Respiratory infection, responding to treatment']);
    await pool.query('INSERT INTO health_records (id,livestock_id,record_date,condition,treatment,veterinarian,notes) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [uuidv4(),l2,'2026-06-05','recovering','Continued monitoring','Dr. Issah','Improving, appetite restored']);

    await pool.query('INSERT INTO productivity_records (id,livestock_id,record_date,weight_kg,milk_yield_l,offspring_count,notes) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [uuidv4(),l1,'2026-04-01',265,null,0,'Weight check — on track']);
    await pool.query('INSERT INTO productivity_records (id,livestock_id,record_date,weight_kg,milk_yield_l,offspring_count,notes) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [uuidv4(),l1,'2026-05-01',273,null,0,'Good growth rate']);
    await pool.query('INSERT INTO productivity_records (id,livestock_id,record_date,weight_kg,milk_yield_l,offspring_count,notes) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [uuidv4(),l2,'2026-05-01',33,1.2,0,'Milk yield stable']);
    await pool.query('INSERT INTO productivity_records (id,livestock_id,record_date,weight_kg,milk_yield_l,offspring_count,notes) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [uuidv4(),l2,'2026-06-01',35,1.4,1,'Offspring born — healthy female kid']);
  }

  return pool;
}

module.exports = { pool, initDB };

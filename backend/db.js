const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const DB_PATH = path.join(__dirname, 'livestock.db');

function initDB() {
  const db = new Database(DB_PATH);

  // Enable foreign keys
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS farmers (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      phone       TEXT UNIQUE NOT NULL,
      location    TEXT NOT NULL,
      region      TEXT NOT NULL,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
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
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES farmers(id)
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id           TEXT PRIMARY KEY,
      livestock_id TEXT NOT NULL,
      buyer_name   TEXT NOT NULL,
      buyer_phone  TEXT NOT NULL,
      message      TEXT,
      status       TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','responded','closed')),
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (livestock_id) REFERENCES livestock(id)
    );

    CREATE TABLE IF NOT EXISTS market_prices (
      id          TEXT PRIMARY KEY,
      species     TEXT NOT NULL,
      region      TEXT NOT NULL,
      avg_price   REAL NOT NULL,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed demo data only if empty
  const farmerCount = db.prepare('SELECT COUNT(*) as c FROM farmers').get().c;
  if (farmerCount === 0) {
    const insertFarmer    = db.prepare('INSERT INTO farmers (id, name, phone, location, region) VALUES (?, ?, ?, ?, ?)');
    const insertLivestock = db.prepare('INSERT INTO livestock (id, farmer_id, species, breed, age_months, weight_kg, price_ghs, quantity, description, location, region) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const insertPrice     = db.prepare('INSERT INTO market_prices (id, species, region, avg_price) VALUES (?, ?, ?, ?)');

    const f1 = uuidv4(), f2 = uuidv4(), f3 = uuidv4();

    insertFarmer.run(f1, 'Kofi Mensah',  '0244123456', 'Tamale',     'Northern');
    insertFarmer.run(f2, 'Amina Issah',  '0557891234', 'Bolgatanga', 'Upper East');
    insertFarmer.run(f3, 'Yaw Boateng',  '0201456789', 'Kumasi',     'Ashanti');

    insertLivestock.run(uuidv4(), f1, 'cattle',  'West African Shorthorn', 36, 280,  4500, 2,  'Healthy bulls, vaccinated, good for farming or sale', 'Tamale',     'Northern');
    insertLivestock.run(uuidv4(), f1, 'goat',    'Savannah Brown',         18,  35,   650, 5,  'Female goats, good milk production',                  'Tamale',     'Northern');
    insertLivestock.run(uuidv4(), f2, 'sheep',   'Djallonke',              24,  40,   800, 3,  'Ram sheep, ready for sale',                           'Bolgatanga', 'Upper East');
    insertLivestock.run(uuidv4(), f2, 'cattle',  'Zebu',                   48, 350,  6200, 1,  'Prize bull, excellent condition',                     'Bolgatanga', 'Upper East');
    insertLivestock.run(uuidv4(), f3, 'poultry', 'Local Breed',             6,  2.5,   85, 20, 'Free-range chickens',                                 'Kumasi',     'Ashanti');
    insertLivestock.run(uuidv4(), f3, 'goat',    'West African Dwarf',     12,  22,   420, 8,  'Young goats for fattening',                           'Kumasi',     'Ashanti');

    insertPrice.run(uuidv4(), 'cattle',  'Northern',   4800);
    insertPrice.run(uuidv4(), 'cattle',  'Upper East', 5200);
    insertPrice.run(uuidv4(), 'goat',    'Northern',    620);
    insertPrice.run(uuidv4(), 'sheep',   'Upper East',  750);
    insertPrice.run(uuidv4(), 'poultry', 'Ashanti',      90);
  }

  return db;
}

module.exports = { initDB, DB_PATH };

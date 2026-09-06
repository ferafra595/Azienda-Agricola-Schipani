CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  price REAL NOT NULL DEFAULT 0,
  description TEXT DEFAULT '',
  image_url TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);
INSERT OR IGNORE INTO settings(key,value) VALUES ('whatsapp','');
INSERT INTO products(name,size,price,description,active,sort_order) SELECT 'Olio EVO 250 ml','250 ml',6.00,'Il formato più piccolo, ideale per assaggiare il nostro olio o per un regalo.',1,1 WHERE NOT EXISTS(SELECT 1 FROM products);
INSERT INTO products(name,size,price,description,active,sort_order) SELECT 'Olio EVO 500 ml','500 ml',10.00,'Un formato versatile per la tavola di ogni giorno.',1,2 WHERE (SELECT COUNT(*) FROM products)=1;
INSERT INTO products(name,size,price,description,active,sort_order) SELECT 'Olio EVO 750 ml','750 ml',14.00,'Più olio, la stessa origine: Mesoraca.',1,3 WHERE (SELECT COUNT(*) FROM products)=2;
INSERT INTO products(name,size,price,description,active,sort_order) SELECT 'Olio EVO 3 L','3 L',48.00,'Formato famiglia pensato per chi usa il nostro olio ogni giorno.',1,4 WHERE (SELECT COUNT(*) FROM products)=3;
INSERT INTO products(name,size,price,description,active,sort_order) SELECT 'Olio EVO 5 L','5 L',75.00,'Il formato più grande per avere sempre a disposizione il nostro olio.',1,5 WHERE (SELECT COUNT(*) FROM products)=4;

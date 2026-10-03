import { Database } from "bun:sqlite";
import path from "path";
import fs from "fs";

const dbDir = path.resolve(__dirname, "../../data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "cardapio.db");
export const db = new Database(dbPath, { create: true });

db.run("PRAGMA foreign_keys = ON;");
db.run("PRAGMA journal_mode = WAL;");

export function initDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      sortOrder INTEGER DEFAULT 0
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      categoryId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      isAvailable INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS product_options (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      maxQuantity INTEGER DEFAULT 1,
      FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      orderNumber INTEGER NOT NULL,
      customerName TEXT NOT NULL,
      customerPhone TEXT NOT NULL,
      deliveryType TEXT NOT NULL DEFAULT 'DELIVERY',
      address TEXT,
      paymentMethod TEXT NOT NULL DEFAULT 'PIX',
      changeFor REAL,
      subtotal REAL NOT NULL,
      deliveryFee REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'NEW',
      pixCopiaECola TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      productId TEXT,
      productName TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unitPrice REAL NOT NULL,
      optionsTotal REAL NOT NULL DEFAULT 0,
      selectedOptions TEXT,
      notes TEXT,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Configurações padrão da Loja
  const defaultSettings: Record<string, string> = {
    store_name: "Roviro Burger & Pizza",
    store_phone: "5511986531134",
    store_address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
    delivery_fee: "7.00",
    min_order: "25.00",
    opening_hours: "18:00 às 23:30 (Terça a Domingo)",
    is_open: "1",
    pix_key: "roviro221@gmail.com",
    pix_key_type: "EMAIL",
    evolution_api_url: "https://api.roviro.com.br",
    evolution_api_key: "",
    evolution_instance: "default"
  };

  const getSetting = db.prepare("SELECT key FROM store_settings WHERE key = ?");
  const setSetting = db.prepare("INSERT INTO store_settings (key, value) VALUES (?, ?)");

  for (const [key, value] of Object.entries(defaultSettings)) {
    if (!getSetting.get(key)) {
      setSetting.run(key, value);
    }
  }

  // Seed de Categorias e Produtos se a tabela estiver vazia
  const countCategories = (db.prepare("SELECT COUNT(*) as count FROM categories").get() as any).count;
  if (countCategories === 0) {
    seedInitialMenu();
  }

  console.log("Banco de dados SQLite inicializado em:", dbPath);
}

function seedInitialMenu() {
  console.log("Populando cardápio inicial...");

  const insertCat = db.prepare("INSERT INTO categories (id, name, icon, sortOrder) VALUES (?, ?, ?, ?)");
  const insertProd = db.prepare(`
    INSERT INTO products (id, categoryId, name, description, price, image, isAvailable, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?)
  `);
  const insertOpt = db.prepare("INSERT INTO product_options (id, productId, name, price, maxQuantity) VALUES (?, ?, ?, ?, ?)");

  const now = new Date().toISOString();

  // Categorias
  insertCat.run("cat_burgers", "Hambúrgueres Smash", "🍔", 1);
  insertCat.run("cat_pizzas", "Pizzas Artesanais", "🍕", 2);
  insertCat.run("cat_portions", "Acompanhamentos", "🍟", 3);
  insertCat.run("cat_drinks", "Bebidas Geladas", "🥤", 4);
  insertCat.run("cat_desserts", "Sobremesas", "🍰", 5);

  // Produtos: Hambúrgueres
  insertProd.run(
    "prod_smash_duplo", "cat_burgers", 
    "Smash Burger Duplo Cheddar", 
    "2x burgers de 90g smashados com crostinha crocante, queijo cheddar inglês derretido, cebola caramelizada e maionese artesanal da casa no pão brioche amanteigado.", 
    34.90, 
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80", 
    now
  );
  insertOpt.run("opt_bacon_1", "prod_smash_duplo", "Extra Bacon Crocante", 5.00, 2);
  insertOpt.run("opt_queijo_1", "prod_smash_duplo", "Queijo Cheddar Extra", 4.00, 2);
  insertOpt.run("opt_cebola_1", "prod_smash_duplo", "Sem Cebola Caramelizada", 0.00, 1);

  insertProd.run(
    "prod_bacon_crispy", "cat_burgers", 
    "Roviro Bacon Crispy", 
    "Burger 160g de Angus, queijo prato duplo, tiras generosas de bacon defumado na lenha de macieira, geleia de pimenta e barbecue artesanal.", 
    38.90, 
    "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=600&q=80", 
    now
  );
  insertOpt.run("opt_bacon_2", "prod_bacon_crispy", "Picles Artesanal Extra", 3.00, 1);
  insertOpt.run("opt_bacon_3", "prod_bacon_crispy", "Ponto: Bem Passado", 0.00, 1);
  insertOpt.run("opt_bacon_4", "prod_bacon_crispy", "Ponto: Ao Ponto / Rosado", 0.00, 1);

  // Produtos: Pizzas
  insertProd.run(
    "prod_pizza_margherita", "cat_pizzas",
    "Pizza Margherita Especial",
    "Molho de tomate pelati italiano, mozzarella fior di latte, rodelas de tomate cereja confitado, manjericão fresco e azeite extravirgem (8 fatias).",
    54.90,
    "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80",
    now
  );
  insertOpt.run("opt_borda_1", "prod_pizza_margherita", "Borda Recheada Catupiry", 9.00, 1);
  insertOpt.run("opt_borda_2", "prod_pizza_margherita", "Borda Recheada Cheddar", 9.00, 1);

  // Produtos: Acompanhamentos
  insertProd.run(
    "prod_batata_rustica", "cat_portions",
    "Batata Frita Rústica com Alecrim",
    "Porção generosa de batatas crocantes temperadas com sal marinho, alecrim fresco e alho confit. Acompanha maionese da casa.",
    22.90,
    "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
    now
  );
  insertOpt.run("opt_molho_1", "prod_batata_rustica", "Molho Cheddar Cremoso Extra", 6.00, 1);

  // Produtos: Bebidas
  insertProd.run(
    "prod_coca_cola", "cat_drinks",
    "Coca-Cola Lata 350ml",
    "Refrigerante gelado.",
    7.00,
    "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80",
    now
  );

  insertProd.run(
    "prod_suco_natural", "cat_drinks",
    "Suco de Laranja Natural 500ml",
    "Suco 100% natural espremido na hora sem adição de açúcar.",
    11.90,
    "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80",
    now
  );

  console.log("Cardápio inicial cadastrado com sucesso!");
}

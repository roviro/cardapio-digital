import { Request, Response } from "express";
import { db } from "../db/database";
import { storeService } from "../services/storeService";

export const menuController = {
  getPublicMenu(req: Request, res: Response) {
    try {
      const storeSettings = storeService.getAll();
      const categories = db.prepare("SELECT * FROM categories ORDER BY sortOrder ASC").all() as any[];

      const products = db.prepare(`
        SELECT * FROM products WHERE isAvailable = 1 ORDER BY name ASC
      `).all() as any[];

      const options = db.prepare("SELECT * FROM product_options").all() as any[];

      // Agrupa options por produto
      const optionsByProduct: Record<string, any[]> = {};
      for (const opt of options) {
        if (!optionsByProduct[opt.productId]) optionsByProduct[opt.productId] = [];
        optionsByProduct[opt.productId].push(opt);
      }

      // Agrupa produtos por categoria
      const categoriesWithProducts = categories.map((cat) => ({
        ...cat,
        products: products
          .filter((p) => p.categoryId === cat.id)
          .map((p) => ({
            ...p,
            options: optionsByProduct[p.id] || []
          }))
      }));

      return res.json({
        store: storeSettings,
        categories: categoriesWithProducts
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  getAllProductsAdmin(req: Request, res: Response) {
    try {
      const products = db.prepare(`
        SELECT p.*, c.name as categoryName 
        FROM products p
        JOIN categories c ON p.categoryId = c.id
        ORDER BY c.sortOrder ASC, p.name ASC
      `).all() as any[];

      const options = db.prepare("SELECT * FROM product_options").all() as any[];
      const optionsByProduct: Record<string, any[]> = {};
      for (const opt of options) {
        if (!optionsByProduct[opt.productId]) optionsByProduct[opt.productId] = [];
        optionsByProduct[opt.productId].push(opt);
      }

      const result = products.map((p) => ({
        ...p,
        options: optionsByProduct[p.id] || []
      }));

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  createProduct(req: Request, res: Response) {
    try {
      const { categoryId, name, description, price, image, options } = req.body;
      if (!categoryId || !name || price === undefined) {
        return res.status(400).json({ error: "Categoria, nome e preço são obrigatórios." });
      }

      const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO products (id, categoryId, name, description, price, image, isAvailable, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?)
      `).run(id, categoryId, name, description || null, Number(price), image || null, now);

      if (Array.isArray(options) && options.length > 0) {
        const insertOpt = db.prepare(`
          INSERT INTO product_options (id, productId, name, price, maxQuantity)
          VALUES (?, ?, ?, ?, ?)
        `);
        for (const opt of options) {
          const optId = `opt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          insertOpt.run(optId, id, opt.name, Number(opt.price || 0), opt.maxQuantity || 1);
        }
      }

      return res.status(201).json({ success: true, id });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  toggleAvailability(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const current = db.prepare("SELECT isAvailable FROM products WHERE id = ?").get(id) as any;
      if (!current) return res.status(404).json({ error: "Produto não encontrado." });

      const nextState = current.isAvailable === 1 ? 0 : 1;
      db.prepare("UPDATE products SET isAvailable = ? WHERE id = ?").run(nextState, id);

      return res.json({ success: true, isAvailable: nextState });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      db.prepare("DELETE FROM products WHERE id = ?").run(id);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  getCategories(req: Request, res: Response) {
    try {
      const categories = db.prepare("SELECT * FROM categories ORDER BY sortOrder ASC").all();
      return res.json(categories);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
};

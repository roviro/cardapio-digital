import { Request, Response } from "express";
import { db } from "../db/database";
import { storeService } from "../services/storeService";
import { pixService } from "../services/pixService";
import { whatsappService } from "../services/whatsappService";

export const orderController = {
  createOrder(req: Request, res: Response) {
    try {
      const {
        customerName,
        customerPhone,
        deliveryType,
        address,
        paymentMethod,
        changeFor,
        notes,
        items
      } = req.body;

      if (!customerName || !customerPhone || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Nome, telefone e itens do pedido são obrigatórios." });
      }

      // Calcula valores
      let subtotal = 0;
      for (const item of items) {
        let itemTotal = Number(item.unitPrice) * Number(item.quantity);
        if (Array.isArray(item.selectedOptions)) {
          const optsSum = item.selectedOptions.reduce((acc: number, o: any) => acc + Number(o.price || 0), 0);
          itemTotal += optsSum * Number(item.quantity);
        }
        subtotal += itemTotal;
      }

      const defaultFee = parseFloat(storeService.get("delivery_fee", "7.00"));
      const deliveryFee = deliveryType === "DELIVERY" ? defaultFee : 0;
      const total = subtotal + deliveryFee;

      // Gera número sequencial de pedido
      const lastOrder = db.prepare("SELECT MAX(orderNumber) as maxNum FROM orders").get() as any;
      const orderNumber = (lastOrder?.maxNum || 100) + 1;

      // Gera PIX Copia e Cola se for pagamento PIX
      let pixCopiaECola = null;
      let pixQrCode = null;
      if (paymentMethod === "PIX") {
        const pixData = pixService.generatePixCopiaECola(total, orderNumber);
        pixCopiaECola = pixData.copiaECola;
        pixQrCode = pixData.qrCode;
      }

      const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();

      // Salva Pedido
      db.prepare(`
        INSERT INTO orders (
          id, orderNumber, customerName, customerPhone, deliveryType, 
          address, paymentMethod, changeFor, subtotal, deliveryFee, 
          total, status, pixCopiaECola, notes, createdAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW', ?, ?, ?)
      `).run(
        orderId,
        orderNumber,
        customerName,
        customerPhone,
        deliveryType || "DELIVERY",
        address || null,
        paymentMethod || "PIX",
        changeFor ? Number(changeFor) : null,
        subtotal,
        deliveryFee,
        total,
        pixCopiaECola,
        notes || null,
        now
      );

      // Salva Itens
      const insertItem = db.prepare(`
        INSERT INTO order_items (
          id, orderId, productId, productName, quantity, unitPrice, optionsTotal, selectedOptions, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const it of items) {
        const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const optsTotal = Array.isArray(it.selectedOptions)
          ? it.selectedOptions.reduce((acc: number, o: any) => acc + Number(o.price || 0), 0)
          : 0;

        insertItem.run(
          itemId,
          orderId,
          it.productId || null,
          it.productName,
          Number(it.quantity),
          Number(it.unitPrice),
          optsTotal,
          it.selectedOptions ? JSON.stringify(it.selectedOptions) : null,
          it.notes || null
        );
      }

      const createdOrder = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as any;
      const orderItems = db.prepare("SELECT * FROM order_items WHERE orderId = ?").all(orderId);

      // Formata texto para WhatsApp
      const whatsappFormattedText = whatsappService.formatOrderForStore(createdOrder, orderItems);
      const storePhone = storeService.get("store_phone", "5511986531134");

      // Dispara notificação para a loja via Evolution API (se configurada)
      whatsappService.sendMessage(storePhone, whatsappFormattedText);

      return res.status(201).json({
        order: {
          ...createdOrder,
          items: orderItems,
          pixQrCode
        },
        whatsappFormattedText,
        storePhone
      });
    } catch (err: any) {
      console.error("[Order Controller] Erro ao criar pedido:", err);
      return res.status(500).json({ error: err.message });
    }
  },

  getAllOrders(req: Request, res: Response) {
    try {
      const { status } = req.query;

      let query = "SELECT * FROM orders";
      const params: any[] = [];

      if (status && status !== "ALL") {
        query += " WHERE status = ?";
        params.push(status);
      }

      query += " ORDER BY createdAt DESC";

      const orders = db.prepare(query).all(...params) as any[];
      const getItems = db.prepare("SELECT * FROM order_items WHERE orderId = ?");

      const ordersWithItems = orders.map((o) => ({
        ...o,
        items: getItems.all(o.id)
      }));

      return res.json(ordersWithItems);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, notifyCustomer } = req.body;

      const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as any;
      if (!order) return res.status(404).json({ error: "Pedido não encontrado." });

      db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);

      // Notifica cliente via WhatsApp se habilitado
      if (notifyCustomer && order.customerPhone) {
        const msg = whatsappService.formatStatusNotification(order, status);
        if (msg) {
          whatsappService.sendMessage(order.customerPhone, msg);
        }
      }

      return res.json({ success: true, status });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
};

import axios from "axios";
import { storeService } from "./storeService";

export const whatsappService = {
  formatPhone(phone: string): string {
    let clean = phone.replace(/\D/g, "");
    if (clean.length === 10 || clean.length === 11) {
      clean = "55" + clean;
    }
    return clean;
  },

  async sendMessage(phone: string, text: string): Promise<boolean> {
    const baseUrl = storeService.get("evolution_api_url", "https://api.roviro.com.br").replace(/\/+$/, "");
    const apiKey = storeService.get("evolution_api_key", "");
    const instance = storeService.get("evolution_instance", "default");

    if (!baseUrl || !instance || !apiKey) {
      console.log(`[WhatsApp Simulado] Mensagem para ${phone}:\n${text}`);
      return true;
    }

    try {
      const formatted = this.formatPhone(phone);
      await axios.post(
        `${baseUrl}/message/sendText/${instance}`,
        {
          number: formatted,
          options: { delay: 1000, linkPreview: true },
          textMessage: { text }
        },
        {
          headers: { apikey: apiKey, "Content-Type": "application/json" },
          timeout: 10000
        }
      );
      return true;
    } catch (err: any) {
      console.error("[WhatsApp] Erro no envio Evolution API:", err.message);
      return false;
    }
  },

  formatOrderForStore(order: any, items: any[]): string {
    const storeName = storeService.get("store_name", "Roviro Burger");
    let msg = `🔔 *NOVO PEDIDO #${order.orderNumber}* — *${storeName}*\n\n`;
    msg += `👤 *Cliente:* ${order.customerName}\n`;
    msg += `📱 *Telefone:* ${order.customerPhone}\n`;
    msg += `📍 *Tipo:* ${order.deliveryType === 'DELIVERY' ? 'Entrega em Casa' : 'Retirada no Balcão'}\n`;
    if (order.deliveryType === 'DELIVERY') {
      msg += `🏠 *Endereço:* ${order.address}\n`;
    }
    msg += `💳 *Forma de Pagamento:* ${order.paymentMethod}\n`;
    if (order.changeFor) {
      msg += `💵 *Troco para:* R$ ${Number(order.changeFor).toFixed(2)}\n`;
    }
    msg += `\n🛒 *ITENS DO PEDIDO:*\n`;

    for (const it of items) {
      msg += `• *${it.quantity}x* ${it.productName} (R$ ${Number(it.unitPrice).toFixed(2)})\n`;
      if (it.selectedOptions) {
        try {
          const opts = JSON.parse(it.selectedOptions);
          if (opts.length > 0) {
            msg += `   └ Adicionais: ${opts.map((o: any) => `${o.name} (+R$ ${o.price.toFixed(2)})`).join(', ')}\n`;
          }
        } catch (e) {}
      }
      if (it.notes) {
        msg += `   └ Obs: _${it.notes}_\n`;
      }
    }

    msg += `\n💰 *Subtotal:* R$ ${Number(order.subtotal).toFixed(2)}\n`;
    if (order.deliveryFee > 0) {
      msg += `🛵 *Taxa de Entrega:* R$ ${Number(order.deliveryFee).toFixed(2)}\n`;
    }
    msg += `🧾 *TOTAL: R$ ${Number(order.total).toFixed(2)}*\n`;

    if (order.paymentMethod === 'PIX' && order.pixCopiaECola) {
      msg += `\n🔑 *Chave PIX Copia e Cola para pagamento:*\n\`\`\`${order.pixCopiaECola}\`\`\`\n`;
    }

    return msg;
  },

  formatStatusNotification(order: any, newStatus: string): string {
    const storeName = storeService.get("store_name", "Roviro Burger");
    if (newStatus === "PREPARING") {
      return `Olá *${order.customerName}*! 👨‍🍳\nSeu pedido *#${order.orderNumber}* no *${storeName}* acabou de ser aceito e já está em preparo na cozinha! 🍔🔥`;
    }
    if (newStatus === "DISPATCHED") {
      return `Oba, *${order.customerName}*! 🛵💨\nSeu pedido *#${order.orderNumber}* acabou de sair para entrega com nosso motoboy. Prepare a mesa!`;
    }
    if (newStatus === "DELIVERED") {
      return `Pedido entregue com sucesso! 🎉\nObrigado por pedir com o *${storeName}*. Bom apetite! 😋`;
    }
    if (newStatus === "CANCELLED") {
      return `Aviso sobre o pedido *#${order.orderNumber}*:\nO pedido foi cancelado pela loja. Se tiver dúvidas, responda esta mensagem.`;
    }
    return "";
  }
};

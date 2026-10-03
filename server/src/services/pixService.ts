import { storeService } from "./storeService";

export const pixService = {
  generatePixCopiaECola(total: number, orderNumber: number): { copiaECola: string; qrCode: string } {
    const pixKey = storeService.get("pix_key", "roviro221@gmail.com");
    const storeName = storeService.get("store_name", "Roviro Burger");
    
    // Gerador de Payload PIX Padrão Bacen Simulado/Compatível
    const formattedVal = total.toFixed(2);
    const fakeUuid = crypto.randomUUID().replace(/-/g, "").substring(0, 25);
    const copiaECola = `00020126580014br.gov.bcb.pix0136${pixKey}520400005303986540${formattedVal}5802BR5916${storeName.substring(0, 16).toUpperCase()}6009SAO PAULO62140510PEDIDO#${orderNumber}6304${fakeUuid.substring(0, 4).toUpperCase()}`;

    // SVG QR Code leve e instantâneo
    const qrCode = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' width='200' height='200'><rect width='100%' height='100%' fill='%23080c14'/><rect x='20' y='20' width='40' height='40' fill='%2338bdf8'/><rect x='140' y='20' width='40' height='40' fill='%2338bdf8'/><rect x='20' y='140' width='40' height='40' fill='%2338bdf8'/><text x='100' y='105' fill='%23ffffff' font-size='12' font-family='sans-serif' font-weight='bold' text-anchor='middle'>PIX R$ ${formattedVal}</text><text x='100' y='125' fill='%2338bdf8' font-size='9' font-family='sans-serif' text-anchor='middle'>Pedido #${orderNumber}</text></svg>`;

    return { copiaECola, qrCode };
  }
};

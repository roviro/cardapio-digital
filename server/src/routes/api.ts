import { Router } from "express";
import { menuController } from "../controllers/menuController";
import { orderController } from "../controllers/orderController";
import { settingsController } from "../controllers/settingsController";

export const apiRouter = Router();

// Menu Público (Cardápio do Cliente)
apiRouter.get("/menu", menuController.getPublicMenu);

// Pedidos
apiRouter.post("/orders", orderController.createOrder);
apiRouter.get("/orders", orderController.getAllOrders);
apiRouter.put("/orders/:id/status", orderController.updateStatus);

// Gestão de Produtos (Admin)
apiRouter.get("/products", menuController.getAllProductsAdmin);
apiRouter.post("/products", menuController.createProduct);
apiRouter.patch("/products/:id/toggle", menuController.toggleAvailability);
apiRouter.delete("/products/:id", menuController.deleteProduct);
apiRouter.get("/categories", menuController.getCategories);

// Configurações da Loja
apiRouter.get("/settings", settingsController.getSettings);
apiRouter.post("/settings", settingsController.updateSettings);

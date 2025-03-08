import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Product routes
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).send("Product not found");
    res.json(product);
  });

  app.post("/api/products", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const product = await storage.createProduct(req.body);
    res.status(201).json(product);
  });

  app.patch("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const product = await storage.updateProduct(Number(req.params.id), req.body);
    res.json(product);
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const items = await storage.getCartItems(req.user!.id);
    res.json(items);
  });

  app.post("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const item = await storage.addToCart({
      ...req.body,
      userId: req.user!.id,
    });
    res.status(201).json(item);
  });

  app.patch("/api/cart/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const item = await storage.updateCartItem(
      Number(req.params.id),
      req.body.quantity,
    );
    res.json(item);
  });

  app.delete("/api/cart/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.removeFromCart(Number(req.params.id));
    res.sendStatus(200);
  });

  // Wishlist routes
  app.get("/api/wishlist", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const items = await storage.getWishlistItems(req.user!.id);
    res.json(items);
  });

  app.post("/api/wishlist", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const item = await storage.addToWishlist({
      ...req.body,
      userId: req.user!.id,
    });
    res.status(201).json(item);
  });

  app.delete("/api/wishlist/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.removeFromWishlist(Number(req.params.id));
    res.sendStatus(200);
  });

  // Order routes
  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const orders = await storage.getOrders(req.user!.id);
    res.json(orders);
  });

  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const order = await storage.createOrder({
      ...req.body,
      userId: req.user!.id,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(order);
  });

  app.patch("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const order = await storage.updateOrder(Number(req.params.id), req.body);
    res.json(order);
  });

  const httpServer = createServer(app);
  return httpServer;
}
// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// server/storage.ts
import createMemoryStore from "memorystore";
import session from "express-session";
var MemoryStore = createMemoryStore(session);
var MemStorage = class {
  users;
  products;
  cartItems;
  wishlistItems;
  orders;
  sessionStore;
  currentIds;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.products = /* @__PURE__ */ new Map();
    this.cartItems = /* @__PURE__ */ new Map();
    this.wishlistItems = /* @__PURE__ */ new Map();
    this.orders = /* @__PURE__ */ new Map();
    this.currentIds = {
      users: 1,
      products: 1,
      cartItems: 1,
      wishlistItems: 1,
      orders: 1
    };
    this.sessionStore = new MemoryStore({
      checkPeriod: 864e5
    });
    this.createProduct({
      name: "Classic Leather Wallet",
      description: "Handcrafted genuine leather bifold wallet with multiple card slots",
      price: 79.99,
      images: [
        "https://images.unsplash.com/photo-1627123424574-724758594e93",
        "https://images.unsplash.com/photo-1627123424574-724758594e94"
      ],
      stock: 50,
      category: "Wallets"
    });
    this.createProduct({
      name: "Leather Messenger Bag",
      description: "Premium leather messenger bag perfect for daily use",
      price: 299.99,
      images: [
        "https://images.unsplash.com/photo-1473188588951-666fce8e7c68",
        "https://images.unsplash.com/photo-1473188588951-666fce8e7c69"
      ],
      stock: 25,
      category: "Bags"
    });
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.currentIds.users++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getProducts() {
    return Array.from(this.products.values());
  }
  async getProduct(id) {
    return this.products.get(id);
  }
  async createProduct(insertProduct) {
    const id = this.currentIds.products++;
    const product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }
  async updateProduct(id, updates) {
    const product = this.products.get(id);
    if (!product) throw new Error("Product not found");
    const updated = { ...product, ...updates };
    this.products.set(id, updated);
    return updated;
  }
  async getCartItems(userId) {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );
  }
  async addToCart(insertCartItem) {
    const id = this.currentIds.cartItems++;
    const cartItem = { ...insertCartItem, id };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }
  async updateCartItem(id, quantity) {
    const item = this.cartItems.get(id);
    if (!item) throw new Error("Cart item not found");
    const updated = { ...item, quantity };
    this.cartItems.set(id, updated);
    return updated;
  }
  async removeFromCart(id) {
    this.cartItems.delete(id);
  }
  async getWishlistItems(userId) {
    return Array.from(this.wishlistItems.values()).filter(
      (item) => item.userId === userId
    );
  }
  async addToWishlist(insertWishlistItem) {
    const id = this.currentIds.wishlistItems++;
    const wishlistItem = { ...insertWishlistItem, id };
    this.wishlistItems.set(id, wishlistItem);
    return wishlistItem;
  }
  async removeFromWishlist(id) {
    this.wishlistItems.delete(id);
  }
  async getOrders(userId) {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }
  async createOrder(insertOrder) {
    const id = this.currentIds.orders++;
    const order = { ...insertOrder, id };
    this.orders.set(id, order);
    return order;
  }
  async updateOrder(id, updates) {
    const order = this.orders.get(id);
    if (!order) throw new Error("Order not found");
    const updated = { ...order, ...updates };
    this.orders.set(id, updated);
    return updated;
  }
};
var storage = new MemStorage();

// server/auth.ts
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !await comparePasswords(password, user.password)) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });
  app2.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }
    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password)
    });
    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}

// server/routes.ts
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });
  app2.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).send("Product not found");
    res.json(product);
  });
  app2.post("/api/products", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const product = await storage.createProduct(req.body);
    res.status(201).json(product);
  });
  app2.patch("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const product = await storage.updateProduct(Number(req.params.id), req.body);
    res.json(product);
  });
  app2.get("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const items = await storage.getCartItems(req.user.id);
    res.json(items);
  });
  app2.post("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const item = await storage.addToCart({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json(item);
  });
  app2.patch("/api/cart/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const item = await storage.updateCartItem(
      Number(req.params.id),
      req.body.quantity
    );
    res.json(item);
  });
  app2.delete("/api/cart/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.removeFromCart(Number(req.params.id));
    res.sendStatus(200);
  });
  app2.get("/api/wishlist", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const items = await storage.getWishlistItems(req.user.id);
    res.json(items);
  });
  app2.post("/api/wishlist", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const item = await storage.addToWishlist({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json(item);
  });
  app2.delete("/api/wishlist/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.removeFromWishlist(Number(req.params.id));
    res.sendStatus(200);
  });
  app2.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const orders = await storage.getOrders(req.user.id);
    res.json(orders);
  });
  app2.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const order = await storage.createOrder({
      ...req.body,
      userId: req.user.id,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.status(201).json(order);
  });
  app2.patch("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const order = await storage.updateOrder(Number(req.params.id), req.body);
    res.json(order);
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();

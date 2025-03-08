import { IStorage } from "./storage";
import createMemoryStore from "memorystore";
import session from "express-session";
import {
  type User,
  type Product,
  type CartItem,
  type WishlistItem,
  type Order,
  type InsertUser,
  type InsertProduct,
  type InsertCartItem,
  type InsertWishlistItem,
  type InsertOrder,
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product>;

  // Cart operations
  getCartItems(userId: number): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;

  // Wishlist operations
  getWishlistItems(userId: number): Promise<WishlistItem[]>;
  addToWishlist(item: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(id: number): Promise<void>;

  // Order operations
  getOrders(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<Order>): Promise<Order>;

  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private wishlistItems: Map<number, WishlistItem>;
  private orders: Map<number, Order>;
  sessionStore: session.SessionStore;

  private currentIds: {
    users: number;
    products: number;
    cartItems: number;
    wishlistItems: number;
    orders: number;
  };

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.wishlistItems = new Map();
    this.orders = new Map();
    this.currentIds = {
      users: 1,
      products: 1,
      cartItems: 1,
      wishlistItems: 1,
      orders: 1,
    };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Add some sample products
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

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentIds.products++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    const product = this.products.get(id);
    if (!product) throw new Error("Product not found");

    const updated = { ...product, ...updates };
    this.products.set(id, updated);
    return updated;
  }

  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId,
    );
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    const id = this.currentIds.cartItems++;
    const cartItem: CartItem = { ...insertCartItem, id };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const item = this.cartItems.get(id);
    if (!item) throw new Error("Cart item not found");
    const updated = { ...item, quantity };
    this.cartItems.set(id, updated);
    return updated;
  }

  async removeFromCart(id: number): Promise<void> {
    this.cartItems.delete(id);
  }

  async getWishlistItems(userId: number): Promise<WishlistItem[]> {
    return Array.from(this.wishlistItems.values()).filter(
      (item) => item.userId === userId,
    );
  }

  async addToWishlist(insertWishlistItem: InsertWishlistItem): Promise<WishlistItem> {
    const id = this.currentIds.wishlistItems++;
    const wishlistItem: WishlistItem = { ...insertWishlistItem, id };
    this.wishlistItems.set(id, wishlistItem);
    return wishlistItem;
  }

  async removeFromWishlist(id: number): Promise<void> {
    this.wishlistItems.delete(id);
  }

  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId,
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentIds.orders++;
    const order: Order = { ...insertOrder, id };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) throw new Error("Order not found");

    const updated = { ...order, ...updates };
    this.orders.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
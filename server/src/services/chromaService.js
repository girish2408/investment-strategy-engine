import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import { ChromaClient } from 'chromadb';

const dataDir = path.join(process.cwd(), 'data');
const usersFile = path.join(dataDir, 'users.json');
const booksFile = path.join(dataDir, 'books.json');

class ChromaService {
  constructor() {
    const dataDir = path.join(process.cwd(), 'data', 'chroma');
    this.client = new ChromaClient({
      path: dataDir
    });
    this.collections = {};
    this.initializeCollections();
  }

  async ensureDataFiles() {
    await fs.mkdir(dataDir, { recursive: true });
    for (const file of [usersFile, booksFile]) {
      try {
        await fs.access(file);
      } catch {
        await fs.writeFile(file, '[]');
      }
    }
  }

  async readJson(file) {
    await this.ensureDataFiles();
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data);
  }

  async writeJson(file, data) {
    await this.ensureDataFiles();
    await fs.writeFile(file, JSON.stringify(data, null, 2));
  }

  // User Management
  async createUser(email, password) {
    const users = await this.readJson(usersFile);
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = {
      id: `user_${Date.now()}`,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    await this.writeJson(usersFile, users);
    return user;
  }

  async getUserByEmail(email) {
    const users = await this.readJson(usersFile);
    return users.find(u => u.email === email) || null;
  }

  async getUserById(id) {
    const users = await this.readJson(usersFile);
    return users.find(u => u.id === id) || null;
  }

  async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password);
  }

  // Book Management
  async addBook(bookData) {
    const books = await this.readJson(booksFile);
    const book = {
      id: `book_${Date.now()}`,
      ...bookData,
      createdAt: new Date().toISOString()
    };
    books.push(book);
    await this.writeJson(booksFile, books);
    return book;
  }

  async getBook(id) {
    const books = await this.readJson(booksFile);
    return books.find(b => b.id === id) || null;
  }

  async getAllBooks() {
    return await this.readJson(booksFile);
  }

  async updateBook(id, bookData) {
    const books = await this.readJson(booksFile);
    const idx = books.findIndex(b => b.id === id);
    if (idx === -1) return null;
    books[idx] = { ...books[idx], ...bookData };
    await this.writeJson(booksFile, books);
    return books[idx];
  }

  async deleteBook(id) {
    const books = await this.readJson(booksFile);
    const idx = books.findIndex(b => b.id === id);
    if (idx === -1) return false;
    books.splice(idx, 1);
    await this.writeJson(booksFile, books);
    return true;
  }

  initializeCollections() {
    // Implementation of initializeCollections method
  }
}

export default new ChromaService(); 
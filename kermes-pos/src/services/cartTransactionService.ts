import { CartItem } from '../types/index';

interface CartTransaction {
    id: number;
    transaction_date: string;
    total_amount: number;
    items_count: number;
    items_data: string;
    payment_method: string;
}

interface DailyStats {
    date: string;
    transaction_count: number;
    total_revenue: number;
    total_items: number;
}

interface CategoryStats {
    categories: string;
    count: number;
}

class CartTransactionService {
    private db: IDBDatabase | null = null;
    private dbName = 'kermes_pos';
    private storeName = 'transactions';

    constructor() {
        this.initDB();
    }

    private initDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => {
                console.error('Error opening database');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('transaction_date', 'transaction_date', { unique: false });
                }
            };
        });
    }

    async saveTransaction(cartItems: CartItem[], totalAmount: number, paymentMethod: string): Promise<void> {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            const itemsData = JSON.stringify(cartItems);
            const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            
            const transactionData = {
                transaction_date: new Date().toISOString(),
                total_amount: totalAmount,
                items_count: itemsCount,
                items_data: itemsData,
                payment_method: paymentMethod
            };

            const request = store.add(transactionData);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getTransactions(): Promise<CartTransaction[]> {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(this.storeName, 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getDailyStats(): Promise<DailyStats[]> {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(this.storeName, 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                const transactions = request.result;
                const stats = new Map<string, DailyStats>();

                transactions.forEach((tx: CartTransaction) => {
                    const date = new Date(tx.transaction_date).toISOString().split('T')[0];
                    if (!stats.has(date)) {
                        stats.set(date, {
                            date,
                            transaction_count: 0,
                            total_revenue: 0,
                            total_items: 0
                        });
                    }
                    const stat = stats.get(date)!;
                    stat.transaction_count++;
                    stat.total_revenue += tx.total_amount;
                    stat.total_items += tx.items_count;
                });

                resolve(Array.from(stats.values()).sort((a, b) => b.date.localeCompare(a.date)));
            };

            request.onerror = () => reject(request.error);
        });
    }

    async getCategoryStats(): Promise<CategoryStats[]> {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(this.storeName, 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                const transactions = request.result;
                const stats = new Map<string, number>();

                transactions.forEach((tx: CartTransaction) => {
                    const items = JSON.parse(tx.items_data) as CartItem[];
                    items.forEach(item => {
                        const category = item.product.category;
                        stats.set(category, (stats.get(category) || 0) + item.quantity);
                    });
                });

                resolve(Array.from(stats.entries()).map(([categories, count]) => ({
                    categories,
                    count
                })).sort((a, b) => b.count - a.count));
            };

            request.onerror = () => reject(request.error);
        });
    }
}

export const cartTransactionService = new CartTransactionService(); 
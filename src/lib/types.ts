// ----------------------------------------Customer Type------------------------------------------------------
export type Customer = {
    id: string;
    name: string;
    phone: string;
    email: string;
    gstNumber: string;
    address: string;
    town: string;
    balance: number;
    openingBalance: number
};

// --------------------------------Leder type for customer and supplier Ledger----------------------------
export interface LedgerEntry {
    id: string;
    date: string;
    type: "SALE" | "RECEIPT" | "RETURN" | "PURCHASE" | "PAYMENT";
    desc: string;
    debit: number;
    credit: number;
    runningBalance: number;
    remarks: string
}



export type UnitConversion = {
    id: string;
    productId: string;
    unitName: string;       // "Case", "Ladi", "Pcs"
    conversionQty: number;  // how many base units = 1 of this unit
    sellingPrice: number; // optional override for sell price when sold in this unit
};

export type Category = {
    id: string;
    name: string;
    description: string;
    parentId: string | null;
    children?: Category[];
};

export type Product = {
    id: string;
    sku: string;
    name: string;
    baseUnit: string;               // was `unit` — the atomic unit stored in DB
    currentSellPrice: number;
    taxRate: number;
    isStockItem: boolean;
    category: Category
    categoryId: string | null;
    unitConversions: UnitConversion[];
    totalStockPcs?: number;
    // Relations - These must be added to stop the TS error
    purchaseBatches?: PurchaseBatch[];

    // Calculated field from backend (if you added it in the last step)
};

export type Supplier = {
    id: number;
    name: string;
    contactName: string;
    phone: string;
    email: string;
    gstNumber: string;
    address: string;
    openingBalance: number;
    balance: number;
}


// ---------------------------------------------For Purchase Page------------------------------------
export type PurchaseListItem = {
    id: string;
    supplierId: string;
    supplier: { id: string; name: string };
    invoiceNo: string | null;
    purchaseDate: string;
    totalAmount: number;
    createdAt: string;
    batchCount: number;
};

export type PurchaseBatch = {
    id: string;
    productId: string;
    product: { id: string; name: string; sku: string | null; baseUnit: string };
    qtyReceived: number;
    qtyRemaining: number;
    unitCost: number;
    sellingPrice: number | null;
    mrp: number | null;
    purchasedUnit: string;
    conversionQty: number;
};

export type PurchaseDetail = {
    id: string;
    supplier: {
        id: string;
        name: string;
        contactName: string | null;
        phone: string | null;
        email: string | null;
        gstNumber: string | null;
        address: string | null;
    };
    invoiceNo: string | null;
    purchaseDate: string;
    totalAmount: number;
    batches: PurchaseBatch[];
    coinAdjustment: number

};

// -------------------------------------------For Sale ----------------------------------------------
export type SaleListItem = {
    id: string; // uuid — was Int, now String
    invoiceNo: string;
    saleDate: string;
    totalAmount: number;
    createdAt: string;
    // Snapshot fields — always available even if customer is deleted or renamed
    customerName: string | null;
    customerPhone: string | null;
    customer: {
        id: string;
        name: string;
        phone: string | null;
        town: string;
    } | null;
    _count: { lines: number };
};
export type SaleRow = {
    productId: string;
    qtyInput: string;
    selectedUnit: string;
    qtyBase: number;
    sellPrice: string;
    product: any | null;
    stockBase: number | null;
    loadingStock: boolean;
};
export type Pagination = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
};

export type Summary = {
    purchases: { amount: number; count: number };
    month: { amount: number; count: number };
    allTime: { amount: number; count: number };
};
export type purchaseSummary = {
    purchases: number,
    spend: number,
    totalLine: number
};
export type SalesLine = {
    id: number;
    qty: number; // base unit qty
    unitQty: number; // display qty
    unitname: string; // display unit name (e.g. "Case")
    productName: string; // snapshot — always accurate
    unitSellPrice: number;
    lineTotal: number;
    taxRate: number | null;
    product: { id: string; name: string; sku: string | null; baseUnit: string };
}
export type SaleDetail = {
    id: string; // uuid
    invoiceNo: string;
    saleDate: string;
    totalAmount: number;
    // Customer snapshot fields (historical accuracy)
    customerName: string | null;
    customerPhone: string | null;
    customerAddress: string | null;
    customerGST: string | null;
    customer: {
        id: string;
        name: string;
        phone: string | null;
        town: string;
        balance: number;
    } | null;
    lines: SalesLine[];
};

export type SortField = "saleDate" | "totalAmount" | "invoiceNo";

// ----------------------------------For Pagination --------------------------------------
export type Meta = {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    totalSpend: number;
    totalLineItems: number;
};

// ----------------------------------For Supplier Payments --------------------------------------
export type SupplierPayment = {
    id: string;
    supplierId: string;
    supplier: { id: string; name: string; email: string; phone: string };
    paymentDate: string;
    paymentMode: string;
    checkNo: string | null;
    transactionId: string | null;
    reference: string | null;
    remarks: string | null;
    amount: number;
    createdAt: string;
};

// ---------------------------------For Receiptd--------------------------------------------------
export type Receipt = {
    id: string;
    customerId: string;
    customer: { id: string; name: string; email: string; phone: string };
    receiptDate: string;
    paymentMode: string;
    amount: number;
    remarks: string | null;
    createdAt: string;
};



/** Returns top-level categories with their children nested inside */
export function buildCategoryTree(flat: Category[]): Category[] {
    const map = new Map<string, Category>();
    if (!flat || flat.length === 0) return [];
    flat.forEach((c) => map.set(c.id, { ...c, children: [] }));
    const roots: Category[] = [];
    map.forEach((cat) => {
        if (cat.parentId === null) {
            roots.push(cat);
        } else {
            map.get(cat.parentId)?.children?.push(cat);
        }
    });
    return roots;
}

/** Returns display label e.g. "Electronics › Laptops" */
export function getCategoryLabel(id: string | null, flat: Category[]): string {
    if (id === null) return "—";
    const cat = flat.find((c) => c.id === id);
    if (!cat) return "—";
    if (cat.parentId !== null) {
        const parent = flat.find((c) => c.id === cat.parentId);
        return parent ? `${parent.name} › ${cat.name}` : cat.name;
    }
    return cat.name;
}

export function toMixedUnits(
    totalBase: number,
    conversions: UnitConversion[],
): { unit: string; qty: number }[] {
    const sorted = [...conversions].sort((a, b) => b.conversionQty - a.conversionQty);
    let remaining = totalBase;
    return sorted.map((conv) => {
        const qty = Math.floor(remaining / conv.conversionQty);
        remaining = remaining % conv.conversionQty;
        return { unit: conv.unitName, qty };
    });
}
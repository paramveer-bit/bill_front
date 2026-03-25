export type UnitConversion = {
    id: string;
    productId: string;
    unitName: string;       // "Case", "Ladi", "Pcs"
    conversionQty: number;  // how many base units = 1 of this unit
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
    categoryId: string | null;
    unitConversions: UnitConversion[];
    totalStockPcs?: number;
};

/** Returns top-level categories with their children nested inside */
export function buildCategoryTree(flat: Category[]): Category[] {
    const map = new Map<string, Category>();
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
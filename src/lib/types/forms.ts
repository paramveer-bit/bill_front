
export type UnitRow = { unitName: string; conversionQty: string };
export type ProductFormState = {
    sku: string;
    name: string;
    baseUnit: string;
    currentSellPrice: string;
    taxRate: string;
    isStockItem: boolean;
    categoryId: string;
    unitRows: UnitRow[];
};
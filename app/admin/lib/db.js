const fs = require('fs');
const path = require('path');

// Տվյալների ֆայլերի ուղիներ
const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const PARTY_FILE = path.join(DATA_DIR, 'partyItems.json');

// Համոզվել, որ data պանակը գոյություն ունի
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Տվյալները կարդալ ֆայլից
export function readData(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([], null, 2));
            return [];
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading file:', error);
        return [];
    }
}

// Տվյալները պահպանել ֆայլում
export function writeData(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing file:', error);
        return false;
    }
}

// Products
export function getProducts() {
    return readData(PRODUCTS_FILE);
}

export function saveProducts(products) {
    return writeData(PRODUCTS_FILE, products);
}

// Party Items
export function getPartyItems() {
    return readData(PARTY_FILE);
}

export function savePartyItems(items) {
    return writeData(PARTY_FILE, items);
}
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Container, Item } from '../types';

interface BinOrganizeDB extends DBSchema {
  containers: {
    key: string;
    value: Container;
    indexes: {
      'by-parent': string | null;
      'by-name': string;
      'by-location': string;
    };
  };
  items: {
    key: string;
    value: Item;
    indexes: {
      'by-container': string;
      'by-title': string;
      'by-barcode': string | null;
    };
  };
}

const DB_NAME = 'bin-organize-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<BinOrganizeDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<BinOrganizeDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<BinOrganizeDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Containers store
      if (!db.objectStoreNames.contains('containers')) {
        const containerStore = db.createObjectStore('containers', { keyPath: 'id' });
        containerStore.createIndex('by-parent', 'parentId');
        containerStore.createIndex('by-name', 'name');
        containerStore.createIndex('by-location', 'location');
      }

      // Items store
      if (!db.objectStoreNames.contains('items')) {
        const itemStore = db.createObjectStore('items', { keyPath: 'id' });
        itemStore.createIndex('by-container', 'containerId');
        itemStore.createIndex('by-title', 'title');
        itemStore.createIndex('by-barcode', 'barcode');
      }
    },
  });

  return dbInstance;
}

// Container operations
export async function getAllContainers(): Promise<Container[]> {
  const db = await getDB();
  return db.getAll('containers');
}

export async function getContainer(id: string): Promise<Container | undefined> {
  const db = await getDB();
  return db.get('containers', id);
}

export async function getChildContainers(parentId: string | null): Promise<Container[]> {
  const db = await getDB();
  return db.getAllFromIndex('containers', 'by-parent', parentId);
}

export async function addContainer(container: Container): Promise<string> {
  const db = await getDB();
  await db.add('containers', container);
  return container.id;
}

export async function updateContainer(container: Container): Promise<void> {
  const db = await getDB();
  await db.put('containers', container);
}

export async function deleteContainer(id: string): Promise<void> {
  const db = await getDB();

  // Delete all items in this container
  const items = await getItemsByContainer(id);
  for (const item of items) {
    await db.delete('items', item.id);
  }

  // Delete all child containers recursively
  const children = await getChildContainers(id);
  for (const child of children) {
    await deleteContainer(child.id);
  }

  // Delete the container itself
  await db.delete('containers', id);
}

// Item operations
export async function getAllItems(): Promise<Item[]> {
  const db = await getDB();
  return db.getAll('items');
}

export async function getItem(id: string): Promise<Item | undefined> {
  const db = await getDB();
  return db.get('items', id);
}

export async function getItemsByContainer(containerId: string): Promise<Item[]> {
  const db = await getDB();
  return db.getAllFromIndex('items', 'by-container', containerId);
}

export async function addItem(item: Item): Promise<string> {
  const db = await getDB();
  await db.add('items', item);
  return item.id;
}

export async function updateItem(item: Item): Promise<void> {
  const db = await getDB();
  await db.put('items', item);
}

export async function deleteItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('items', id);
}

// Search operations
export async function searchAll(query: string): Promise<{ containers: Container[]; items: Item[] }> {
  const db = await getDB();
  const lowerQuery = query.toLowerCase();

  const allContainers = await db.getAll('containers');
  const allItems = await db.getAll('items');

  const containers = allContainers.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.description.toLowerCase().includes(lowerQuery) ||
      c.location.toLowerCase().includes(lowerQuery)
  );

  const items = allItems.filter(
    (i) =>
      i.title.toLowerCase().includes(lowerQuery) ||
      i.description.toLowerCase().includes(lowerQuery) ||
      (i.barcode && i.barcode.includes(query))
  );

  return { containers, items };
}

// Export all data
export async function exportAllData(): Promise<{ containers: Container[]; items: Item[] }> {
  const db = await getDB();
  const containers = await db.getAll('containers');
  const items = await db.getAll('items');
  return { containers, items };
}

// Import data
export async function importData(containers: Container[], items: Item[]): Promise<void> {
  const db = await getDB();

  const tx = db.transaction(['containers', 'items'], 'readwrite');

  for (const container of containers) {
    await tx.objectStore('containers').put(container);
  }

  for (const item of items) {
    await tx.objectStore('items').put(item);
  }

  await tx.done;
}

// Clear all data
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await db.clear('containers');
  await db.clear('items');
}

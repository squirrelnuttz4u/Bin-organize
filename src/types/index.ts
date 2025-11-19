export interface Container {
  id: string;
  name: string;
  description: string;
  location: string;
  parentId: string | null;
  color: string;
  createdAt: number;
  updatedAt: number;
}

export interface Item {
  id: string;
  containerId: string;
  title: string;
  description: string;
  quantity: number;
  barcode: string | null;
  images: string[]; // Base64 encoded images
  createdAt: number;
  updatedAt: number;
}

export interface SearchResult {
  type: 'container' | 'item';
  container?: Container;
  item?: Item;
  parentContainer?: Container;
}

export interface ExportData {
  containers: Container[];
  items: Item[];
  exportDate: string;
  appVersion: string;
}

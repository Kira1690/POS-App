/**
 * Tables Dashboard Mock Data
 * Comprehensive data for Tables Dashboard according to wireframes
 */

export interface Table {
  id: string;
  number: string;
  section: 'main-dining' | 'bar' | 'vip' | 'outdoor-patio';
  capacity: number;
  status: 'available' | 'occupied' | 'cleaning' | 'reserved';
  position: {
    x: number;
    y: number;
  };
  shape: 'round' | 'square' | 'rectangle';
  currentOrder?: {
    id: string;
    customerName: string;
    startTime: string;
    totalAmount: number;
    itemCount: number;
    serverName: string;
    specialRequests?: string[];
  };
  reservationInfo?: {
    customerName: string;
    time: string;
    partySize: number;
    specialRequests?: string[];
  };
  lastCleanedAt?: string;
  serviceDuration?: number; // minutes
}

export interface TableSection {
  id: string;
  name: string;
  displayName: string;
  tables: Table[];
  color: string;
}

export interface TableSummary {
  total: number;
  occupied: number;
  available: number;
  cleaning: number;
  reserved: number;
  occupancyRate: number;
}

export interface FloorPlan {
  id: string;
  name: string;
  sections: TableSection[];
  specialAreas: {
    kitchen: { x: number; y: number; width: number; height: number };
    bar: { x: number; y: number; width: number; height: number };
    entrance: { x: number; y: number; width: number; height: number };
  };
}

export interface TablesDashboardData {
  floorPlan: FloorPlan;
  summary: TableSummary;
  selectedTable?: Table;
  lastUpdated: string;
}

// Mock tables data
const MAIN_DINING_TABLES: Table[] = [
  {
    id: 'table_001',
    number: '1',
    section: 'main-dining',
    capacity: 4,
    status: 'occupied',
    position: { x: 100, y: 100 },
    shape: 'round',
    currentOrder: {
      id: 'ord_001',
      customerName: 'John Smith',
      startTime: '2024-09-28T14:45:00Z',
      totalAmount: 49.97,
      itemCount: 3,
      serverName: 'Alice Johnson',
      specialRequests: ['No onions', 'Extra sauce'],
    },
    serviceDuration: 45,
  },
  {
    id: 'table_002',
    number: '2',
    section: 'main-dining',
    capacity: 2,
    status: 'available',
    position: { x: 200, y: 100 },
    shape: 'square',
    lastCleanedAt: '2024-09-28T14:30:00Z',
  },
  {
    id: 'table_003',
    number: '3',
    section: 'main-dining',
    capacity: 6,
    status: 'reserved',
    position: { x: 300, y: 100 },
    shape: 'rectangle',
    reservationInfo: {
      customerName: 'Thompson Family',
      time: '2024-09-28T18:00:00Z',
      partySize: 6,
      specialRequests: ['High chair needed', 'Window seat preferred'],
    },
  },
  {
    id: 'table_004',
    number: '4',
    section: 'main-dining',
    capacity: 4,
    status: 'occupied',
    position: { x: 100, y: 200 },
    shape: 'round',
    currentOrder: {
      id: 'ord_004',
      customerName: 'Maria Garcia',
      startTime: '2024-09-28T14:20:00Z',
      totalAmount: 67.50,
      itemCount: 4,
      serverName: 'Bob Wilson',
    },
    serviceDuration: 65,
  },
  {
    id: 'table_005',
    number: '5',
    section: 'main-dining',
    capacity: 2,
    status: 'cleaning',
    position: { x: 200, y: 200 },
    shape: 'square',
    lastCleanedAt: '2024-09-28T15:10:00Z',
  },
];

const BAR_TABLES: Table[] = [
  {
    id: 'bar_001',
    number: 'B1',
    section: 'bar',
    capacity: 2,
    status: 'occupied',
    position: { x: 450, y: 100 },
    shape: 'round',
    currentOrder: {
      id: 'ord_bar_001',
      customerName: 'David Lee',
      startTime: '2024-09-28T15:00:00Z',
      totalAmount: 23.50,
      itemCount: 2,
      serverName: 'Carol Davis',
    },
    serviceDuration: 20,
  },
  {
    id: 'bar_002',
    number: 'B2',
    section: 'bar',
    capacity: 2,
    status: 'available',
    position: { x: 500, y: 100 },
    shape: 'round',
    lastCleanedAt: '2024-09-28T14:45:00Z',
  },
];

const VIP_TABLES: Table[] = [
  {
    id: 'vip_001',
    number: 'VIP1',
    section: 'vip',
    capacity: 8,
    status: 'reserved',
    position: { x: 100, y: 350 },
    shape: 'rectangle',
    reservationInfo: {
      customerName: 'Corporate Event - ABC Inc',
      time: '2024-09-28T19:00:00Z',
      partySize: 8,
      specialRequests: ['Wine pairing menu', 'Private service'],
    },
  },
  {
    id: 'vip_002',
    number: 'VIP2',
    section: 'vip',
    capacity: 6,
    status: 'available',
    position: { x: 300, y: 350 },
    shape: 'rectangle',
    lastCleanedAt: '2024-09-28T13:00:00Z',
  },
];

const OUTDOOR_TABLES: Table[] = [
  {
    id: 'outdoor_001',
    number: 'O1',
    section: 'outdoor-patio',
    capacity: 4,
    status: 'occupied',
    position: { x: 600, y: 200 },
    shape: 'round',
    currentOrder: {
      id: 'ord_outdoor_001',
      customerName: 'Sarah Johnson',
      startTime: '2024-09-28T14:30:00Z',
      totalAmount: 45.75,
      itemCount: 3,
      serverName: 'Eve Thompson',
    },
    serviceDuration: 50,
  },
  {
    id: 'outdoor_002',
    number: 'O2',
    section: 'outdoor-patio',
    capacity: 2,
    status: 'available',
    position: { x: 650, y: 250 },
    shape: 'square',
    lastCleanedAt: '2024-09-28T14:15:00Z',
  },
];

// Combined mock floor plan
export const MOCK_FLOOR_PLAN: FloorPlan = {
  id: 'floor_001',
  name: 'Main Restaurant Floor',
  sections: [
    {
      id: 'main_dining',
      name: 'main-dining',
      displayName: 'Main Dining',
      tables: MAIN_DINING_TABLES,
      color: '#4A90E2',
    },
    {
      id: 'bar_section',
      name: 'bar',
      displayName: 'Bar Area',
      tables: BAR_TABLES,
      color: '#7B68EE',
    },
    {
      id: 'vip_section',
      name: 'vip',
      displayName: 'VIP Section',
      tables: VIP_TABLES,
      color: '#FFD700',
    },
    {
      id: 'outdoor_section',
      name: 'outdoor-patio',
      displayName: 'Outdoor Patio',
      tables: OUTDOOR_TABLES,
      color: '#32CD32',
    },
  ],
  specialAreas: {
    kitchen: { x: 400, y: 300, width: 120, height: 80 },
    bar: { x: 450, y: 50, width: 100, height: 40 },
    entrance: { x: 50, y: 50, width: 60, height: 40 },
  },
};

// Calculate table summary
const calculateTableSummary = (): TableSummary => {
  const allTables = [
    ...MAIN_DINING_TABLES,
    ...BAR_TABLES,
    ...VIP_TABLES,
    ...OUTDOOR_TABLES,
  ];

  const total = allTables.length;
  const occupied = allTables.filter(t => t.status === 'occupied').length;
  const available = allTables.filter(t => t.status === 'available').length;
  const cleaning = allTables.filter(t => t.status === 'cleaning').length;
  const reserved = allTables.filter(t => t.status === 'reserved').length;
  const occupancyRate = total > 0 ? (occupied / total) * 100 : 0;

  return {
    total,
    occupied,
    available,
    cleaning,
    reserved,
    occupancyRate: Math.round(occupancyRate * 10) / 10, // Round to 1 decimal
  };
};

// Complete dashboard data
export const TABLES_DASHBOARD_DATA: TablesDashboardData = {
  floorPlan: MOCK_FLOOR_PLAN,
  summary: calculateTableSummary(),
  lastUpdated: new Date().toISOString(),
};

// Utility functions
export const getTableById = (tableId: string): Table | undefined => {
  const allTables = [
    ...MAIN_DINING_TABLES,
    ...BAR_TABLES,
    ...VIP_TABLES,
    ...OUTDOOR_TABLES,
  ];
  return allTables.find(table => table.id === tableId);
};

export const getTablesByStatus = (status: Table['status']): Table[] => {
  const allTables = [
    ...MAIN_DINING_TABLES,
    ...BAR_TABLES,
    ...VIP_TABLES,
    ...OUTDOOR_TABLES,
  ];
  return allTables.filter(table => table.status === status);
};

export const getTablesBySection = (section: Table['section']): Table[] => {
  switch (section) {
    case 'main-dining':
      return MAIN_DINING_TABLES;
    case 'bar':
      return BAR_TABLES;
    case 'vip':
      return VIP_TABLES;
    case 'outdoor-patio':
      return OUTDOOR_TABLES;
    default:
      return [];
  }
};

export const getOccupiedTables = (): Table[] => {
  return getTablesByStatus('occupied');
};

export const getAvailableTables = (): Table[] => {
  return getTablesByStatus('available');
};

export const getLongestWaitingTable = (): Table | undefined => {
  const occupiedTables = getOccupiedTables();
  return occupiedTables.reduce((longest, current) => {
    const currentDuration = current.serviceDuration || 0;
    const longestDuration = longest?.serviceDuration || 0;
    return currentDuration > longestDuration ? current : longest;
  }, undefined as Table | undefined);
};

export default TABLES_DASHBOARD_DATA;
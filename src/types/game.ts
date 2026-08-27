export interface Player {
  id: string;
  name: string;
  avatar: string;
  balance: number;
  color: string;
  isBank: boolean;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  fromId: string;
  toId: string;
  amount: number;
  type: 'transfer' | 'tax' | 'rent' | 'salary' | 'purchase' | 'loan' | 'fine';
  description: string;
  timestamp: Date;
}

export interface GameState {
  gameId: string;
  players: Player[];
  transactions: Transaction[];
  bankBalance: number;
  isGameActive: boolean;
  createdAt: Date;
}

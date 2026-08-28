import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import { generateRoomCode } from '@/lib/roomCode';
import { playCashSound } from '@/lib/sounds';
import type { Player, Transaction } from '@/types/game';

const INITIAL_BANK_BALANCE = 1000000;
const INITIAL_PLAYER_BALANCE = 150000;

const PLAYER_COLORS = [
  '#EF4444', '#3B82F6', '#22C55E', '#F59E0B',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
];

const AVATARS = ['🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸', '🦉'];

// ----- Mapeamento entre linhas do banco (snake_case) e o app (camelCase) -----

function mapPlayerRow(row: any): Player {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    balance: Number(row.balance),
    color: row.color,
    isBank: row.is_bank,
    createdAt: new Date(row.created_at),
  };
}

function mapTransactionRow(row: any): Transaction {
  return {
    id: row.id,
    fromId: row.from_player_id,
    toId: row.to_player_id,
    amount: Number(row.amount),
    type: row.type,
    description: row.description ?? '',
    timestamp: new Date(row.created_at),
  };
}

function myPlayerStorageKey(gameId: string) {
  return `imboli-bank-my-player-${gameId}`;
}

interface GameStore {
  gameId: string | null;
  roomCode: string | null;
  players: Player[];
  transactions: Transaction[];
  bankBalance: number;
  isGameActive: boolean;
  isLoading: boolean;
  error: string | null;
  myPlayerId: string | null; // qual jogador ESTE dispositivo controla

  // Actions
  createGame: () => Promise<string>; // retorna o código da sala
  joinGame: (code: string) => Promise<boolean>; // retorna se conseguiu entrar
  leaveGame: () => void;
  setMyPlayerId: (id: string | null) => void;
  addPlayer: (name: string) => Promise<string | undefined>; // retorna o id do novo jogador
  removePlayer: (id: string) => Promise<void>;
  transfer: (fromId: string, toId: string, amount: number, type: Transaction['type'], description: string) => Promise<void>;
  payTax: (fromId: string, amount: number, description: string) => Promise<void>;
  payRent: (fromId: string, toId: string, amount: number, property: string) => Promise<void>;
  buyProperty: (buyerId: string, amount: number, property: string) => Promise<void>;
  getPlayer: (id: string) => Player | undefined;
  getBank: () => Player | undefined;
  resetGame: () => Promise<void>;
}

let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

async function fetchPlayersAndTransactions(gameId: string) {
  const [{ data: playersData }, { data: txData }] = await Promise.all([
    supabase.from('players').select('*').eq('game_id', gameId).order('created_at'),
    supabase.from('transactions').select('*').eq('game_id', gameId).order('created_at', { ascending: false }),
  ]);

  return {
    players: (playersData ?? []).map(mapPlayerRow),
    transactions: (txData ?? []).map(mapTransactionRow),
  };
}

function subscribeToGame(gameId: string, onChange: () => void) {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
  }

  realtimeChannel = supabase
    .channel(`game-${gameId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `game_id=eq.${gameId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `game_id=eq.${gameId}` }, onChange)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'transactions', filter: `game_id=eq.${gameId}` },
      (payload) => {
        // Toca o som de "cha-ching" só no celular de quem RECEBEU o valor.
        const myPlayerId = useGameStore.getState().myPlayerId;
        if (myPlayerId && payload.new?.to_player_id === myPlayerId) {
          playCashSound();
        }
      },
    )
    .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, onChange)
    .subscribe();

  return realtimeChannel;
}

export const useGameStore = create<GameStore>()((set, get) => ({
  gameId: null,
  roomCode: null,
  players: [],
  transactions: [],
  bankBalance: INITIAL_BANK_BALANCE,
  isGameActive: false,
  isLoading: false,
  error: null,
  myPlayerId: null,

  setMyPlayerId: (id: string | null) => {
    const { gameId } = get();
    if (gameId) {
      if (id) {
        localStorage.setItem(myPlayerStorageKey(gameId), id);
      } else {
        localStorage.removeItem(myPlayerStorageKey(gameId));
      }
    }
    set({ myPlayerId: id });
  },

  createGame: async () => {
    set({ isLoading: true, error: null });
    const code = generateRoomCode();

    const { data: game, error } = await supabase
      .from('games')
      .insert({ code, bank_balance: INITIAL_BANK_BALANCE, is_active: true })
      .select()
      .single();

    if (error || !game) {
      set({ isLoading: false, error: 'Não foi possível criar a sala. Tente novamente.' });
      throw error;
    }

    const { data: bankPlayer } = await supabase
      .from('players')
      .insert({
        game_id: game.id,
        name: 'Banco',
        avatar: '🏦',
        balance: INITIAL_BANK_BALANCE,
        color: '#10B981',
        is_bank: true,
      })
      .select()
      .single();

    set({
      gameId: game.id,
      roomCode: game.code,
      players: bankPlayer ? [mapPlayerRow(bankPlayer)] : [],
      transactions: [],
      bankBalance: INITIAL_BANK_BALANCE,
      isGameActive: true,
      isLoading: false,
      myPlayerId: null,
    });

    subscribeToGame(game.id, async () => {
      const { players, transactions } = await fetchPlayersAndTransactions(game.id);
      set({ players, transactions });
    });

    return code;
  },

  joinGame: async (code: string) => {
    set({ isLoading: true, error: null });
    const normalizedCode = code.trim().toUpperCase();

    const { data: game, error } = await supabase
      .from('games')
      .select('*')
      .eq('code', normalizedCode)
      .eq('is_active', true)
      .single();

    if (error || !game) {
      set({ isLoading: false, error: 'Sala não encontrada. Confira o código.' });
      return false;
    }

    const { players, transactions } = await fetchPlayersAndTransactions(game.id);
    const savedMyPlayerId = localStorage.getItem(myPlayerStorageKey(game.id));
    const restoredMyPlayerId = players.some(p => p.id === savedMyPlayerId) ? savedMyPlayerId : null;

    set({
      gameId: game.id,
      roomCode: game.code,
      players,
      transactions,
      bankBalance: Number(game.bank_balance),
      isGameActive: true,
      isLoading: false,
      myPlayerId: restoredMyPlayerId,
    });

    subscribeToGame(game.id, async () => {
      const { players, transactions } = await fetchPlayersAndTransactions(game.id);
      const { data: g } = await supabase.from('games').select('bank_balance').eq('id', game.id).single();
      set({ players, transactions, bankBalance: g ? Number(g.bank_balance) : get().bankBalance });
    });

    return true;
  },

  leaveGame: () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
    set({
      gameId: null,
      roomCode: null,
      players: [],
      transactions: [],
      bankBalance: INITIAL_BANK_BALANCE,
      isGameActive: false,
      myPlayerId: null,
    });
  },

  addPlayer: async (name: string) => {
    const state = get();
    if (!state.gameId) return undefined;

    const playerIndex = state.players.filter(p => !p.isBank).length;

    const { data: newPlayer } = await supabase
      .from('players')
      .insert({
        game_id: state.gameId,
        name,
        avatar: AVATARS[playerIndex % AVATARS.length],
        balance: INITIAL_PLAYER_BALANCE,
        color: PLAYER_COLORS[playerIndex % PLAYER_COLORS.length],
        is_bank: false,
      })
      .select()
      .single();

    const newBankBalance = state.bankBalance - INITIAL_PLAYER_BALANCE;
    await supabase.from('games').update({ bank_balance: newBankBalance }).eq('id', state.gameId);
    // Realtime cuida de atualizar o state local (lista de players) automaticamente

    return newPlayer?.id as string | undefined;
  },

  removePlayer: async (id: string) => {
    const state = get();
    const player = state.players.find(p => p.id === id);
    if (!player || player.isBank || !state.gameId) return;

    await supabase.from('players').delete().eq('id', id);

    const newBankBalance = state.bankBalance + player.balance;
    await supabase.from('games').update({ bank_balance: newBankBalance }).eq('id', state.gameId);
  },

  transfer: async (fromId, toId, amount, type, description) => {
    const state = get();
    if (!state.gameId) return;

    const fromPlayer = state.players.find(p => p.id === fromId);
    const toPlayer = state.players.find(p => p.id === toId);
    if (!fromPlayer || !toPlayer || fromPlayer.balance < amount) return;

    await supabase.from('transactions').insert({
      game_id: state.gameId,
      from_player_id: fromId,
      to_player_id: toId,
      amount,
      type,
      description,
    });

    await Promise.all([
      supabase.from('players').update({ balance: fromPlayer.balance - amount }).eq('id', fromId),
      supabase.from('players').update({ balance: toPlayer.balance + amount }).eq('id', toId),
    ]);

    if (fromPlayer.isBank || toPlayer.isBank) {
      const delta = fromPlayer.isBank ? -amount : amount;
      await supabase.from('games').update({ bank_balance: state.bankBalance + delta }).eq('id', state.gameId);
    }
  },

  payTax: async (fromId, amount, description) => {
    const bank = get().getBank();
    if (!bank) return;
    await get().transfer(fromId, bank.id, amount, 'tax', description);
  },

  payRent: async (fromId, toId, amount, property) => {
    await get().transfer(fromId, toId, amount, 'rent', `Aluguel: ${property}`);
  },

  buyProperty: async (buyerId, amount, property) => {
    const bank = get().getBank();
    if (!bank) return;
    await get().transfer(buyerId, bank.id, amount, 'purchase', `Compra: ${property}`);
  },

  getPlayer: (id: string) => get().players.find(p => p.id === id),

  getBank: () => get().players.find(p => p.isBank),

  resetGame: async () => {
    const state = get();
    if (state.gameId) {
      await supabase.from('games').update({ is_active: false }).eq('id', state.gameId);
    }
    get().leaveGame();
  },
}));
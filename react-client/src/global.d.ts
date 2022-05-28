interface Room {
  id: string;
  answers: string[];
  maxPlayers: number;
  players: string[];
  roomType: "public" | "private";
  started: boolean;
  round: number;
}

interface Player {
  guessed: boolean;
  name: string;
  uid: string;
  points: number;
  ready: boolean;
  role: "user" | "creator";
  socketId: string;
  prevSocketId: string;
  guesses: string[];
}

type RoomStatuses =
  | "exists"
  | "room_not_found"
  | "user_not_found"
  | "room_full"
  | "room_finished"
  | "room_started"
  | "players_not_ready"
  | undefined;
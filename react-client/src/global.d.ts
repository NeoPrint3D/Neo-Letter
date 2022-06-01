
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
  signedIn: boolean;
  guesses: string[];
  wins?: number;
}

interface UserProfile {
  username: string;
  uid: string;
  profilePic: string;
  wins: number;
  losses: number;
  gamesPlayed: number;
  points: number;
  createdAt: any;
  updatedAt: any;
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

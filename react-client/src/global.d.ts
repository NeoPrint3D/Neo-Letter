type Timestamp = import("firebase/firestore").Timestamp;

interface Prefences {
  showReminder: boolean;
}
interface Room {
  id: string;
  answers: string[];
  maxPlayers: number;
  players: string[];
  usernames: string[];
  roomType: "public" | "private";
  started: boolean;
  allowLateJoiners: boolean;
  allowMessages: boolean;
  round: number;
  customWords: boolean;
  allowProfanity: boolean;
}

interface GamePlayer {
  guessed: boolean;
  name: string;
  uid: string;
  points: number;
  ready: boolean;
  role: "user" | "creator";
  signedIn: boolean;
  guesses: string[];
  wins?: number;
  gamesPlayed?: number;
  totalPoints?: number;
}

interface UserProfile {
  username: string;
  uid: string;
  profilePic: string;
  wins: number;
  gamesPlayed: number;
  totalPoints: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastRoom: string;
  email: string;
}

interface Message {
  messengerID: string;
  messengerUsername: string;
  content: string;
  createdAt: Timestamp;
  reversedCreatedAt: number;
  readBy: string[];
  id: string;
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

import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { 
  listMine, 
  listPublic,
  create, 
  joinByCode, 
  getCompetition,
  submitScore, 
  complete, 
  getUserCompetitions,
  // getAllCompetitions,
  getGlobalLeaderboard ,
  // submitResults,
  // getCompetitionByShareId,
  inviteByUsername,
  acceptInvite,
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  getGameHistory,
  getPendingInvites,
  getSentInvites,
  declineInvite,
  // joinById,
  // updateScore
} from "../controllers/competition.controller.js";

export const competitions = Router();

competitions.get("/public", listPublic);

// competitions.get("/", requireAuth, getAllCompetitions);
competitions.get("/mine", requireAuth, listMine);
// competitions.get("/my-competitions", requireAuth, getMyCompetitions);
competitions.get("/participated-competitions", requireAuth, getUserCompetitions);

competitions.post("/create", requireAuth, create);
competitions.post("/:code/join", requireAuth, joinByCode);
// competitions.post("/:competitionId/join", requireAuth, joinById);

competitions.post("/:code/score", requireAuth, submitScore);
// competitions.post("/:competitionId/score", requireAuth, updateScore);
competitions.post("/:code/complete", requireAuth, complete);

// Leaderboards & results
// competitions.post("/:competitionId/results", requireAuth, submitResults);
competitions.get("/leaderboard", requireAuth, getGlobalLeaderboard);

// Shareable competitions
// competitions.get("/share/:shareId", requireAuth, getCompetitionByShareId);

// Invites
competitions.get("/invites", requireAuth, getPendingInvites);
competitions.get("/invites/sent", requireAuth, getSentInvites);
competitions.post("/invite", requireAuth, inviteByUsername);
competitions.post("/invites/:inviteId/accept", requireAuth, acceptInvite);
competitions.post("/invites/:inviteId/decline", requireAuth, declineInvite);

// Friends & requests
competitions.get("/friends", requireAuth, getFriends);
competitions.get("/friend-requests", requireAuth, getFriendRequests);
competitions.post("/friend-requests", requireAuth, sendFriendRequest);
competitions.post("/friend-requests/:requestId/accept", requireAuth, acceptFriendRequest);

// Game history
competitions.get("/game-history", requireAuth, getGameHistory);

competitions.get("/:code", getCompetition);


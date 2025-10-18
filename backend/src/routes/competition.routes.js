// src/routes/competition.routes.js
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
  getGlobalLeaderboard,
  inviteByUsername,
  acceptInvite,
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getGameHistory,
  getPendingInvites,
  getSentInvites,
  declineInvite,
  leaveCompetition, // NEW
  getTimeRemaining // NEW
} from "../controllers/competition.controller.js";

export const competitions = Router();

competitions.get("/public", listPublic);
competitions.get("/mine", requireAuth, listMine);
competitions.get("/participated-competitions", requireAuth, getUserCompetitions);

// Leaderboards & results
competitions.get("/leaderboard", requireAuth, getGlobalLeaderboard);

competitions.get("/invites", requireAuth, getPendingInvites);
competitions.get("/invites/sent", requireAuth, getSentInvites);

competitions.get("/friends", requireAuth, getFriends);
competitions.get("/friend-requests", requireAuth, getFriendRequests);

// Game history
competitions.get("/game-history", requireAuth, getGameHistory);


competitions.post("/create", requireAuth, create);
competitions.post("/:code/join", requireAuth, joinByCode);
competitions.post("/:code/leave", requireAuth, leaveCompetition); // NEW
competitions.get("/:code/time", getTimeRemaining); // NEW
competitions.post("/:code/score", requireAuth, submitScore);
competitions.post("/:code/complete", requireAuth, complete);

// Invites
competitions.post("/invite", requireAuth, inviteByUsername);
competitions.post("/invites/:inviteId/accept", requireAuth, acceptInvite);
competitions.post("/invites/:inviteId/decline", requireAuth, declineInvite);

// Friends & requests

competitions.post("/friend-requests", requireAuth, sendFriendRequest);
competitions.post("/friend-requests/:requestId/accept", requireAuth, acceptFriendRequest);
competitions.post("/friend-requests/:requestId/decline", requireAuth, declineFriendRequest);


competitions.get("/:code", getCompetition);
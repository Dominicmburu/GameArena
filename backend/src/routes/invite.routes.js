import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createInvite, acceptInvite, listMyInvites } from "../controllers/invite.controller.js";

export const invite = Router();

invite.use(requireAuth);
invite.get("/mine", listMyInvites);
invite.post("/:competitionId", createInvite);
invite.post("/accept/:code", acceptInvite);
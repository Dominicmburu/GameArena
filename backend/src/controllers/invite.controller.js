import { prisma } from "../prisma.js";
import { shortCode } from "../utils/id.js";
import { env } from "../config/env.js";

export const createInvite = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const competitionId = req.params.competitionId;
    
    const competition = await prisma.competition.findUnique({ where: { id: competitionId } });
    if (!competition) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Competition not found" });
    }
    
    if (competition.creatorId !== uid) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Only the creator can create invites" });
    }

    const code = shortCode();
    const invite = await prisma.invite.create({ 
      data: { 
        competitionId: competition.id, 
        inviterId: uid, 
        code 
      } 
    });

    res.json({ 
      code, 
      link: `${env.clientOrigin}/join/${code}`, 
      inviteId: invite.id 
    });
  } catch (e) {
    next(e);
  }
};

export const acceptInvite = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const code = req.params.code.toUpperCase();
    
    const invite = await prisma.invite.findUnique({ 
      where: { code },
      include: { Competition: true }
    });
    
    if (!invite) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Invite not found" });
    }

    if (invite.accepted) {
      return res.status(400).json({ error: "ALREADY_ACCEPTED", message: "Invite has already been accepted" });
    }

    // Check if competition is still joinable
    if (invite.Competition.status !== "UPCOMING") {
      return res.status(400).json({ error: "COMPETITION_NOT_JOINABLE", message: "Competition is no longer accepting players" });
    }

    await prisma.invite.update({ 
      where: { id: invite.id }, 
      data: { accepted: true, inviteeId: uid } 
    });

    res.json({ 
      ok: true, 
      competitionCode: invite.Competition.code,
      competitionTitle: invite.Competition.title
    });
  } catch (e) {
    next(e);
  }
};

export const listMyInvites = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    
    const invites = await prisma.invite.findMany({
      where: { inviterId: uid },
      include: {
        Competition: {
          select: {
            title: true,
            code: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(invites);
  } catch (e) {
    next(e);
  }
};
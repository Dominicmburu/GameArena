import { customAlphabet } from "nanoid";

const nanoId = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

export const shortCode = () => nanoId();

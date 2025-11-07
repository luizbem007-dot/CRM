import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { findUserByEmail, verifyPassword } from "../services/userStore";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret";
const JWT_EXPIRES = process.env.JWT_EXPIRES ?? "7d";

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ message: "E-mail e senha são obrigatórios" });

    // Mock login: accept any credentials and return a token
    const user = { id: "mock-user", email, name: email.split('@')[0], role: 'agent' };
    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return res.status(200).json({ token, user: { name: user.name, role: user.role } });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};

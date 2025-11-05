import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { findUserByEmail, verifyPassword } from "../services/userStore";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret";
const JWT_EXPIRES = process.env.JWT_EXPIRES ?? "7d";

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ message: "E-mail e senha são obrigatórios" });

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Usuário ou senha inválidos" });

    if (!user.active) return res.status(403).json({ message: "Conta desativada" });

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Usuário ou senha inválidos" });

    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    return res.status(200).json({ token, user: { name: user.name, role: user.role } });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};

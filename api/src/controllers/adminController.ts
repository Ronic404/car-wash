import { Request, Response } from 'express';
import adminService from '../services/adminService';
import { z } from 'zod';

/**
 * Схемы валидации для администраторов
 */
const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().optional(),
  }),
});

/**
 * Контроллер для работы с администраторами
 */
class AdminController {
  /**
   * Регистрация нового администратора
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const admin = await adminService.registerAdmin(req.body);
      res.status(201).json({
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Вход администратора
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await adminService.loginAdmin(email, password);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * Получение информации о текущем администраторе
   */
  async getMe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(401).json({ error: 'Не авторизован' });
        return;
      }

      const admin = await adminService.getAdminById(req.admin.adminId);
      res.json(admin);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}

export { loginSchema, registerSchema };
export default new AdminController();


import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';

/**
 * Сервис для работы с администраторами
 */
class AdminService {
  /**
   * Регистрация нового администратора
   */
  async registerAdmin(data: {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
  }) {
    try {
      // Проверяем, существует ли уже администратор с таким email
      const existingAdmin = await prisma.adminUser.findUnique({
        where: { email: data.email },
      });

      if (existingAdmin) {
        throw new Error('Администратор с таким email уже существует');
      }

      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const admin = await prisma.adminUser.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });

      logger.info('Создан новый администратор', { adminId: admin.id });
      return admin;
    } catch (error) {
      logger.error('Ошибка регистрации администратора', { error, email: data.email });
      throw error;
    }
  }

  /**
   * Вход администратора
   */
  async loginAdmin(email: string, password: string) {
    try {
      const admin = await prisma.adminUser.findUnique({
        where: { email },
      });

      if (!admin) {
        throw new Error('Неверный email или пароль');
      }

      if (!admin.isActive) {
        throw new Error('Аккаунт администратора деактивирован');
      }

      // Проверяем пароль
      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (!isPasswordValid) {
        throw new Error('Неверный email или пароль');
      }

      // Обновляем время последнего входа
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { lastLogin: new Date() },
      });

      // Генерируем JWT токен
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET не установлен');
      }

      const token = jwt.sign(
        {
          adminId: admin.id,
          email: admin.email,
        },
        secret,
        {
          expiresIn: '7d',
        }
      );

      logger.info('Администратор вошел в систему', { adminId: admin.id });
      return {
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
        },
      };
    } catch (error) {
      logger.warn('Ошибка входа администратора', { error, email });
      throw error;
    }
  }

  /**
   * Получение администратора по ID
   */
  async getAdminById(id: string) {
    try {
      const admin = await prisma.adminUser.findUnique({
        where: { id },
      });

      if (!admin) {
        throw new Error('Администратор не найден');
      }

      return {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin,
      };
    } catch (error) {
      logger.error('Ошибка получения администратора', { error, adminId: id });
      throw error;
    }
  }
}

export default new AdminService();


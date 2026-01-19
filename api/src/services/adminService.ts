import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';

/**
 * Сервис для работы с администраторами
 */
class AdminService {
  /**
   * Публичная регистрация администратора (создаёт заявку).
   * - если админов ещё нет (первый запуск) — создаём MAIN + активный (bootstrap)
   * - иначе создаём REGULAR + неактивный (ожидает подтверждения main-админом)
   */
  async registerAdminRequest(data: {
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

      const adminsCount = await prisma.adminUser.count();
      const isBootstrap = adminsCount === 0;

      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const admin = await prisma.adminUser.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: isBootstrap ? 'MAIN' : 'REGULAR',
          isActive: isBootstrap ? true : false,
        },
      });

      logger.info('Создан новый администратор (register request)', { adminId: admin.id, isBootstrap });
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
        // В нашей логике isActive=false обычно означает "ожидает подтверждения"
        throw new Error('Аккаунт ожидает подтверждения main-администратором');
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
          role: admin.role,
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
        role: admin.role,
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin,
      };
    } catch (error) {
      logger.error('Ошибка получения администратора', { error, adminId: id });
      throw error;
    }
  }

  async getAllAdmins() {
    const admins = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        role: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: [{ createdAt: 'desc' }],
    });
    return admins;
  }

  async getRegistrationRequests() {
    const admins = await prisma.adminUser.findMany({
      where: { isActive: false },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        role: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: 'desc' }],
    });
    return admins;
  }

  async approveAdmin(id: string) {
    const admin = await prisma.adminUser.update({
      where: { id },
      data: { isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        role: true,
        createdAt: true,
        lastLogin: true,
      },
    });
    return admin;
  }

  async deleteAdmin(id: string) {
    const admin = await prisma.adminUser.findUnique({
      where: { id },
      select: { id: true, role: true, isActive: true },
    });
    if (!admin) {
      throw new Error('Администратор не найден');
    }

    if (admin.role === 'MAIN' && admin.isActive) {
      const mainCount = await prisma.adminUser.count({
        where: { role: 'MAIN', isActive: true },
      });
      if (mainCount <= 1) {
        throw new Error('Нельзя удалить последнего main-администратора');
      }
    }

    await prisma.adminUser.delete({ where: { id } });
    logger.info('Администратор удалён', { adminId: id });
  }

  async setAdminRole(id: string, role: 'MAIN' | 'REGULAR') {
    const admin = await prisma.adminUser.findUnique({
      where: { id },
      select: { id: true, role: true, isActive: true },
    });
    if (!admin) {
      throw new Error('Администратор не найден');
    }

    // Нельзя "снять main" с последнего активного main
    if (admin.role === 'MAIN' && role === 'REGULAR' && admin.isActive) {
      const mainCount = await prisma.adminUser.count({
        where: { role: 'MAIN', isActive: true },
      });
      if (mainCount <= 1) {
        throw new Error('Нельзя понизить последнего main-администратора');
      }
    }

    const updated = await prisma.adminUser.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        role: true,
        createdAt: true,
        lastLogin: true,
      },
    });
    logger.info('Роль администратора изменена', { adminId: id, role });
    return updated;
  }
}

export default new AdminService();


import { prisma } from '@/config/database';
import logger from '@/utils/logger';

export interface UpdateSettingsDTO {
  // Configurações Gerais
  currency?: string;
  dateFormat?: string;
  language?: string;
  timezone?: string;
  
  // Preferências de Interface
  theme?: string;
  showBalance?: boolean;
  autoApplyRules?: boolean;
  
  // Notificações
  notifyBillsDue?: boolean;
  notifyBudgetExceeded?: boolean;
  notifyRecurrences?: boolean;
  billsDueDays?: number;
}

class SettingsService {
  /**
   * Busca configurações do usuário (cria se não existir)
   */
  async getSettings(userId: string) {
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    // Se não existir, criar com valores padrão
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId },
      });
      logger.info(`Configurações criadas para usuário: ${userId}`);
    }

    return settings;
  }

  /**
   * Atualiza configurações do usuário
   */
  async updateSettings(userId: string, data: UpdateSettingsDTO) {
    // Validações
    if (data.currency && !this.isValidCurrency(data.currency)) {
      throw new Error('Moeda inválida');
    }

    if (data.dateFormat && !this.isValidDateFormat(data.dateFormat)) {
      throw new Error('Formato de data inválido');
    }

    if (data.theme && !['light', 'dark', 'auto'].includes(data.theme)) {
      throw new Error('Tema inválido');
    }

    if (data.billsDueDays !== undefined && (data.billsDueDays < 0 || data.billsDueDays > 30)) {
      throw new Error('Dias de antecedência deve estar entre 0 e 30');
    }

    // Garantir que as configurações existem
    await this.getSettings(userId);

    // Atualizar
    const settings = await prisma.userSettings.update({
      where: { userId },
      data,
    });

    logger.info(`Configurações atualizadas para usuário: ${userId}`);
    return settings;
  }

  /**
   * Reseta configurações para valores padrão
   */
  async resetSettings(userId: string) {
    const settings = await prisma.userSettings.update({
      where: { userId },
      data: {
        currency: 'BRL',
        dateFormat: 'DD/MM/YYYY',
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        theme: 'light',
        showBalance: true,
        autoApplyRules: true,
        notifyBillsDue: true,
        notifyBudgetExceeded: true,
        notifyRecurrences: true,
        billsDueDays: 3,
      },
    });

    logger.info(`Configurações resetadas para usuário: ${userId}`);
    return settings;
  }

  /**
   * Valida moeda
   */
  private isValidCurrency(currency: string): boolean {
    const validCurrencies = ['BRL', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'ARS', 'MXN'];
    return validCurrencies.includes(currency);
  }

  /**
   * Valida formato de data
   */
  private isValidDateFormat(format: string): boolean {
    const validFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY'];
    return validFormats.includes(format);
  }
}

export default new SettingsService();

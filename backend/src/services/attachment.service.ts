import { AttachableType } from '@prisma/client';
import { prisma } from '@/config/database';
import logger from '@/utils/logger';

export interface CreateAttachmentDTO {
  filename: string;
  title?: string;
  description?: string;
  mime: string;
  size: number;
  attachableType: AttachableType;
  attachableId: string;
}

export interface UpdateAttachmentDTO {
  title?: string;
  description?: string;
  uploaded?: boolean;
}

class AttachmentService {
  /**
   * Lista todos os attachments do usuário
   */
  async findAll(userId: string) {
    const attachments = await prisma.attachment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return attachments;
  }

  /**
   * Busca attachment por ID
   */
  async findById(attachmentId: string, userId: string) {
    const attachment = await prisma.attachment.findFirst({
      where: { id: attachmentId, userId },
    });

    if (!attachment) {
      throw new Error('Anexo não encontrado');
    }

    return attachment;
  }

  /**
   * Busca attachments de uma entidade
   */
  async findByEntity(
    userId: string,
    attachableType: AttachableType,
    attachableId: string
  ) {
    const attachments = await prisma.attachment.findMany({
      where: {
        userId,
        attachableType,
        attachableId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return attachments;
  }

  /**
   * Cria novo attachment
   */
  async create(userId: string, data: CreateAttachmentDTO) {
    const attachment = await prisma.attachment.create({
      data: {
        filename: data.filename,
        title: data.title || null,
        description: data.description || null,
        mime: data.mime,
        size: data.size,
        attachableType: data.attachableType,
        attachableId: data.attachableId,
        userId,
      },
    });

    logger.info(`Novo anexo criado: ${attachment.filename} para usuário ${userId}`);
    return attachment;
  }

  /**
   * Atualiza attachment
   */
  async update(attachmentId: string, userId: string, data: UpdateAttachmentDTO) {
    await this.findById(attachmentId, userId);

    const attachment = await prisma.attachment.update({
      where: { id: attachmentId },
      data,
    });

    logger.info(`Anexo atualizado: ${attachment.filename}`);
    return attachment;
  }

  /**
   * Marca attachment como uploaded
   */
  async markAsUploaded(attachmentId: string, userId: string) {
    return this.update(attachmentId, userId, { uploaded: true });
  }

  /**
   * Exclui attachment
   */
  async delete(attachmentId: string, userId: string) {
    await this.findById(attachmentId, userId);

    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    logger.info(`Anexo excluído: ${attachmentId}`);
  }

  /**
   * Obtém estatísticas dos attachments
   */
  async getStatistics(userId: string) {
    const attachments = await prisma.attachment.findMany({
      where: { userId },
    });

    const total = attachments.length;
    const uploaded = attachments.filter((a) => a.uploaded).length;
    const pending = total - uploaded;
    const totalSize = attachments.reduce((sum, a) => sum + a.size, 0);

    // Agrupa por tipo
    const byType = attachments.reduce((acc, a) => {
      acc[a.attachableType] = (acc[a.attachableType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      uploaded,
      pending,
      totalSize,
      totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
      byType,
    };
  }
}

export default new AttachmentService();

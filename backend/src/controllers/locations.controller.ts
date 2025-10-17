import { Response } from 'express';
import { AuthRequest } from '@/types/express';
import locationService from '@/services/location.service';
import logger from '@/utils/logger';

class LocationsController {
  /**
   * GET /api/locations/:id - Busca localização por ID
   */
  async getById(req: AuthRequest, res: Response) {
    try {
      const location = await locationService.findById(req.params['id']!);
      res.json({ success: true, data: location });
    } catch (error) {
      logger.error('Erro ao buscar localização:', error);
      res.status(404).json({ success: false, message: 'Localização não encontrada' });
    }
  }

  /**
   * POST /api/locations - Cria ou atualiza localização
   */
  async upsert(req: AuthRequest, res: Response) {
    try {
      const location = await locationService.upsert(req.body);
      res.json({ success: true, data: location, message: 'Localização salva com sucesso' });
    } catch (error) {
      logger.error('Erro ao salvar localização:', error);
      const message = error instanceof Error ? error.message : 'Erro ao salvar localização';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/locations/:id - Exclui localização
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      await locationService.delete(req.params['id']!);
      res.json({ success: true, message: 'Localização excluída com sucesso' });
    } catch (error) {
      logger.error('Erro ao excluir localização:', error);
      const message = error instanceof Error ? error.message : 'Erro ao excluir localização';
      res.status(400).json({ success: false, message });
    }
  }

  /**
   * GET /api/locations/nearby - Busca localizações próximas
   */
  async findNearby(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { lat, lng, radius } = req.query;
      
      if (!lat || !lng) {
        res.status(400).json({ 
          success: false, 
          message: 'Parâmetros lat e lng são obrigatórios' 
        });
        return;
      }

      const radiusKm = radius ? parseFloat(radius as string) : 5;
      
      const locations = await locationService.findNearby(
        parseFloat(lat as string),
        parseFloat(lng as string),
        radiusKm
      );
      
      res.json({ success: true, data: locations });
    } catch (error) {
      logger.error('Erro ao buscar localizações próximas:', error);
      const message = error instanceof Error ? error.message : 'Erro ao buscar localizações próximas';
      res.status(400).json({ success: false, message });
    }
  }
}

export default new LocationsController();

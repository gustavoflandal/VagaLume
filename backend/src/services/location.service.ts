import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/config/database';
import logger from '@/utils/logger';

type LocatableTypeEnum = 'TRANSACTION' | 'TAG';

export interface CreateLocationDTO {
  latitude: number;
  longitude: number;
  zoomLevel?: number;
  locatableType: LocatableTypeEnum;
  locatableId: string;
}

export interface UpdateLocationDTO {
  latitude?: number;
  longitude?: number;
  zoomLevel?: number;
}

class LocationService {
  /**
   * Busca location por ID
   */
  async findById(locationId: string) {
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new Error('Localização não encontrada');
    }

    return location;
  }

  /**
   * Busca location de uma entidade
   */
  async findByEntity(locatableType: LocatableTypeEnum, locatableId: string) {
    const location = await prisma.location.findFirst({
      where: {
        locatableType,
        locatableId,
      },
    });

    return location;
  }

  /**
   * Cria ou atualiza location
   */
  async upsert(data: CreateLocationDTO) {
    // Verifica se já existe
    const existing = await this.findByEntity(
      data.locatableType,
      data.locatableId
    );

    if (existing) {
      const updatePayload: UpdateLocationDTO = {
        latitude: data.latitude,
        longitude: data.longitude,
        ...(data.zoomLevel !== undefined ? { zoomLevel: data.zoomLevel } : {}),
      };

      return this.update(existing.id, updatePayload);
    }

    // Cria nova
    const location = await prisma.location.create({
      data: {
        latitude: new Decimal(data.latitude),
        longitude: new Decimal(data.longitude),
        zoomLevel: data.zoomLevel ?? 10,
        locatableType: data.locatableType,
        locatableId: data.locatableId,
      },
    });

    logger.info(`Nova localização criada para ${data.locatableType}:${data.locatableId}`);
    return location;
  }

  /**
   * Atualiza location
   */
  async update(locationId: string, data: UpdateLocationDTO) {
    const updateData: any = {};
    if (data.latitude !== undefined) updateData.latitude = new Decimal(data.latitude);
    if (data.longitude !== undefined) updateData.longitude = new Decimal(data.longitude);
    if (data.zoomLevel !== undefined) updateData.zoomLevel = data.zoomLevel;

    const location = await prisma.location.update({
      where: { id: locationId },
      data: updateData,
    });

    logger.info(`Localização atualizada: ${locationId}`);
    return location;
  }

  /**
   * Exclui location
   */
  async delete(locationId: string) {
    await prisma.location.delete({
      where: { id: locationId },
    });

    logger.info(`Localização excluída: ${locationId}`);
  }

  /**
   * Busca localizações próximas (raio em km)
   */
  async findNearby(latitude: number, longitude: number, radiusKm = 5) {
    // Cálculo aproximado de graus por km
    const kmPerDegree = 111;
    const deltaLat = radiusKm / kmPerDegree;
    const deltaLon = radiusKm / (kmPerDegree * Math.cos((latitude * Math.PI) / 180));

    const locations = await prisma.location.findMany({
      where: {
        latitude: {
          gte: new Decimal(latitude - deltaLat),
          lte: new Decimal(latitude + deltaLat),
        },
        longitude: {
          gte: new Decimal(longitude - deltaLon),
          lte: new Decimal(longitude + deltaLon),
        },
      },
    });

    const locationsWithinRadius: Array<
      (typeof locations)[number] & { distance: number }
    > = [];

    for (const loc of locations) {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        Number(loc.latitude),
        Number(loc.longitude)
      );

      if (distance <= radiusKm) {
        locationsWithinRadius.push({
          ...loc,
          distance,
        });
      }
    }

    locationsWithinRadius.sort((a, b) => a.distance - b.distance);

    return locationsWithinRadius;
  }

  /**
   * Calcula distância entre dois pontos (Haversine)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Raio da Terra em km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100;
  }
}

export default new LocationService();

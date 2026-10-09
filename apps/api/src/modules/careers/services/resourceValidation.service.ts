export enum ResourceValidationStatus {
  VERIFIED = 'VERIFIED',
  UNVERIFIED = 'UNVERIFIED',
  BROKEN = 'BROKEN',
  NEEDS_REVIEW = 'NEEDS_REVIEW'
}

export interface ResourceValidationRecord {
  url: string;
  status: ResourceValidationStatus;
  last_checked: Date;
  http_status: number | null;
  verification_source: string;
  verified_at: Date | null;
}

export class ResourceValidationService {
  /**
   * Admin/Dev Utility to validate a given URL.
   * Performs an HTTP HEAD/GET request to verify if the resource is still accessible.
   * Does NOT automatically replace URLs. Just flags them for the DB source of truth.
   */
  async validateResourceUrl(url: string): Promise<ResourceValidationRecord> {
    try {
      // In a Node.js 18+ environment, native fetch is available.
      // We use HEAD first to save bandwidth.
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow' }).catch(() => null);
      
      if (!response) {
        return {
          url,
          status: ResourceValidationStatus.BROKEN,
          last_checked: new Date(),
          http_status: null,
          verification_source: 'SYSTEM_VALIDATOR',
          verified_at: null
        };
      }

      const isHealthy = response.ok && response.status >= 200 && response.status < 400;

      return {
        url,
        status: isHealthy ? ResourceValidationStatus.VERIFIED : ResourceValidationStatus.BROKEN,
        last_checked: new Date(),
        http_status: response.status,
        verification_source: 'SYSTEM_VALIDATOR',
        verified_at: isHealthy ? new Date() : null
      };

    } catch (error) {
      return {
        url,
        status: ResourceValidationStatus.NEEDS_REVIEW,
        last_checked: new Date(),
        http_status: null,
        verification_source: 'SYSTEM_VALIDATOR',
        verified_at: null
      };
    }
  }

  /**
   * Batch process for a cron job or admin panel to validate catalogs.
   */
  async batchValidateCatalog(urls: string[]): Promise<ResourceValidationRecord[]> {
    const BATCH_SIZE = 5;
    const results: ResourceValidationRecord[] = [];

    // Process in smaller batches to avoid overwhelming the network
    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(url => this.validateResourceUrl(url))
      );
      results.push(...batchResults);
    }
    
    // In a real application, you would run an SQL update here:
    // UPDATE resources SET status = ?, http_status = ? WHERE url = ?
    
    return results;
  }
}

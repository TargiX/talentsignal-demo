import { Client } from "@opensearch-project/opensearch";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SearchIndexService {
  private readonly logger = new Logger(SearchIndexService.name);
  private readonly client?: Client;

  constructor(config: ConfigService) {
    const node = config.get<string>("OPENSEARCH_NODE");

    if (node) {
      this.client = new Client({ node });
    }
  }

  async searchProfiles(query: string) {
    if (!this.client || !query.trim()) {
      return [];
    }

    try {
      const response = await this.client.search({
        index: "profiles",
        body: {
          query: {
            multi_match: {
              query,
              fields: ["displayName^2", "intent", "bio", "tags"]
            }
          }
        }
      });

      return response.body.hits.hits.map((hit: any) => hit._source);
    } catch (error) {
      this.logger.warn(`OpenSearch fallback active: ${(error as Error).message}`);
      return [];
    }
  }
}

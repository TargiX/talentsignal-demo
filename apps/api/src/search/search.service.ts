import { Injectable } from "@nestjs/common";
import { SearchIndexService } from "../infra/search-index.service";
import { ProfilesService } from "../profiles/profiles.service";

@Injectable()
export class SearchService {
  constructor(
    private readonly searchIndex: SearchIndexService,
    private readonly profiles: ProfilesService
  ) {}

  async searchProfiles(query: string) {
    const indexed = await this.searchIndex.searchProfiles(query);

    if (indexed.length > 0) {
      return indexed;
    }

    const normalized = query.toLowerCase();
    const profiles = await this.profiles.discover({});

    return profiles.filter((profile) => {
      return [profile.displayName, profile.intent, profile.bio, ...profile.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }
}

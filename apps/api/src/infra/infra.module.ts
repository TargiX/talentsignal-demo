import { Global, Module } from "@nestjs/common";
import { AuditTrailService } from "./audit-trail.service";
import { CacheService } from "./cache.service";
import { DatabaseService } from "./database.service";
import { SearchIndexService } from "./search-index.service";

@Global()
@Module({
  providers: [AuditTrailService, CacheService, DatabaseService, SearchIndexService],
  exports: [AuditTrailService, CacheService, DatabaseService, SearchIndexService]
})
export class InfraModule {}

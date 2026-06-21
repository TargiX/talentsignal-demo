import { PutItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuditTrailService {
  private readonly logger = new Logger(AuditTrailService.name);
  private readonly client: DynamoDBClient;

  constructor(config: ConfigService) {
    this.client = new DynamoDBClient({
      region: config.get<string>("AWS_REGION") ?? "us-east-1",
      endpoint: config.get<string>("DYNAMODB_ENDPOINT"),
      credentials: {
        accessKeyId: config.get<string>("AWS_ACCESS_KEY_ID") ?? "local",
        secretAccessKey: config.get<string>("AWS_SECRET_ACCESS_KEY") ?? "local"
      }
    });
  }

  async record(eventName: string, payload: Record<string, unknown>) {
    try {
      await this.client.send(
        new PutItemCommand({
          TableName: "charforge-audit",
          Item: {
            pk: { S: `event#${eventName}` },
            sk: { S: new Date().toISOString() },
            payload: { S: JSON.stringify(payload) }
          }
        })
      );
    } catch (error) {
      this.logger.warn(`DynamoDB audit skipped: ${(error as Error).message}`);
    }
  }
}

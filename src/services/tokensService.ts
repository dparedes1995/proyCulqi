import { ResponseToken } from '../interfaces/responseToken';
import { RedisService } from './redisService';
import { RequestData } from '../interfaces/requestData';
import { Validation } from '../utils/validation';
import { APIGatewayProxyEvent, APIGatewayProxyEventHeaders } from 'aws-lambda';

export class TokensService {
    private readonly redisService: RedisService;

    constructor(redisService: RedisService) {
        this.redisService = redisService;
    }

    async createToken(event: APIGatewayProxyEvent): Promise<ResponseToken> {
        try {
            const requestBody: RequestData = JSON.parse(event.body || '{}') as RequestData;
            Validation.validateRequestData(requestBody);
            const token: string = await this.redisService.storeCardToken(requestBody);

            return {
                statusCode: 200,
                body: JSON.stringify({ token }),
            };
        } catch (error) {
            const errorMessage = (error as Error).message;
            return this.handleError(error as Error, errorMessage);
        }
    }

    async getCardDataByToken(event: APIGatewayProxyEvent): Promise<ResponseToken> {
        try {
            const token = this.extractTokenFromHeader(event.headers);

            if (!token) {
                return this.unauthorizedResponse();
            }

            const cardData = await this.redisService.getCardDataByToken(token);

            return {
                statusCode: 200,
                body: JSON.stringify({ cardData }),
            };
        } catch (error) {
            const errorMessage = (error as Error).message;
            return this.handleError(error as Error, errorMessage);
        }
    }

    private extractTokenFromHeader(headers: APIGatewayProxyEventHeaders): string | null {
        const authorizationHeader = headers.Authorization;

        return authorizationHeader && authorizationHeader.startsWith('Bearer ')
            ? authorizationHeader.split(' ')[1]
            : null;
    }

    private unauthorizedResponse(): ResponseToken {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Unauthorized' }),
        };
    }

    private handleError(error: Error, errorMessage: string): ResponseToken {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: errorMessage }),
        };
    }
}

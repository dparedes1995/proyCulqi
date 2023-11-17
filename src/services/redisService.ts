import Redis from 'ioredis';
import { RequestData } from '../interfaces/requestData';
import { generateToken } from '../utils/tokenUtils';

export class RedisService {
    // @ts-ignore
    private readonly client: Redis.Redis;

    constructor() {
        this.client = new Redis({
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
        });
    }

    async storeCardToken(data: RequestData): Promise<string> {
        try {
            const token = generateToken();
            data.token = token;

            await this.client.hmset(`card_tokens:${token}`, data);
            await this.client.expire(`card_tokens:${token}`, 900);

            return token;
        } catch (error) {
            throw new Error('Error storing card token');
        }
    }

    async getCardDataByToken(token: string): Promise<RequestData | null> {
        try {
            const cardData = await this.client.hgetall(`card_tokens:${token}`);

            if (!cardData || Object.keys(cardData).length === 0) {
                return null;
            }

            delete cardData.cvv;

            return cardData as RequestData;
        } catch (error) {
            throw new Error('Error retrieving card data by token');
        }
    }
}

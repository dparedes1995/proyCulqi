import { RedisService } from '../services/redisService';
import { RequestData } from "../interfaces/requestData";

jest.mock('ioredis');

describe('RedisService', () => {
    let redisService: RedisService;

    beforeEach(() => {
        redisService = new RedisService();
    });

    test('storeCardToken should store card data and return token', async () => {
        const cardData: RequestData = {
            "card_number": 4111111111111111,
            "cvv": 123,
            "expiration_month": "05",
            "expiration_year": "2024",
            "email": "test@gmail.com"
        };

        const mockHmset = jest.spyOn(redisService['client'], 'hmset').mockResolvedValue('Qm7T0jo2LuphGwMe');

        const token = await redisService.storeCardToken(cardData);

        expect(mockHmset).toHaveBeenCalledWith(`card_tokens:${token}`, cardData);
        expect(mockHmset).toHaveBeenCalledTimes(1);
        expect(typeof token).toBe('string');
    });

    test('storeCardToken should throw an error if storing card token fails', async () => {
        const cardData: Partial<RequestData> = {};
        const mockHmset = jest.spyOn(redisService['client'], 'hmset').mockImplementation((...args: any[]) => {
            const callback = args[args.length - 1];
            callback(new Error('Mocked error'), null);
        });

        await expect(redisService.storeCardToken(cardData as RequestData)).rejects.toThrow('Error storing card token');

        expect(mockHmset).toHaveBeenCalledTimes(1);
    });

    test('getCardDataByToken should retrieve card data by token', async () => {
        const token: string = "Qm7T0jo2LuphGwMe";
        const mockHgetall = jest.spyOn(redisService['client'], 'hgetall').mockResolvedValue({
            "card_number": 4111111111111111,
            "expiration_month": "05",
            "expiration_year": "2024",
            "email": "test@gmail.com"
        });

        const cardData = await redisService.getCardDataByToken(token);

        expect(mockHgetall).toHaveBeenCalledWith(`card_tokens:${token}`);
        expect(mockHgetall).toHaveBeenCalledTimes(1);
        expect(cardData).toBeTruthy();
    });

    test('getCardDataByToken should return null if token does not exist', async () => {
        const token: string = "nonExistentToken";
        const mockHgetall = jest.spyOn(redisService['client'], 'hgetall').mockResolvedValue({});

        const cardData = await redisService.getCardDataByToken(token);

        expect(mockHgetall).toHaveBeenCalledWith(`card_tokens:${token}`);
        expect(mockHgetall).toHaveBeenCalledTimes(1);
        expect(cardData).toBeNull();
    });

    test('getCardDataByToken should throw an error if retrieving card data fails', async () => {
        const token: string = "Qm7T0jo2LuphGwMe";
        const mockHgetall = jest.spyOn(redisService['client'], 'hgetall').mockRejectedValue(new Error('Mocked error'));

        await expect(redisService.getCardDataByToken(token)).rejects.toThrow('Error retrieving card data by token');

        expect(mockHgetall).toHaveBeenCalledWith(`card_tokens:${token}`);
        expect(mockHgetall).toHaveBeenCalledTimes(1);
    });
});

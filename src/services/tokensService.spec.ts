import { TokensService } from '../services/tokensService';
import { RedisService } from '../services/redisService';
import { APIGatewayProxyEvent } from "aws-lambda";

describe('TokensService', () => {
    let tokensService: TokensService;
    let redisServiceMock: jest.Mocked<RedisService>;

    beforeEach(() => {
        redisServiceMock = {
            storeCardToken: jest.fn(),
            getCardDataByToken: jest.fn(),
        } as unknown as jest.Mocked<RedisService>;

        tokensService = new TokensService(redisServiceMock);
    });

    describe('createToken', () => {
        it('should return a new token', async () => {
            const requestBody = {
                "card_number": 4111111111111111,
                "cvv": 123,
                "expiration_month": "05",
                "expiration_year": "2024",
                "email": "test@gmail.com"
            };
            const event: Partial<APIGatewayProxyEvent> = { body: JSON.stringify(requestBody) };

            redisServiceMock.storeCardToken.mockResolvedValue('newToken');

            const response = await tokensService.createToken(event as APIGatewayProxyEvent);

            expect(redisServiceMock.storeCardToken).toHaveBeenCalledWith(requestBody);
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual(JSON.stringify({ token: 'newToken' }));
        });

        it('should return an error response on unexpected error', async () => {
            const requestBody = {
                "card_number": 4111111111111111,
                "cvv": 123,
                "expiration_month": "05",
                "expiration_year": "2024",
                "email": "test@gmail.com"
            };
            const event: Partial<APIGatewayProxyEvent> = { body: JSON.stringify(requestBody) };
            const error = new Error('Unexpected error');

            redisServiceMock.storeCardToken.mockRejectedValue(error);

            const response = await tokensService.createToken(event as APIGatewayProxyEvent);

            expect(redisServiceMock.storeCardToken).toHaveBeenCalledWith(requestBody);
            expect(response.statusCode).toEqual(500);
            expect(response.body).toEqual(JSON.stringify({ error: 'Unexpected error' }));
        });
    });

    describe('getCardDataByToken', () => {
        it('should return card data by token', async () => {
            const token = 'validToken';
            const headers = { Authorization: `Bearer ${token}` };
            const event: Partial<APIGatewayProxyEvent> = { headers };

            redisServiceMock.getCardDataByToken.mockResolvedValue({
                "card_number": 4111111111111111,
                "expiration_month": "05",
                "expiration_year": "2024",
                "cvv": 123,
                "email": "test@gmail.com",
                "token": "Qm7T0jo2LuphGwMe"
            });

            const response = await tokensService.getCardDataByToken(event as APIGatewayProxyEvent);

            expect(redisServiceMock.getCardDataByToken).toHaveBeenCalledWith(token);
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual(JSON.stringify({
                cardData: {
                    "card_number": 4111111111111111,
                    "expiration_month": "05",
                    "expiration_year": "2024",
                    "cvv": 123,
                    "email": "test@gmail.com",
                    "token": "Qm7T0jo2LuphGwMe"
                }
            }));
        });

        it('should return an unauthorized response if token is missing', async () => {
            const headers = {};
            const event: Partial<APIGatewayProxyEvent> = { headers };

            const response = await tokensService.getCardDataByToken(event as APIGatewayProxyEvent);

            expect(response.statusCode).toEqual(401);
            expect(response.body).toEqual(JSON.stringify({ error: 'Unauthorized' }));
        });

        it('should return an error response on internal server error', async () => {
            const token = 'validToken';
            const headers = { Authorization: `Bearer ${token}` };
            const event: Partial<APIGatewayProxyEvent> = { headers };
            const error = new Error('Internal Server Error');

            redisServiceMock.getCardDataByToken.mockRejectedValue(error);

            const response = await tokensService.getCardDataByToken(event as APIGatewayProxyEvent);

            expect(redisServiceMock.getCardDataByToken).toHaveBeenCalledWith(token);
            expect(response.statusCode).toEqual(500);
            expect(response.body).toEqual(JSON.stringify({ error: 'Internal Server Error' }));
        });
    });
});

// src/handlers/getCardDataByTokenHandler.ts
import { TokensService } from "../services/tokensService";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import dotenv from "dotenv";
import {RedisService} from "../services/redisService";
import {ResponseToken} from "../interfaces/responseToken";
dotenv.config();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const tokenService:TokensService = new TokensService(new RedisService());
    const response:ResponseToken = await tokenService.getCardDataByToken(event);

    return {
        statusCode: response.statusCode,
        body: response.body,
    };
};

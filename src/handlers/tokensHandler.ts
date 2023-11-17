// src/handlers/tokensHandler.ts

import {APIGatewayProxyEvent, APIGatewayProxyHandler} from 'aws-lambda';
import { TokensService } from '../services/tokensService';
import { ResponseToken } from '../interfaces/responseToken';
import dotenv from 'dotenv';
import {RedisService} from "../services/redisService";
dotenv.config();

export const handler: APIGatewayProxyHandler = async (event:APIGatewayProxyEvent):Promise<ResponseToken> => {
    const tokensService:TokensService = new TokensService(new RedisService());
    const response: ResponseToken = await tokensService.createToken(event);

    return response;
};

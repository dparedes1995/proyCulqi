// src/interfaces/requestData.ts

export interface RequestData {
    card_number: number;
    cvv: number;
    expiration_month: string;
    expiration_year: string;
    email: string;
    token?: string;
}

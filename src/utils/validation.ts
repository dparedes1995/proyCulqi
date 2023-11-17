import luhn from 'luhn';
import { RequestData } from '../interfaces/requestData';

export class Validation {
    static validateRequestData(requestData: RequestData): void {
        if (!Validation.isValidCardNumber(requestData.card_number)) throw new Error('Invalid card number');
        if (!Validation.isValidCVV(requestData.cvv)) throw new Error('Invalid CVV');
        if (!Validation.isValidExpirationMonth(requestData.expiration_month)) throw new Error('Invalid expiration month');
        if (!Validation.isValidExpirationYear(requestData.expiration_year)) throw new Error('Invalid expiration year');
        if (!Validation.isValidEmail(requestData.email)) throw new Error('Invalid email address');
    }

    static isValidCardNumber(cardNumber: number): boolean {
        return luhn.validate(cardNumber.toString());
    }

    static isValidCVV(cvv: number): boolean {
        return cvv === 123 || cvv === 4532;
    }

    static isValidExpirationMonth(expirationMonth: string): boolean {
        const month:number = parseInt(expirationMonth, 10);
        return month >= 1 && month <= 12;
    }

    static isValidExpirationYear(expirationYear: string): boolean {
        const currentYear:number = new Date().getFullYear();
        const year:number = parseInt(expirationYear, 10);
        return year >= currentYear && year <= currentYear + 5;
    }

    static isValidEmail(email: string): boolean {
        const validDomains:string[] = ['gmail.com', 'hotmail.com', 'yahoo.es'];
        const domain:string = email.split('@')[1];
        return validDomains.includes(domain);
    }
}

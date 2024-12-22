import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) { }

  getHello(): string {
    return 'Hello World!';
  }

  async createPayment(amount: number, currency: string, number: string) {
    const API_KEY = this.configService.get<string>('API_KEY');
    const MERCHANT_ID = this.configService.get<string>('MERCHANT_ID');
    const APP_URL = this.configService.get<string>('APP_URL');
    const APP_SUCCESS = this.configService.get<string>('APP_SUCCESS');
    const APP_RETURN = this.configService.get<string>('APP_RETURN');

    const payload = {
      amount,
      currency,
      order_id: crypto.randomBytes(12).toString('hex'),
      url_callback: `${APP_URL}/webhook`,
      url_success: `${APP_SUCCESS}`,
      url_return: `${APP_RETURN}`,
      additional_data: JSON.stringify({ number }),
    };

    const sign = crypto
      .createHash('md5')
      .update(Buffer.from(JSON.stringify(payload)).toString('base64') + API_KEY)
      .digest('hex');

    const response = await axios.post('https://api.cryptomus.com/v1/payment', payload, {
      headers: {
        'Content-Type': 'application/json',
        merchant: MERCHANT_ID,
        sign: sign,
      },
    });

    return response.data;
  }

  validateWebhookSignature(rawBody: string, receivedSign: string): boolean {
    const API_KEY = this.configService.get<string>('API_KEY');

    const data = JSON.parse(rawBody);
    delete data.sign;

    const calculatedSign = crypto
      .createHash('md5')
      .update(Buffer.from(JSON.stringify(data)).toString('base64') + API_KEY)
      .digest('hex');

    return receivedSign === calculatedSign;
  }
}

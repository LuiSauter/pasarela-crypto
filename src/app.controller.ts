import { Body, Controller, Get, HttpException, HttpStatus, Post, Res, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { ApiBody } from '@nestjs/swagger';
import axios from 'axios';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) { }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          example: 100,
        },
        currency: {
          type: 'string',
          example: 'USD',
        },
        number: {
          type: 'string',
          example: '78010833',
        }
      },
    },
  })
  @Post('checkout')
  async checkout(@Body() body: { amount: number; currency: string, number: string }, @Res() res: Response) {
    try {
      const data = await this.appService.createPayment(body.amount, body.currency, body.number);
      return res.json(data);
    } catch (error) {
      throw new HttpException('Failed to process payment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('webhook')
  webhook(@Req() req: Request, @Res() res: Response) {
    const sign = req.body.sign;

    if (!sign) {
      return res.status(400).json({ message: 'Invalid sign' });
    }

    const isValid = this.appService.validateWebhookSignature(req.rawBody, sign);

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid sign' });
    }

    console.log(req.body);

    const responseJson = JSON.parse(req.body.additional_data);

    axios.post('https://whatsapp.desarrollamelo.com/api/send', {
      access_token: "64da6880c7e13",
      instance_id: "66292A1C9A2D7",
      number: `591${responseJson.number}`,
      type: "text",
      message: `
Tu pago ha sido procesado exitosamente.

*Desarrollamelo Store*

Monto: ${req.body.amount} *${req.body.currency}*
Pagado: ${req.body.payer_amount} *${req.body.payer_currency}*
Red: ${req.body.network}

Referencia: ${req.body.order_id}

Gracias por tu compra, si tienes alguna duda o consulta no dudes en contactarnos.

*VeriPagos*
      `
    })

    return res.status(200).json({
      message: 'Webhook received',
      data: req.body
    })
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

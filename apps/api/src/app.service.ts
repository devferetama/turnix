import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return {
      name: 'Turnix API',
      status: 'ok',
    };
  }
}

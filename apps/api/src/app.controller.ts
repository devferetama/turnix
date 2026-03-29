import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Return the base API status' })
  @ApiOkResponse({
    description: 'The Turnix API is available.',
    schema: {
      example: {
        name: 'Turnix API',
        status: 'ok',
      },
    },
  })
  @Get()
  getStatus() {
    return this.appService.getStatus();
  }
}

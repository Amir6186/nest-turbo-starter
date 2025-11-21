import { HttpException, HttpStatus } from '@nestjs/common';
import { catchError, lastValueFrom, Observable, timeout } from 'rxjs';
import { ERROR_RESPONSE } from '@app/common';

export class BaseService {
  protected async msResponse(res: Observable<any>, timeoutMs?: number): Promise<any> {
    const callTimeout = timeoutMs || +process.env.CALL_SERVICE_TIMEOUT;
    const pipe = res.pipe(
      timeout(callTimeout),
      catchError((err) => {
        const statusCode = err?.statusCode || ERROR_RESPONSE.INTERNAL_SERVER_ERROR.statusCode;
        throw new HttpException(
          {
            statusCode: statusCode,
            message: err?.message || ERROR_RESPONSE.INTERNAL_SERVER_ERROR.message,
            errorCode: err?.errorCode || ERROR_RESPONSE.INTERNAL_SERVER_ERROR.errorCode,
            errorService: err?.errorService,
            stack: err?.stack,
            trace: err?.trace,
          },
          statusCode,
        );
      }),
    );
    return await lastValueFrom(pipe);
  }
}

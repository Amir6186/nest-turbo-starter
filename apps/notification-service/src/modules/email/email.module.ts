import { awsSesConfiguration, smtpConfiguration } from '@app/common';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AbstractEmailService } from './abstract-email.service';
import { EmailService } from './email.service';
import { SesEmailService } from './ses-email.service';
import { SmtpEmailService } from './smtp-email.service';

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(awsSesConfiguration),
    ConfigModule.forFeature(smtpConfiguration)
  ],
  providers: [
    {
      provide: AbstractEmailService,
      useClass: SmtpEmailService,
    },
    EmailService,
  ],
  exports: [AbstractEmailService, EmailService],
})
export class EmailModule {}

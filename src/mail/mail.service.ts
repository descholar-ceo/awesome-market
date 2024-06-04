import { ConfigService } from '@/config/config.service';
import { Injectable, Logger } from '@nestjs/common';
import * as sendGridMailClient from '@sendgrid/mail';
import { MailDto } from './mail.dtos';
import { NODE_ENV, SENDGRID_API_KEY } from '@/config/config.utils';
import { PRODUCTION } from '@/common/constants.common';

@Injectable()
export class MailService {
  constructor(private readonly config: ConfigService) {}
  sendEmail = async (emailSettings: MailDto): Promise<void> => {
    sendGridMailClient.setApiKey(this.config.get<string>(SENDGRID_API_KEY));
    const {
      personalizations,
      fromEmailAddress,
      emailHtmlBody,
      emailSubject,
      emailTextBody,
    } = emailSettings;
    const message = {
      personalizations,
      from: fromEmailAddress,
      subject: emailSubject,
      text: emailTextBody,
      html: emailHtmlBody,
    };
    sendGridMailClient
      .send(message)
      .then((res) => {
        if (this.config.get<string>(NODE_ENV) !== PRODUCTION) {
          Logger.debug({
            'Email was sent successfully, the following is the response we received: ':
              res,
          });
        }
      })
      .catch((err) => {
        if (this.config.get<string>(NODE_ENV) !== PRODUCTION) {
          Logger.error({
            'Sending email failed with the following err: ': err,
          });
        }
      });
  };
}

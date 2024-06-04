import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

class EmailDto {
  email: string;
}

export class PersonalizationInternalDto {
  to: EmailDto;
  cc?: EmailDto[];
  bcc?: EmailDto[];
}

export class MailDto {
  @IsNotEmpty()
  @IsEmail()
  fromEmailAddress: string;

  @IsOptional()
  personalizations?: PersonalizationInternalDto[];

  @IsNotEmpty()
  @IsString()
  emailSubject: string;

  @IsNotEmpty()
  @IsString()
  emailHtmlBody: string;

  @IsNotEmpty()
  @IsString()
  emailTextBody: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class CommonResponseDto {
  @ApiProperty()
  status: number;
  @ApiProperty()
  message: string;
  @ApiProperty()
  data?: any;
}
export class CommonErrorResponseDto {
  @ApiProperty()
  statusCode: number;
  @ApiProperty()
  message: string[];
  @ApiProperty()
  error: string;
}

export class PaginationDto {
  @ApiProperty()
  totalPages: number;
  @ApiProperty()
  recordsPerPage: number;
  @ApiProperty()
  totalRecords: number;
  @ApiProperty()
  currentPage: number;
}
export class ResponseErrorMessageDto {
  @ApiProperty()
  messages: string[];
}

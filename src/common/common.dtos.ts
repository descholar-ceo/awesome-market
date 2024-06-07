export class CommonResponseDto {
  status: number;
  message: string;
  data?: any;
}

export class PaginationDto {
  totalPages: number;
  recordsPerPage: number;
  totalRecords: number;
  currentPage: number;
}
export class ResponseErrorMessageDto {
  messages: string[];
}

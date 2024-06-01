export class CommonResponseDto {
  status: number;
  message: string;
  data?: any;
}

export class PaginationDto {
  pages: number;
  recordsPerPage: number;
  totalRecords: number;
  currentPage: number;
}

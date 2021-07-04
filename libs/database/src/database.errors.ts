import { OrnnError } from '@lib/utils/error';

export class DatabaseError extends OrnnError {
  constructor(code: DatabaseErrorCode, query?: string) {
    super(
      500,
      'ERR_DB',
      code,
      DatabaseErrorMessages.get(code) ||
        'Undefined Database Error, check DatabaseErrorMessages',
    );
    this.query = query;
  }

  query?: string;
}

export enum DatabaseErrorCode {
  ExistedCredential = 'CREATE_QUERY_RUNNER_FAILED',
  TransactionIsNotStarted = 'TRANSACTION_IS_NOT_STARTED',
  GetOneFailed = 'GET_ONE_MODEL_FAILED',
  GetListFailed = 'GET_LIST_MODEL_FAILED',
  CreateFailed = 'CREATE_MODEL_FAILED',
  UpdateFailed = 'UPDATE_MODEL_FAILED',
  DeleteFailed = 'DELETE_MODEL_FAILED',
}

const DatabaseErrorMessages = new Map<DatabaseErrorCode, string>([
  [
    DatabaseErrorCode.ExistedCredential,
    '쿼리 러너를 생성하는데 실패하였습니다.',
  ],
  [
    DatabaseErrorCode.TransactionIsNotStarted,
    '트랜잭션이 시작되지 않은 쿼리러너 입니다.',
  ],
  [DatabaseErrorCode.GetOneFailed, '모델을 가져오는데 실패하였습니다.'],
  [DatabaseErrorCode.GetListFailed, '모델을 가져오는데 실패하였습니다.'],
  [DatabaseErrorCode.CreateFailed, '모델을 생성하는데 실패하였습니다.'],
  [DatabaseErrorCode.UpdateFailed, '모델을 수정하는데 실패하였습니다.'],
  [DatabaseErrorCode.DeleteFailed, '모델을 삭제하는데 실패하였습니다.'],
]);

/**
 * 他DTOから参照される簡易ユーザー
 */
export interface UserSummaryDto {
  id: number;
  name: string;
  deletedAt?: Date | null;
}

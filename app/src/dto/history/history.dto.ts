import { UserSummaryDto } from "../user/user-summary.dto.js";
import { HistoryActionDto } from "./history-action.dto.js";
import { HistoryFieldDto } from "./history-field.dto.js";
import { HistoryValueDto } from "./history-value.dto.js";

/**
 * 変更履歴情報
 */
export interface HistoryDto {
  action: HistoryActionDto;
  field: HistoryFieldDto;

  oldValue: HistoryValueDto;
  newValue: HistoryValueDto;

  changedBy: UserSummaryDto;

  createdAt: Date;
}

import type { UserSummaryDto } from "../user/user-summary.dto.js";
import type { HistoryActionDto } from "./history-action.dto.js";
import type { HistoryFieldDto } from "./history-field.dto.js";
import type { HistoryValueDto } from "./history-value.dto.js";

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

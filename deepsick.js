SELECT
    request_ghm.id,
    request_ghm.requestStatus as rs,
    request_ghm.startDate,
    tbl_approverListHistory.fullname as Submit_by,
    tbl_approverListHistory.approvalType,
    tbl_approverListHistory.approvalDate,
    tbl_approverListHistory.module_id,
    CAST(CASE
        WHEN DATEDIFF(day, tbl_approverListHistory.approvalDate, request_ghm.startDate) < 0 THEN 0
        ELSE DATEDIFF(day, tbl_approverListHistory.approvalDate, request_ghm.startDate)
    END AS VARCHAR) + ' days, ' +
    CAST(CASE
        WHEN DATEDIFF(minute, tbl_approverListHistory.approvalDate, request_ghm.startDate) < 0 THEN 0
        ELSE (DATEDIFF(minute, tbl_approverListHistory.approvalDate, request_ghm.startDate) % 1440) / 60
    END AS VARCHAR) + ' hours, ' +
    CAST(CASE
        WHEN DATEDIFF(minute, tbl_approverListHistory.approvalDate, request_ghm.startDate) < 0 THEN 0
        ELSE DATEDIFF(minute, tbl_approverListHistory.approvalDate, request_ghm.startDate) % 60
    END AS VARCHAR) + ' minutes' AS time_left
FROM request_ghm
JOIN tbl_approverListHistory ON request_ghm.id = tbl_approverListHistory.req_id
WHERE tbl_approverListHistory.approvalType = 'submitted'
  AND request_ghm.requestStatus = 1
  AND tbl_approverListHistory.module_id = '57';

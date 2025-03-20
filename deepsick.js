SELECT
    request_ghm.id,
    request_ghm.requestStatus AS rs,
    request_ghm.startDate,
    tbl_approverListHistory.fullname AS Submit_by,
    tbl_approverListHistory.approvalType,
    tbl_approverListHistory.approvalDate,
    tbl_approverListHistory.module_id,
    CASE 
        WHEN DATEDIFF(day, tbl_approverListHistory.approvalDate, request_ghm.startDate) >= 2 
        THEN '00:00:00'
        ELSE FORMAT(DATEADD(MINUTE, 
            CASE 
                WHEN DATEDIFF(MINUTE, tbl_approverListHistory.approvalDate, request_ghm.startDate) < 0 THEN 0
                ELSE DATEDIFF(MINUTE, tbl_approverListHistory.approvalDate, request_ghm.startDate)
            END, '00:00:00'), 'HH:mm:ss')
    END AS time_left
FROM request_ghm
JOIN tbl_approverListHistory ON request_ghm.id = tbl_approverListHistory.req_id
WHERE tbl_approverListHistory.approvalType = 'submitted'
  AND request_ghm.requestStatus = 1
  AND tbl_approverListHistory.module_id = '57';

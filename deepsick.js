$gethrslQuery = "(select TOP 1 CASE WHEN a.user_id='".$userId."' then 1 else 0 end 
            from tbl_approverListReq l
            left join tbl_approver a on l.approver_id=a.id
            left join tbl_approvaltype r on a.approvaltype_id = r.id 
            where l.req_id = request_ghm.id and l.module_id = '".$module_id."' and r.ApprovalType='HR Service Leader' and r.isactive='1'
            order by a.sequence)";

$requests = Ghm::query()
    ->where(function ($query) use ($userId, $isAdmin, $gethrslQuery) {
        if ($isAdmin) {
            // Admin melihat semua request kecuali miliknya, dengan status 1, 3, 4
            $query->where("request_ghm.user_id", "!=", $userId)
                ->whereIn("request_ghm.requestStatus", [1, 3, 4]);
        } else {
            // Subquery untuk menentukan apakah user adalah HRSL
            $query->whereRaw("$gethrslQuery = 1", [])
                ->whereIn("request_ghm.requestStatus", [1, 2, 3, 4])
                ->orWhere(function ($q) use ($userId) {
                    // User biasa hanya bisa melihat request miliknya sendiri atau request status = 3
                    $q->where("request_ghm.user_id", "=", $userId)
                      ->orWhere("request_ghm.requestStatus", 3);
                });
        }
    })
    ->with(['User', 'code', 'ghm_room'])
    ->get();





$requests = Ghm::query()
    ->where(function ($query) use ($userId, $isAdmin, $gethrsl) {
        if ($isAdmin) {
            // Admin melihat semua request kecuali miliknya, dengan status 1, 3, 4
            $query->where("request_ghm.user_id", "!=", $userId)
                ->whereIn("request_ghm.requestStatus", [1, 3, 4]);
        } elseif ($gethrsl) {
            // HR Service Leader melihat request miliknya sendiri + request orang lain dengan status 1, 2, 3, 4
            $query->where("request_ghm.user_id", "=", $userId)
                ->orWhereIn("request_ghm.requestStatus", [1, 2, 3, 4]);
        } else {
            // User biasa hanya bisa melihat request miliknya sendiri
            $query->where("request_ghm.user_id", "=", $userId);
        }
    })
    ->orWhere(function ($query) use ($userId, $isAdmin, $gethrsl) {
        if (!$isAdmin && !$gethrsl) {
            // Hanya user biasa yang bisa melihat request dengan status = 3, meskipun bukan miliknya
            $query->where("request_ghm.requestStatus", 3);
        }
    })
    ->with(['User', 'code', 'ghm_room'])
    ->get();

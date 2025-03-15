$user = auth()->user();
        if (!$user) {
            return redirect()->route('login');
        }
        $userId = $user->id;
        $isAdmin = $user->isAdmin ?? false;
        $module_id = $this->getModuleId($this->modulename);
        $employeeId = $user->employee_id ?? null;
        $gethrsl = "(select TOP 1 CASE WHEN a.user_id='".$userId."'  then 1 else 0 end 
            from tbl_approverListReq l
            left join tbl_approver a on l.approver_id=a.id
            left join tbl_approvaltype r on a.approvaltype_id = r.id 
            where l.req_id = request_ghm.id and l.module_id = '".$module_id."' and r.ApprovalType='HR Service Leader' and r.isactive='1'
            order by a.sequence)";
        $requests = Ghm::query()
            ->where(function ($query) use ($userId, $isAdmin, $employeeId, $gethrsl) {
                if ($isAdmin) {
                    $query->where("request_ghm.user_id", "!=", $userId)
                        ->whereIn("request_ghm.requestStatus", [1, 3, 4]);
                } else if ($gethrsl) {
                    $query->where("request_ghm.user_id", "!=", $userId)
                        ->whereIn("request_ghm.requestStatus", [1,3,4]);
                } else {
                    $query->where("request_ghm.user_id", "=", $userId);
                }
            })
            ->orWhere("request_ghm.user_id", $userId)
            ->with(['User', 'code', 'ghm_room'])
            ->get();

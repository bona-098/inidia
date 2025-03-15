$requests = Ghm::query()
    ->where(function ($query) use ($userId, $isAdmin, $employeeId, $gethrsl) {
        if ($isAdmin) {
            // Admin hanya melihat request yang bukan miliknya dengan status tertentu
            $query->where("request_ghm.user_id", "!=", $userId)
                ->whereIn("request_ghm.requestStatus", [1, 3, 4]);
        } elseif ($gethrsl) {
            // HR Service Leader bisa melihat request miliknya sendiri dan request orang lain dengan status 1,2,3,4
            $query->whereIn("request_ghm.requestStatus", [1, 2, 3, 4])
                  ->orWhere("request_ghm.user_id", "=", $userId);
        } else {
            // User biasa hanya bisa melihat request miliknya sendiri
            $query->where("request_ghm.user_id", "=", $userId);
        }
    })
    ->orWhere(function ($query) use ($isAdmin, $gethrsl) {
        if (!$isAdmin && !$gethrsl) {
            // Hanya user biasa yang bisa melihat request dengan status = 3
            $query->where("request_ghm.requestStatus", 3);
        }
    })
    ->with(['User', 'code', 'ghm_room'])
    ->get();

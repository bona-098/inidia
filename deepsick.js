$requests = Ghm::query()
    ->where(function ($query) use ($userId, $isAdmin, $employeeId, $gethrsl) {
        if ($isAdmin) {
            // Admin hanya melihat request yang bukan miliknya dengan status 1,3,4
            $query->where("request_ghm.user_id", "!=", $userId)
                ->whereIn("request_ghm.requestStatus", [1, 3, 4]);
        } elseif ($gethrsl) {
            // HRSL bisa melihat request miliknya sendiri + request orang lain dengan status 1,2,3,4
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

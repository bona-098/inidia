public function dashboard(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return redirect()->route('login');
        }
        $userId = $user->id;
        $isAdmin = $user->isAdmin ?? false;
        $module_id = $this->getModuleId($this->modulename);
        $employeeId = $user->employee_id ?? null;
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

        $rooms = Ghm_room::all();
        $locations = Location::all();
        $employees = Employee::with('Department')->get();
        $departments = Department::all();
        $statusColors = [
            0 => '#6C757D', // Draft (Abu)6C757D-ECEFF1
            1 => '#007BFF', // Pending (Biru)007BFF-81D4FA
            2 => '#FFC107', // Approved (Kuning)FFC107-FFF59D
            3 => '#28A745', // Rejected (Hijau)28A745-C8E6C9
            4 => '#DC3545', // Completed (Merah)DC3545-FFCDD2
        ];        
        $totalPeopleData = DB::select("
            SELECT 
                request_ghm.id,
                COALESCE(SUM(EmployeeCount), 0) AS totalEmployee,
                COALESCE(SUM(GuestCount), 0) AS totalGuest,
                COALESCE(SUM(FamilyCount), 0) AS totalFamily,
                COALESCE(SUM(EmployeeCount + GuestCount + FamilyCount), 0) AS totalAll
            FROM 
                [request_ghm]
            CROSS APPLY (SELECT COUNT(*) AS EmployeeCount FROM OPENJSON(employee)) AS EmpData
            CROSS APPLY (SELECT COUNT(*) AS GuestCount FROM OPENJSON(guest)) AS GuestData
            CROSS APPLY (SELECT COUNT(*) AS FamilyCount FROM OPENJSON(family)) AS FamilyData    
            WHERE requestStatus = 3
            GROUP BY request_ghm.id, request_ghm.ghm_room_id, request_ghm.startDate, request_ghm.endDate
            ");            
            $totalPeopleArray = collect($totalPeopleData)->mapWithKeys(function ($item) {
                return [$item->id => $item->totalAll];
            });        
        if ($requests->isEmpty()) {
            $booking = [];
        } else {
            $booking = $requests->map(function ($request) use ($rooms, $locations, $totalPeopleArray, $statusColors) {
                $room = $rooms->firstWhere('id', $request->ghm_room_id);
                $location = $room ? $locations->firstWhere('id', $room->location_id) : null;
                $totalPeople = $totalPeopleArray[$request->id] ?? 0;
                return [
                    'id' => $request->id,
                    'bu' => $request->bu,
                    'sector' => $request->sector,
                    'text' => $request->text ?? '',
                    'guest' => $request->guest ?? 0,
                    'family' => $request->family ?? 0,
                    'employee' => $request->employee ?? null,
                    'description' => $request->description ?? '',
                    'requestStatus' => $request->requestStatus ?? 0,
                    'startDate' => optional($request->startDate)->toIso8601String(),
                    'endDate' => optional($request->endDate)->toIso8601String(),
                    'code' => optional($request->code)->code ?? null,
                    'creator' => optional($request->User)->fullname ?? null,
                    'ghm_room_id' => $request->ghm_room_id,
                    'roomName' => optional($room)->roomName ?? null,
                    'location' => optional($location)->Location ?? null,
                    'totalPeople' => $totalPeople,
                    'requestColor' => isset($statusColors[$request->requestStatus]) ? $statusColors[$request->requestStatus] : '#6C757D', // Default warna abu-abu
                ];
            });
        }
        $roomsWithLocations = $rooms->map(function ($room) use ($locations) {
            $location = $locations->firstWhere('id', optional($room)->location_id);
            return [
                'text' => optional($room)->roomName ?? 'N/A',
                'id' => optional($room)->id ?? null,
                'bu' => optional($room)->bu ?? null,
                'sector' => optional($room)->sector ?? null,
                'roomOccupancy' => optional($room)->roomOccupancy ?? 0,
                'location' => optional($location)->Location ?? 'N/A',
                'roomColor' => '#F0F0F0', // Warna default untuk room, tidak dipengaruhi requestStatus
            ];
        });
        $uniqueLocations = $roomsWithLocations->pluck('location')->unique()->values();
        if ($request->ajax()) {
            return response()->json([
                'booking' => $booking,
                'roomsWithLocations' => $roomsWithLocations
            ]);
        }
        return view('dashboard.ghm_booking', [
            'booking' => $booking,
            'roomsWithLocations' => $roomsWithLocations,
            'uniqueLocations' => $uniqueLocations,
            'emplo' => $employees,
            'departments' => $departments,
        ]);
    }

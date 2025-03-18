public function show($id)
{
    try {
        $dataquery = $this->model->query();
        $data = $dataquery
            ->selectRaw("request_ghm.id,
                codes.code, 
                request_ghm.user_id,
                request_ghm.description,
                request_ghm.ghm_room_id,   
                request_ghm_room.bu,
                request_ghm_room.sector,          
                request_ghm.text,
                request_ghm.description,
                request_ghm.requestStatus,
                request_ghm.startDate,
                request_ghm.endDate,
                request_ghm.created_at,
                request_ghm.updated_at,
                (SELECT STRING_AGG(emp.fullname, ', ')
                    FROM OPENJSON(request_ghm.employee) 
                    WITH (employee_id INT '$')
                    LEFT JOIN employee.tbl_employee AS emp
                    ON emp.id = employee_id
                ) AS employee_fullname,
                COALESCE(request_ghm.guest, '[]') AS guest,
                COALESCE(request_ghm.family, '[]') AS family,
                request_ghm_room.location_id, 
                employee.tbl_location.Location               
            ")
            ->leftJoin('codes', 'request_ghm.code_id', '=', 'codes.id')
            ->leftJoin('request_ghm_room', 'request_ghm.ghm_room_id', '=', 'request_ghm_room.id')
            ->leftJoin('employee.tbl_location', 'request_ghm_room.location_id', '=', 'employee.tbl_location.id')
            ->where('request_ghm.id', $id)
            ->first();

        if (!$data) {
            return response()->json(["status" => "error", "message" => "Data tidak ditemukan"]);
        }

        if ($data->code_id == null) {
            $data->code_id = $this->generateCode($this->modulename);
            $data->save();
        }

        // Cek apakah guest & family adalah array
        if (!is_string($data->guest)) {
            $data->guest = implode(', ', (array) $data->guest);
        }

        if (!is_string($data->family)) {
            $data->family = implode(', ', (array) $data->family);
        }

        // Variable untuk menyimpan tiket yang tumpang tindih
        $overlappingBookings = $dataquery
            ->selectRaw("request_ghm.id,
                request_ghm.user_id,
                request_ghm.ghm_room_id,
                request_ghm.startDate,
                request_ghm.endDate,
                request_ghm.guest,
                request_ghm.family,
                emp.fullname AS employee_fullname
            ")
            ->leftJoin('employee.tbl_employee AS emp', 'request_ghm.user_id', '=', 'emp.id')
            ->where('request_ghm.ghm_room_id', $data->ghm_room_id)
            ->where('request_ghm.requestStatus', 3)
            ->where(function($query) use ($data) {
                $query->where(function($query) use ($data) {
                    $query->where('request_ghm.startDate', '<=', $data->endDate)
                          ->where('request_ghm.endDate', '>=', $data->startDate);
                });
            })
            ->where('request_ghm.id', '!=', $data->id)
            ->get();

        // Menggabungkan data overlapping menjadi satu variabel
        $overlappingData = $overlappingBookings->map(function ($booking) {
            return [
                'id' => $booking->id,
                'ghm_room_id' => $booking->ghm_room_id,
                'startDate' => $booking->startDate,
                'endDate' => $booking->endDate,
                'guest' => implode(', ', (array) $booking->guest),
                'family' => implode(', ', (array) $booking->family),
                'employee_fullname' => $booking->employee_fullname,
            ];
        });

        return response()->json([
            'status' => "show",
            'message' => $this->getMessage()['show'],
            'data' => $data,
            'overlappingData' => $overlappingData
        ])->setEncodingOptions(JSON_NUMERIC_CHECK);

    } catch (\Exception $e) {
        return response()->json(["status" => "error", "message" => $e->getMessage()]);
    }
}

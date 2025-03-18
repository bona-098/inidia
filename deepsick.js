public function show($id)
{
    try {
        $dataquery = $this->model->query();

        // Ambil data utama booking berdasarkan ID
        $data = $dataquery
            ->selectRaw("
                request_ghm.id,
                codes.code, 
                request_ghm.user_id,
                request_ghm.description,
                request_ghm.ghm_room_id,   
                request_ghm_room.bu,
                request_ghm_room.sector,          
                request_ghm.text,
                request_ghm.requestStatus,
                request_ghm.startDate,
                request_ghm.endDate,
                request_ghm.created_at,
                request_ghm.updated_at,
                JSON_QUERY(request_ghm.guest) AS guest,
                JSON_QUERY(request_ghm.family) AS family,
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

        // Jika code_id null, generate dan simpan code baru
        if ($data->code_id == null) {
            $data->code_id = $this->generateCode($this->modulename);
            $data->save();
        }

        // Pastikan guest dan family dalam bentuk array
        $data->guest = json_decode($data->guest, true) ?? [];
        $data->family = json_decode($data->family, true) ?? [];

        // Cek booking yang mengalami overlapping
        $overlappingBookings = $dataquery
            ->selectRaw("
                request_ghm.id,
                request_ghm.user_id,
                request_ghm.ghm_room_id,
                request_ghm.startDate,
                request_ghm.endDate,
                JSON_QUERY(request_ghm.guest) AS guest,
                JSON_QUERY(request_ghm.family) AS family,
                emp.fullname AS employee_fullname
            ")
            ->leftJoin('employee.tbl_employee AS emp', 'request_ghm.user_id', '=', 'emp.id')
            ->where('request_ghm.ghm_room_id', $data->ghm_room_id)
            ->where('request_ghm.requestStatus', 3)
            ->where('request_ghm.id', '!=', $data->id)
            ->where('request_ghm.startDate', '<=', $data->endDate)
            ->where('request_ghm.endDate', '>=', $data->startDate)
            ->get();

        // Format hasil overlapping booking
        $overlappingData = $overlappingBookings->map(function ($booking) {
            return [
                'id' => $booking->id,
                'ghm_room_id' => $booking->ghm_room_id,
                'startDate' => $booking->startDate,
                'endDate' => $booking->endDate,
                'guest' => json_decode($booking->guest, true) ?? [],
                'family' => json_decode($booking->family, true) ?? [],
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

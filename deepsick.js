onAppointmentFormOpening: function (e) {
    const form = e.form;
    const appointmentData = e.appointmentData;

    let selectedRoom = appointmentData.ghm_room_id || null;
    let newStartDate = new Date(appointmentData.startDate).toISOString().slice(0, 10);
    let newEndDate = new Date(appointmentData.endDate).toISOString().slice(0, 10);

    let totalBooked = 0;
    let key = `${selectedRoom}|${newStartDate}|${newEndDate}`;

    if (totalPeopleByRoomAndDate.hasOwnProperty(key)) {
        totalBooked = totalPeopleByRoomAndDate[key];
    }

    console.log(`Total Booked for Room ${selectedRoom} on ${newStartDate} - ${newEndDate}: ${totalBooked}`);

    function validateBooking() {
        let guestCount = (form.getEditor("guest")?.option("value") || []).length;
        let familyCount = (form.getEditor("family")?.option("value") || []).length;
        let employeeCount = (form.getEditor("employee")?.option("value") || []).length;
        let totalGuests = guestCount + familyCount + employeeCount;

        let roomCapacity = roomsWithLocations.find(room => room.id === selectedRoom)?.roomOccupancy || 0;
        let remainingCapacity = roomCapacity - (totalGuests + totalBooked);

        if (totalGuests + totalBooked > roomCapacity) {
            DevExpress.ui.notify({
                type: "error",
                displayTime: 3000,
                contentTemplate: (e) => {
                    e.append(`
                        <div style="white-space: pre-line;">
                        Guest limit exceeded, Please adjust your booking!\n
                        Jumlah tamu melebihi kapasitas, sesuaikan dengan kapasitas!\n
                        </div>
                    `);
                }
            });
        }

        return { roomCapacity, totalGuests, remainingCapacity, totalBooked };
    }

    const { roomCapacity, totalGuests, remainingCapacity } = validateBooking();

    form.option('items', [
        {
            itemType: 'group',
            caption: 'Room & Date',
            items: [
                {
                    label: { text: 'Room' },
                    editorType: 'dxSelectBox',
                    dataField: 'ghm_room_id',
                    helpText: `Occupancy: ${roomCapacity} | Booked: ${totalBooked} | Remaining: ${remainingCapacity}`,
                    editorOptions: {
                        readOnly: true,
                        dataSource: roomsWithLocations,
                        displayExpr: function (item) {
                            if (!item) return "";
                            return `${item.location} | ${item.text}`;
                        },
                        valueExpr: 'id',
                        value: selectedRoom,
                        onValueChanged: validateBooking
                    }
                }
            ]
        }
    ]);
}

=================================================

  public function getBookings(Request $request)
{
    $requests = DB::table('request_ghm')
        ->where('requestStatus', 3)
        ->leftJoin('users', 'request_ghm.createdBy', '=', 'users.id')
        ->select(
            'request_ghm.id',
            'request_ghm.bu',
            'request_ghm.sector',
            'request_ghm.text',
            'request_ghm.guest',
            'request_ghm.family',
            'request_ghm.employee',
            'request_ghm.description',
            'request_ghm.requestStatus',
            'request_ghm.startDate',
            'request_ghm.endDate',
            'request_ghm.code',
            'request_ghm.ghm_room_id',
            'users.fullname as creator'
        )
        ->get();

    // Query untuk menghitung totalPeople berdasarkan room dan tanggal yang sama
    $totalPeopleData = DB::select("
        SELECT 
            ghm_room_id,
            CONVERT(varchar, startDate, 126) AS startDate,
            CONVERT(varchar, endDate, 126) AS endDate,
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
        GROUP BY ghm_room_id, startDate, endDate
    ");

    // Buat array untuk mapping totalPeople berdasarkan room dan tanggal
    $totalPeopleByRoomAndDate = [];
    foreach ($totalPeopleData as $item) {
        $key = $item->ghm_room_id . "|" . $item->startDate . "|" . $item->endDate;
        $totalPeopleByRoomAndDate[$key] = $item->totalAll;
    }

    if ($requests->isEmpty()) {
        $booking = [];
    } else {
        $booking = $requests->map(function ($request) use ($totalPeopleByRoomAndDate) {
            $key = $request->ghm_room_id . "|" . optional($request->startDate)->toIso8601String() . "|" . optional($request->endDate)->toIso8601String();
            $totalPeople = $totalPeopleByRoomAndDate[$key] ?? 0;

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
                'code' => $request->code ?? null,
                'creator' => $request->creator ?? null,
                'ghm_room_id' => $request->ghm_room_id,
                'totalPeople' => $totalPeople,
            ];
        });
    }

    return response()->json([
        'requests' => $booking,
        'totalPeopleByRoomAndDate' => $totalPeopleByRoomAndDate
    ]);
}

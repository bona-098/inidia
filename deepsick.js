public function getTotalPeopleData()
{
    $totalPeopleData = DB::select("
        SELECT 
            request_ghm.id,
            request_ghm.ghm_room_id,
            request_ghm.startDate,
            request_ghm.endDate,
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

    return response()->json($totalPeopleData);
}

====================================================
            
onAppointmentFormOpening: async function (e) {
    const form = e.form;
    const appointmentData = e.appointmentData;

    let selectedRoom = appointmentData.ghm_room_id || null;
    let selectedStartDate = new Date(appointmentData.startDate);
    let selectedEndDate = new Date(appointmentData.endDate);

    // Ambil totalPeople dari backend
    let totalPeopleArray = await fetch('/api/getTotalPeopleData')
        .then(response => response.json())
        .catch(error => {
            console.error("Error fetching totalPeople:", error);
            return [];
        });

    // Hitung totalPeople berdasarkan roomId & tanggal yang overlap
    let totalBooked = totalPeopleArray
        .filter(booking => 
            booking.ghm_room_id === selectedRoom &&
            (
                (selectedStartDate >= new Date(booking.startDate) && selectedStartDate < new Date(booking.endDate)) ||
                (selectedEndDate > new Date(booking.startDate) && selectedEndDate <= new Date(booking.endDate)) ||
                (selectedStartDate <= new Date(booking.startDate) && selectedEndDate >= new Date(booking.endDate))
            )
        )
        .reduce((sum, booking) => sum + booking.totalAll, 0);

    function validateBooking() {
        let guestCount = (form.getEditor("guest")?.option("value") || []).length;
        let familyCount = (form.getEditor("family")?.option("value") || []).length;
        let employeeCount = (form.getEditor("employee")?.option("value") || []).length;
        let totalGuests = guestCount + familyCount + employeeCount;

        let roomCapacity = roomsWithLocations.find(room => room.id === selectedRoom)?.roomOccupancy || 0;
        let remainingCapacity = roomCapacity - (totalGuests + totalBooked);

        // Tampilkan notifikasi jika melebihi kapasitas
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

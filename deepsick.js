onAppointmentFormOpening: function (e) {
    const form = e.form;
    const appointmentData = e.appointmentData;
    let selectedRoom = appointmentData.ghm_room_id || null;
    let newStartDate = new Date(appointmentData.startDate);
    let newEndDate = new Date(appointmentData.endDate);

    // Debugging Step 1: Cek semua booking yang ada
    let appointments = e.component.option("dataSource") || [];
    console.log("Semua Appointments:", appointments);

    // Debugging Step 2: Cek room dan tanggal yang dipilih
    console.log("Room Dipilih:", selectedRoom);
    console.log("Start Date Baru:", newStartDate);
    console.log("End Date Baru:", newEndDate);

    // Debugging Step 3: Filter bookings berdasarkan room & date
    let filteredAppointments = appointments.filter(a =>
        a.ghm_room_id === selectedRoom &&
        new Date(a.startDate) <= newEndDate &&
        new Date(a.endDate) >= newStartDate
    );
    console.log("Filtered Appointments:", filteredAppointments);

    // Debugging Step 4: Cek totalPeople sebelum reduce
    console.log("Total Booked Sebelum Reduce:", filteredAppointments.map(a => a.totalPeople));

    // Hitung total booked di ruangan & tanggal yang sama
    let totalBooked = filteredAppointments.reduce((sum, a) => sum + (a.totalPeople || 0), 0);
    console.log("Total Booked Akhir:", totalBooked);

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
                        value: appointmentData.ghm_room_id || null,
                        onValueChanged: validateBooking()
                    }
                }
            ]
        }
    ]);
}

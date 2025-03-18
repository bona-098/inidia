onAppointmentFormOpening: function (e) {
                    const form = e.form;
                    const appointmentData = e.appointmentData;
                
                    let selectedRoom = appointmentData.ghm_room_id || null;
                    let newStartDate = new Date(appointmentData.startDate);
                    let newEndDate = new Date(appointmentData.endDate);
                    let totalBooked = appointmentData.totalPeople || 0; // Gunakan data yang sudah ada, default ke 0 jika undefined
                
                    function validateBooking() {
                        let guestCount = (form.getEditor("guest")?.option("value") || []).length;
                        let familyCount = (form.getEditor("family")?.option("value") || []).length;
                        let employeeCount = (form.getEditor("employee")?.option("value") || []).length;
                        let totalGuests = guestCount + familyCount + employeeCount;
                
                        let roomCapacity = roomsWithLocations.find(room => room.id === selectedRoom)?.roomOccupancy || 0;
                        let remainingCapacity = roomCapacity - (totalGuests + totalBooked);
                
                        // Notifikasi jika melebihi kapasitas
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

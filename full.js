var modname = 'ghmrequest';
var modelclass = 'ghm';
var popupmode;
var dataSubmitted = false; // Flag to track if data has been submitted

// Function to serialize employee_id to JSON
function serializeToJSON(employeeIds) {
    return JSON.stringify(employeeIds);
}

// Function to deserialize JSON to employee_id array
function deserializeFromJSON(jsonString) {
    return JSON.parse(jsonString);
}

$(function() {
    function submitFormData() {
        if (dataSubmitted) return; // Prevent duplicate submissions

        dataSubmitted = true;
        const formData = $('#booking-form').serializeArray();
        const employeeIdsField = formData.find(field => field.name === 'employee_id');
        // employeeIdsField.value = serializeToJSON(employeeIdsField.value.split(',').map(Number));

        const guestField = formData.find(field => field.name === 'guest');
        guestField.value = (guestField.value.split(',').map(name => name.trim()));

        const familyField = formData.find(field => field.name === 'family');
        familyField.value = serializeToJSON(familyField.value.split(',').map(name => name.trim()));

        sendRequest(apiurl + "/" + modname, "POST", formData).then(function(response) {
            if (response.status === 'success') {
                alert('Booking created successfully!');
                location.reload(); // Reload page to reflect new booking
            } else {
                alert('Error: ' + response.message);
            }
        }).catch(function(error) {
            alert('Error: ' + error.responseText);
        }).finally(function() {
            dataSubmitted = false; // Reset the flag after submission
        });
    }

$('#booking-form').on('submit', function(event) {
    event.preventDefault();
    submitFormData();
});

$('#location-selector').dxSelectBox({
    dataSource: uniqueLocations,
    displayExpr: function(item) {
        return item || "";
    },
    valueExpr: function(item) {
        return item;
    },
    value: uniqueLocations[0],
    onValueChanged: function(e) {
        const selectedLocation = e.value;
        updateRoomSelector(selectedLocation);
    }
});

function updateRoomSelector(location) {
    const filteredRooms = roomsWithLocations.filter(emp => emp.location === location);
    $('#room-selector').dxSelectBox({
        dataSource: filteredRooms,
        displayExpr: 'text',
        valueExpr: 'id',
        value: null,
        placeholder: 'Select Room',
        onValueChanged: function(e) {
            const selectedRoomId = e.value;
            updateScheduler(location, selectedRoomId);
        }
    });

    updateScheduler(location, null);
}
// Fungsi untuk mengecek apakah dua rentang tanggal beririsan
function isDateOverlap(start1, end1, start2, end2) {
    return (new Date(start1) <= new Date(end2)) && (new Date(start2) <= new Date(end1));
}
// Fungsi untuk memastikan array selalu valid (menghindari null/undefined)
function safeArray(arr) {
    return Array.isArray(arr) ? arr : [];
}
// Fungsi untuk menghitung total tamu pada tanggal yang beririsan dengan booking baru
function getTotalGuestsForDateLocally(scheduler, roomId, startDate, endDate) {
    let appointments = scheduler.getDataSource().items(); // Ambil semua booking yang sudah ada
    let totalGuests = 0;

    appointments.forEach(appointment => {
        if (
            appointment.ghm_room_id === roomId &&
            isDateOverlap(appointment.startDate, appointment.endDate, startDate, endDate)
        ) {
            let guestCount = safeArray(appointment.guest).length;
            let familyCount = safeArray(appointment.family).length;
            let employeeCount = safeArray(appointment.employee_id).length;
            totalGuests += guestCount + familyCount + employeeCount;
        }
    });

    return totalGuests;
}
// Fungsi untuk menghitung jumlah tamu per hari dalam rentang booking
function getTotalGuestsPerDay(scheduler, roomId, startDate, endDate) {
    let appointments = scheduler.getDataSource().items(); // Ambil semua booking yang sudah ada
    let dailyGuestCount = {}; // Objek untuk menyimpan jumlah tamu per tanggal

    appointments.forEach(appointment => {
        if (appointment.ghm_room_id === roomId) {
            let bookingStart = new Date(appointment.startDate);
            let bookingEnd = new Date(appointment.endDate);

            for (let d = new Date(bookingStart); d <= bookingEnd; d.setDate(d.getDate() + 1)) {
                let dateKey = d.toISOString().split("T")[0]; // Format YYYY-MM-DD
                let guestCount = safeArray(appointment.guest).length;
                let familyCount = safeArray(appointment.family).length;
                let employeeCount = safeArray(appointment.employee_id).length;
                let totalGuests = guestCount + familyCount + employeeCount;

                dailyGuestCount[dateKey] = (dailyGuestCount[dateKey] || 0) + totalGuests;
            }
        }
    });

    return dailyGuestCount;
}
// Fungsi validasi booking saat membuka form
function validateBooking(form) {
    let guestCount = safeArray(form.getEditor("guest")?.option("value")).length;
    let familyCount = safeArray(form.getEditor("family")?.option("value")).length;
    let employeeCount = safeArray(form.getEditor("employee_id")?.option("value")).length;
    let totalGuests = guestCount + familyCount + employeeCount;

    let selectedRoom = form.getEditor("ghm_room_id")?.option("value");
    let roomCapacity = roomsWithLocations.find(room => room.id === selectedRoom)?.roomAccupancy || 0;

    let doneButton = $(".dx-popup-bottom .dx-button.dx-popup-done");

    if (totalGuests > roomCapacity) {
        DevExpress.ui.notify("Jumlah tamu melebihi kapasitas kamar!", "error", 2000);
    }
}


function getTotalGuestsForDateLocally(scheduler, roomId, checkDate) {
    let appointments = scheduler.getDataSource().items(); // Ambil semua booking yang ada
    let totalGuests = 0;
    
    console.log(`📆 Mencari booking di kamar ${roomId} untuk tanggal ${checkDate}`);

    appointments.forEach(appointment => {
        let start = new Date(appointment.startDate);
        let end = new Date(appointment.endDate);
        let check = new Date(checkDate);

        console.log(`🕒 Booking Room ID: ${appointment.ghm_room_id}, Start: ${start}, End: ${end}`);

        // Cek apakah checkDate berada dalam rentang startDate - endDate
        if (appointment.ghm_room_id === roomId && check >= start && check <= end) {
            let guestCount = safeArray(appointment.guest).length;
            let familyCount = safeArray(appointment.family).length;
            let employeeCount = safeArray(appointment.employee_id).length;

            console.log(`✔️ Ditemukan booking dalam rentang tanggal: Guest=${guestCount}, Family=${familyCount}, Employee=${employeeCount}`);

            totalGuests += guestCount + familyCount + employeeCount;
        }
    });

    console.log(`✅ Total tamu di kamar ${roomId} pada ${checkDate}: ${totalGuests}`);
    return totalGuests;
}

// Fungsi untuk membandingkan tanggal tanpa memperhitungkan waktu
function isSameDate(date1, date2) {
    let d1 = new Date(date1);
    let d2 = new Date(date2);
    return d1.toDateString() === d2.toDateString();
}

function updateScheduler(location, roomId) {
    let dataSource = roomsWithLocations.filter(emp => emp.location === location);
    if (roomId) {
        dataSource = dataSource.filter(emp => emp.id === roomId);
    }
// Fungsi untuk reload scheduler
function reloadScheduler() {
    setTimeout(() => {
        const schedulerElement = document.querySelector("#scheduler");
        if (schedulerElement) {
            const scheduler = $("#scheduler").dxScheduler("instance");
            if (scheduler) {
                scheduler.getDataSource().reload().done(() => scheduler.repaint());
            } else {
                console.error("Scheduler instance is undefined.");
            }
        } else {
            console.error("Scheduler element not found in DOM.");
        }
    }, 500); // Delay agar DOM diperbarui dulu
}
// Fungsi untuk menghapus booking
function deleteBooking(bookingId) {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    sendRequest(apiurl + "/" + modname + "/" + bookingId, "DELETE")
        .then(response => {
            if (response.status === "success") {
                alert("Booking deleted successfully!");
                reloadScheduler(); // Reload setelah sukses delete
            } else {
                alert("Error: " + (response.message || "Failed to delete booking."));
            }
        })
        .catch(error => {
            alert("Error: " + (error.responseText || "Unknown error."));
        });
}
    console.log('Booking Data:', booking); // Debug log for bookings

    $('.scheduler').dxScheduler({
        timeZone: 'Asia/Makassar',
        dataSource: booking,
        views: ['month'],
        currentView: 'month',
        currentDate: new Date(),
        firstDayOfWeek: 1,
        startDayHour: 10,
        endDayHour: 22,
        // firstDayOfWeek: 1,
        showAllDayPanel: false,
        height: 710,
        groups: ['ghm_room_id'],
        resources: [
            {
                fieldExpr: 'ghm_room_id',
                allowMultiple: false,
                dataSource: dataSource,
                label: 'Room Name',
                useColorAsDefault: true
            },
        ],
        editing: {
            allowAdding: true,
            allowUpdating: true,
            allowDeleting: true,
        },
        
        appointmentTooltipTemplate: function(model) {
            const booking = model.appointmentData;
            const room = roomsWithLocations.find(room => room.id === booking.ghm_room_id);
            const roomAccupancy = room?.roomAccupancy || 0;
        
            // Hitung total orang di booking
            const guestCount = safeArray(booking.guest).length;
            const familyCount = safeArray(booking.family).length;
            const employeeCount = safeArray(booking.employee_id).length;
            const totalPeople = guestCount + familyCount + employeeCount;
        
            // Hitung sisa kapasitas kamar
            const remainingCapacity = roomAccupancy - totalPeople;
        
            // Format tanggal dengan aman
            const formatDate = (date) => {
                if (!date) return "No Date";
                const d = new Date(date);
                return isNaN(d.getTime()) ? "No Date" : d.toISOString().split("T")[0];
            };
        
            // ID unik untuk tombol delete
            const deleteButtonId = `delete-btn-${booking.id}`;
            const tooltipHtml = `
                <div>
                    <b>Subject: ${booking.text || "No Title"}</b><br>
                    ${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}<br>
                    <b>Accupancy:</b> ${roomAccupancy} Person<br>
                    <b>Booked:</b> ${totalPeople} Person<br>
                    <b>Remaining:</b> ${remainingCapacity} Person<br>
                    <b>Created By:</b> ${booking.creator || "No Name"}<br><br>
                    <button id="${deleteButtonId}" class="btn btn-danger btn-sm">Delete</button>
                </div>
            `;
        
            // Gunakan MutationObserver untuk memastikan tombol tersedia di DOM
            const observer = new MutationObserver((mutations) => {
                const deleteButton = document.getElementById(deleteButtonId);
                if (deleteButton) {
                    deleteButton.addEventListener("click", function(event) {
                        event.stopPropagation(); // Mencegah popup scheduler terbuka
                        event.preventDefault();
        
                        if (confirm("Are you sure you want to delete this booking?")) {
                            sendRequest(apiurl + "/" + modname + "/" + booking.id, "DELETE")
                                .then(response => {
                                    if (response.status === "success") {
                                        alert("Booking deleted successfully!");
                                        reloadScheduler(); // Panggil fungsi untuk reload scheduler
                                    } else {
                                        alert("Error: " + (response.message || "Failed to delete booking."));
                                    }
                                })
                                .catch(error => {
                                    alert("Error: " + (error.responseText || "Unknown error."));
                                });
                        }
                    });
                    observer.disconnect(); // Hentikan observer setelah tombol ditemukan
                }
            });
        
            observer.observe(document.body, { childList: true, subtree: true });
        
            return tooltipHtml;
        },
        dataCellTemplate: function(cellData, index, container) {
            const { ghm_room_id } = cellData.groups;
            const currentTraining = getCurrentTraining(cellData.startDate.getDate(), ghm_room_id);

            const wrapper = $('<div>')
                .toggleClass(`employee-weekend-${ghm_room_id}`, isWeekEnd(cellData.startDate))
                .appendTo(container)
                .addClass(`employee-${ghm_room_id}`)
                .addClass('dx-template-wrapper');

            wrapper.append($('<div>')
                .text(cellData.text)
                .text(cellData.roomAccupancy)
                .addClass(currentTraining)
                .addClass('day-cell'));
        },
        resourceCellTemplate: function(cellData) {
            const name = $('<div>')
                .addClass('name')                    
                .append($('<h2>').text(cellData.text));
        
            const roomAccupancy = $('<div>')
                .addClass('roomAccupancy')
                .html(`Bed: ${cellData.data.roomAccupancy}`);
        
            // Tentukan warna berdasarkan jumlah bed
            let bgColor;
            if (cellData.data.roomAccupancy == 4) {
                bgColor = "#4caf50"; // Hijau untuk kamar dengan banyak bed
            } else if (cellData.data.roomAccupancy == 3) {
                bgColor = "#ff9800"; // Oranye untuk kamar dengan kapasitas sedang            
            } else if (cellData.data.roomAccupancy == 2) {
                bgColor = "#ff9800"; // Oranye untuk kamar dengan kapasitas sedang
            } else {
                bgColor = "#f44336"; // Merah untuk kamar dengan kapasitas sedikit
            }
        
            const combinedColumn = $('<div>')
                .addClass('combined-column')
                .append(name, roomAccupancy)
                .css({
                    backgroundColor: bgColor,
                    padding: '10px',
                    borderRadius: '5px',
                    color: '#fff',
                    textAlign: 'center'
            });

            return combinedColumn;
        },
        onCellPrepared: function(e) {
            // **Sembunyikan kolom 'code' jika null**
            if (e.rowType == "data" && e.column.dataField === "code") {
                const isCodeVisible = e.data.code !== null;
                $("#formdata").dxDataGrid('columnOption', 'code', 'visible', isCodeVisible);
            }
        
            // **Tandai sel kosong dengan warna merah muda**
            if (e.rowType == "data" && (e.column.index > 0 && e.column.index < 6)) {
                if (!e.value || /^\s*$/.test(e.value)) {
                    e.cellElement.css({
                        "backgroundColor": "#ffe6e6",
                        "border": "0.5px solid #f56e6e"
                    });
                }
            }
        
            // **Tandai baris dengan `isParent === 1`**
            if (e.rowType == "data" && e.data.isParent === 1) {
                e.cellElement.css('background', 'rgba(128, 128, 0, 0.1)');
            }
        },
        onAppointmentFormOpening: function(e) {
            const form = e.form;
            const appointmentData = e.appointmentData;
            // const isNewAppointment = !appointmentData.id;

            console.log('Appointment Data:', appointmentData); // Debug log

            if (appointmentData.employee_id && typeof appointmentData.employee_id === 'string') {
                appointmentData.employee_id = deserializeFromJSON(appointmentData.employee_id);
            }
            if (appointmentData.guest && typeof appointmentData.guest === 'string') {
                // console.log(appointmentData.guest)
                appointmentData.guest = deserializeFromJSON(appointmentData.guest);
                // console.log(appointmentData.guest)
            } else if (!appointmentData.guest) {
                appointmentData.guest = []; // Inisialisasi dengan string kosong jika nilai `guest` adalah `null` atau `undefined`
            }
            if (appointmentData.family && typeof appointmentData.family === 'string') {
                // console.log(appointmentData.family)
                appointmentData.family = deserializeFromJSON(appointmentData.family);
                // console.log(appointmentData.family)
            } else if (!appointmentData.family) {
                appointmentData.family = []; // Inisialisasi dengan string kosong jika nilai `family` adalah `null` atau `undefined`
            }

            function validateBooking() {
                let guestCount = (form.getEditor("guest")?.option("value") || []).length;
                let familyCount = (form.getEditor("family")?.option("value") || []).length;
                let employeeCount = (form.getEditor("employee_id")?.option("value") || []).length;

                let totalGuests = guestCount + familyCount + employeeCount;
                console.log("total guest",totalGuests);
                let selectedRoom = form.getEditor("ghm_room_id")?.option("value");
                // let roomAccupancy = room?.roomAccupancy || 0;
                let roomCapacity = roomsWithLocations.find(room => room.id === selectedRoom)?.roomAccupancy || 0;
                console.log("total Kaps",roomCapacity);
        
                let doneButton = $(".dx-popup-bottom .dx-button.dx-popup-done");
        
                if (totalGuests > roomCapacity) {
                    // doneButton.addClass("dx-state-disabled");
                    DevExpress.ui.notify("Jumlah tamu melebihi kapasitas kamar!", "error", 2000);
                // } else { 
                    // doneButton.removeClass("dx-state-disabled");
                }
            }
            
            form.option('items', [                
                {
                    itemType: 'group',
                    colCount: 1,
                    caption: 'Interests',
                    items: [
                        {
                            label: { text: 'Code' },
                            // editorType: 'dxTextBox',
                            dataField: 'code',
                            editorOptions: {
                                readOnly: true,
                                value: appointmentData.code || ''
                            }
                        },
                        {
                            label: { text: 'Subject' },
                            editorType: 'dxTextBox',
                            dataField: 'text',
                            editorOptions: {
                                value: appointmentData.text || ''
                            }
                        },
                        {
                            label: { text: 'Description' },
                            editorType: 'dxTextArea',
                            dataField: 'description',
                            editorOptions: {
                                value: appointmentData.description || ''
                            }
                        },                            
                    ]
                },
                {
                    itemType: 'group',
                    caption: 'Room & Date',
                    items: [
                        {
                            label: { text: 'Room' },
                            editorType: 'dxSelectBox',
                            dataField: 'ghm_room_id',
                            editorOptions: {
                                dataSource: roomsWithLocations,
                                displayExpr: 'text',
                                valueExpr: 'id',
                                value: appointmentData.ghm_room_id || null,
                                onValueChanged: validateBooking
                            }
                        },
                        {
                            label: { text: 'Start Date' },
                            editorType: 'dxDateBox',
                            dataField: 'startDate',
                            editorOptions: {
                                type: 'datetime',
                                value: appointmentData.startDate,
                                displayFormat: 'yyyy-MM-dd HH:mm:ss',
                                dateSerializationFormat: 'yyyy-MM-ddTHH:mm:ssZ'
                            }
                        },
                        {
                            label: { text: 'End Date' },
                            editorType: 'dxDateBox',
                            dataField: 'endDate',
                            editorOptions: {
                                type: 'datetime',
                                value: appointmentData.endDate,
                                displayFormat: 'yyyy-MM-dd HH:mm:ss',
                                dateSerializationFormat: 'yyyy-MM-ddTHH:mm:ssZ'
                            }
                        },
                                                
                    ]
                },
                {
                    itemType: 'group',
                    colSpan: 2,
                    caption: 'Guest Type',
                    items: [
                        {                                
                            title: 'Employee',
                            label: { text: 'Employee' },
                            editorType: 'dxTagBox',
                            dataField: 'employee_id',
                            editorOptions: {                                                
                                dataSource: emplo,
                                displayExpr: function(item) {
                                    if (!item) return "";
                                    const department = departments.find(dept => dept.id === item.department_id);
                                    return `${item.FullName} | ${item.SAPID} | ${department ? department.DepartmentName : "Failed"}`;                                    
                                },
                                valueExpr: 'id',
                                value: Array.isArray (appointmentData.employee_id) ? appointmentData.employee_id : [],
                                showSelectionControls: true,
                                applyValueMode: 'useButtons',
                                searchEnabled: true,
                                onValueChanged: validateBooking
                            }                            
                        },
                        {                                        
                            title: 'Guest',
                            editorType: 'dxTagBox',
                            dataField: 'guest',
                            editorOptions: {
                                dataSource: [],
                                value: Array.isArray(appointmentData.guest) ? appointmentData.guest : [],
                                acceptCustomValue: true,
                                searchEnabled: true,
                                showSelectionControls: true,
                                applyValueMode: 'useButtons',
                                onCustomItemCreating: function(args) {
                                    let newValue = args.text;
                                    let guests = form.option('formData').guest || [];
                                    if (!guests.includes(newValue)) {
                                        guests.push(newValue);
                                        args.customItem = newValue;
                                    } else {
                                        args.customItem = null;
                                    }
                                    // appointmentData.guest = guests;
                                    // let newFormData = { ...form.option('fromData'), guest: newGuestList } ;
                                    // form.option('formData', newFormData);
                                    form.updateData('guest', guests);
                                    validateBooking();
                                    // form.repaint();
                                }
                            }
                        },                            
                        {
                            // label: { text: 'Family' },
                            title: 'Family',
                            editorType: 'dxTagBox',
                            dataField: 'family',
                            editorOptions: {
                                dataSource: [],
                                value: Array.isArray(appointmentData.family) ? appointmentData.family : [],
                                acceptCustomValue: true,
                                searchEnabled: true,
                                showSelectionControls: true,
                                applyValueMode: 'useButtons',
                                onCustomItemCreating: function(args) {
                                    let newValue = args.text;
                                    let familys = form.option('formData').family || [];
                                    if (!familys.includes(newValue)) {
                                        familys.push(newValue);
                                        args.customItem = newValue;
                                    } else {
                                        args.customItem = null;
                                    }
                                    // appointmentData.family = familys;
                                    // let newFormData = { ...form.option('fromData'), guest: newGuestList } ;
                                    // form.option('formData', newFormData);
                                    form.updateData('family', familys);
                                    // form.repaint();
                                    validateBooking();
                                }
                            }
                        } 
                    ]
                },
                {
                    itemType: 'group',
                    colSpan: 2,                    
                    items: [                        
                        {                                        
                            title: 'Form Action',
                            editorType: 'dxButton',
                            editorOptions: {
                                text: 'Submit Booking',
                                type: 'success',
                                useSubmitBehavior: true,
                                onClick: function() {
                                    
                                }
                            }
                        }
                        
                    ]
                },                         
            ]);

            setTimeout(validateBooking,100);
        },
        // Event saat user ingin menambahkan booking baru
    onAppointmentAdding: function(e) {
        const appointmentData = e.appointmentData;
        let scheduler = e.component;

        let guestCount = safeArray(appointmentData.guest).length;
        let familyCount = safeArray(appointmentData.family).length;
        let employeeCount = safeArray(appointmentData.employee_id).length;
        let totalNewGuests = guestCount + familyCount + employeeCount;

        let selectedRoom = appointmentData.ghm_room_id;
        let roomCapacity = roomsWithLocations.find(room => room.id === selectedRoom)?.roomAccupancy || 0;

        // Hitung total tamu per hari dalam rentang booking baru
        let dailyGuestCount = getTotalGuestsPerDay(scheduler, selectedRoom, appointmentData.startDate, appointmentData.endDate);

        // Cek apakah ada hari di mana jumlah tamu melebihi kapasitas kamar
        let bookingStart = new Date(appointmentData.startDate);
        let bookingEnd = new Date(appointmentData.endDate);

        for (let d = new Date(bookingStart); d <= bookingEnd; d.setDate(d.getDate() + 1)) {
            let dateKey = d.toISOString().split("T")[0]; // Format YYYY-MM-DD
            let totalGuestsAfterAdding = (dailyGuestCount[dateKey] || 0) + totalNewGuests;

            if (totalGuestsAfterAdding > roomCapacity) {
                e.cancel = true; // Batalkan booking
                DevExpress.ui.notify(`Kapasitas penuh pada ${dateKey}! (${dailyGuestCount[dateKey] || 0}/${roomCapacity})`, "error", 3000);
                return;
            }
        }

        // Serialize array sebelum dikirim
        appointmentData.guest = JSON.stringify(appointmentData.guest);
        appointmentData.family = JSON.stringify(appointmentData.family);

        // Kirim data booking ke server
        sendRequest(apiurl + "/" + modname, "POST", {
            requestStatus: 0,
            text: appointmentData.text,
            description: appointmentData.description,
            startDate: appointmentData.startDate,
            endDate: appointmentData.endDate,
            ghm_room_id: appointmentData.ghm_room_id,
            employee_id: appointmentData.employee_id,
            guest: appointmentData.guest,
            family: appointmentData.family
        }).then(function(response) {
            if (response.status === 'success') {
                e.component._dataSource.reload();
                DevExpress.ui.notify("Booking berhasil dibuat!", "success", 2000);
            } else {
                DevExpress.ui.notify("Error: " + response.message, "error", 3000);
            }
        }).catch(function(error) {
            DevExpress.ui.notify("Error: " + error.responseText, "error", 3000);
        });
    },
        onAppointmentUpdating: function(e) {            
            const appointmentData = e.newData;
            const formatDateForDB = (date) => {
                const d = new Date(date);
                return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
            };
            appointmentData.startDate = formatDateForDB(appointmentData.startDate);
            appointmentData.endDate = formatDateForDB(appointmentData.endDate);
            appointmentData.id = e.oldData.id; // Ensure id is included in appointmentData for updating            
            // appointmentData.employee_id = serializeToJSON(appointmentData.employee_id);
            // appointmentData.employee_id = Array.isArray(appointmentData.employee_id) ? JSON.stringify(appointmentData.employee_id):appointmentData.employee_id;
            appointmentData.guest = Array.isArray(appointmentData.guest) ? JSON.stringify(appointmentData.guest):appointmentData.guest;
            appointmentData.family = Array.isArray(appointmentData.family) ? JSON.stringify(appointmentData.family):appointmentData.family;
            console.log('Updating appointment with data:', appointmentData); // Debug log
            var newTicketStatus = e.newData.ticketStatus;
            var newConfirmationStatus = e.newData.confirmationStatus;
            if (newTicketStatus === "Completed") {
                if (!confirm("Are you sure you want to mark this ticket as completed?")) {
                    e.cancel = true; // Cancel the update operation
                } else {
                    e.newData.confirmationStatus = 'Waiting'; // Update the confirmationStatus to 'Waiting'
                    e.component.columnOption("ticketStatus", "allowEditing", false);                                }
            }
            if (newConfirmationStatus === "Reworked") {
                if (!confirm("Are you sure you want to mark this confirmation status as reworked?")) {
                    e.cancel = true; // Cancel the update operation
                } else {
                    e.newData.ticketStatus = 'On Queue'; // Update the ticket status to 'On Queue'
                    e.component.columnOption("confirmationStatus", "allowEditing", false);
                    e.component.columnOption("confirmationRemarks", "allowEditing", false);
                }
            }
            if (newConfirmationStatus === "Completed") {
                if (!confirm("Are you sure you want to mark this confirmation status as completed?")) {
                    e.cancel = true; // Cancel the update operation
                } else {
                    e.component.columnOption("confirmationStatus", "allowEditing", false);
                    e.component.columnOption("confirmationRemarks", "allowEditing", false);
                }
            }
        

            sendRequest(apiurl + "/" + modname + "/" + appointmentData.id, "PUT", {
                text: appointmentData.text,
                description: appointmentData.description,
                startDate: appointmentData.startDate,
                endDate: appointmentData.endDate,
                ghm_room_id: appointmentData.ghm_room_id,
                employee_id: appointmentData.employee_id,
                guest: appointmentData.guest,
                family: appointmentData.family,
                id: appointmentData.id // Ensure id is included in the request body
            }).then(function(response) {
                console.log('Response from updating appointment:', response); // Debug log
                if (response.status === 'success') {
                    e.component.repaint();
                    alert('Booking updated successfully!');
                } else {
                    alert('Error: ' + response.message);
                }
            }).catch(function(error) {
                console.error('Error from updating appointment:', error); // Debug log
                alert('Error: ' + error.responseText);
            });
        }
    });
}

function isWeekEnd(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

function getCurrentTraining(date, ghm_room_id) {
    const result = (date + ghm_room_id) % 3;
    const currentTraining = `training-background-${result}`;
    return currentTraining;
}
updateRoomSelector(uniqueLocations[0]);
    // Add click event handler for add button
    $('#btnadd').on('click', function() {
        sendRequest(apiurl + "/" + modname, "POST", { requestStatus: 0 }).then(function(response) {
            const reqid = response.data.id;
            console.log(reqid);
            const mode = 'add';
            const options = { "data": { "isMine": 1 } };
            popup.option({
                contentTemplate: () => popupContentTemplate(reqid, mode, options),
            });
            popup.show();
        });
    });
});
// jalankan ini kawan
function btnreqsubmit(reqid, mode) {
    var btnSubmit = $('#btn-submit');
    btnSubmit.prop('disabled', true);
    var actionForm = (mode == 'approval') ? 'approval' : 'submission';
    
    var valapprovalAction = $('input[name="approvalaction"]:checked').val() || null;

    if (mode == 'approval' && !valapprovalAction) {
        alert('Please select approval action.');
        btnSubmit.prop('disabled', false);
        return false;
    }

    var valApprovalType = (valapprovalAction == 3) ? 'Approved' :
                          (valapprovalAction == 2) ? 'Reworked' :
                          (valapprovalAction == 4) ? 'Rejected' : '';

    Swal.fire({
        title: 'Are you sure?',
        text: "Are you sure you want to send this submission?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, send it!'
    }).then((result) => {
        if (result.isConfirmed) {
            showLoadingScreen();

            if (typeof apiurl === "undefined" || typeof modelclass === "undefined") {
                alert("API URL atau modelclass tidak tersedia!");
                btnSubmit.prop('disabled', false);
                hideLoadingScreen();
                return;
            }

            sendRequest(apiurl + "/submissionrequest/" + reqid + "/" + modelclass, "POST", {
                requestStatus: 1,
                action: actionForm,
                approvalAction: parseInt(valapprovalAction) || 1,
                approvalType: valApprovalType,
            }).then(function(response) {
                btnSubmit.prop('disabled', false);
                hideLoadingScreen();
                
                if (response.status === 'error') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.message || 'An error occurred.',
                    });
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: 'Saved',
                        text: 'The submission has been submitted.',
                    });
                    popup.hide();
                }
            });
        } else {
            btnSubmit.prop('disabled', false);
            Swal.fire({
                icon: 'error',
                title: 'Cancelled',
                text: 'The submission has been cancelled.',
                confirmButtonColor: '#3085d6'
            });
            hideLoadingScreen();
        }
    });
}
function runpopup() {
    popup = $('#popup').dxPopup({
        contentTemplate: popupContentTemplate,
        container: '.content',
        showTitle: true,
        title: 'Submission Detail',
        visible: false,
        dragEnabled: false,
        hideOnOutsideClick: false,
        showCloseButton: true,
        fullScreen : false,
        onShowing: function(e) {
        },
        onShown: function(e) {
        },
        onHidden: function(e) {
            dataGrid.refresh();
        },
        toolbarItems: [
            {
                widget: 'dxButton',
                toolbar: 'bottom',  // Set the button to the bottom toolbar
                location: 'after',
                options: {
                    text: "Fullscreen",
                    onClick: function() {
                        if (popup.option("fullScreen")) {
                            popup.option("fullScreen", false);
                            this.option("text", "Enable Fullscreen");
                        } else {
                            popup.option("fullScreen", true);
                            this.option("text", "Disable Fullscreen");
                        }
                    }
                }
            },
            {
                widget: 'dxButton',
                toolbar: 'bottom',
                location: 'after',
                options: {
                    text: 'Close',
                    onClick() {
                        popup.hide();
                    },
                },
            }
        ]
    }).dxPopup('instance');
}

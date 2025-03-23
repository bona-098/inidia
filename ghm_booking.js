var modname = 'ghmrequest';
var modelclass = 'Ghm';
var popupmode;
var dataSubmitted = false; 
var schedulerInstance;
function serializeToJSON(employeeIds) {
    return JSON.stringify(employeeIds);
}
function deserializeFromJSON(jsonString) {
    return JSON.parse(jsonString);
}
$(function () {
    function submitFormData() {
        if (dataSubmitted) return;
        dataSubmitted = true;
        const formData = $('#booking-form').serializeArray();
        const guestField = formData.find(field => field.name === 'guest');
        guestField.value = (guestField.value.split(',').map(name => name.trim()));
        const familyField = formData.find(field => field.name === 'family');
        familyField.value = serializeToJSON(familyField.value.split(',').map(name => name.trim()));
        // Tambahkan logika untuk mendukung dokumen pendukung
        const supportingDocumentField = formData.find(field => field.name === 'supportingDocument');
        if (supportingDocumentField && supportingDocumentField.value.length > 0) {
            formData.push({ name: 'supportingDocument', value: supportingDocumentField.value });
        }

        sendRequest(apiurl + "/" + modname, "POST", formData)
        .then(function (response) {
            if (response.status === 'success') {
                alert('Booking created successfully!');
                loadData();
            } else {
                alert('Error: ' + response.message);
            }
        }).catch(function (error) {
            alert('Error: ' + error.responseText);
        }).finally(function () {
            dataSubmitted = false;
        });
    }
    function submitIdToDatabase(id) {
        return sendRequest(apiurl + "/submit-id", "POST", { id: id })
            .then(function (response) {
                if (response.status === 'success') {
                    console.log('ID submitted successfully');
                } else {
                    console.log('Error submitting ID: ' + response.message);
                }
            })
            .catch(function (error) {
                console.log('Error submitting ID: ' + error.responseText);
            });
    }
    $('#booking-form').on('submit', function (event) {
        event.preventDefault();
        submitFormData();
    });
    $('#location-selector').dxSelectBox({
        dataSource: uniqueLocations,
        displayExpr: function (item) {
            return item || "";
        },
        valueExpr: function (item) {
            return item;
        },
        value: uniqueLocations[0],
        onValueChanged: function (e) {
            const selectedLocation = e.value;
            updateRoomSelector(selectedLocation);
        }
    });    
    $("#btn-desc").dxButton({
        icon: "help",
    });
    $("#btn-help").dxButton({
        icon: "help",
        onClick() {
            $("#popup-container").dxPopup("show");
        }
    });
    async function loadNewData() {                
        return fetch('ghm_booking', {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(response => response.json())
        .then(response => {
            bookingData = response.booking;    
            console.log("Data New Booking Loaded:", bookingData);
            return response.booking;
        }).catch(function (error) {
            alert('Error: ' + error.responseText);
            return null;
        });
    }
    function loadData() {    
        schedulerInstance.option("dataSource", null);
        schedulerInstance.repaint();    
        fetch('ghm_booking', {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(response => response.json())
        .then(response => {
            let data = response.booking;    
            console.log("Data Booking Loaded:", data);
            schedulerInstance.option("dataSource", data);
            schedulerInstance.repaint();
        }).catch(function (error) {
            alert('Error: ' + error.responseText);
        });
    }
    $("#btn-refresh").dxButton({
        icon: "refresh",
        onClick: function() {
            loadData();
        }
    });
    $("#popup-container").dxPopup({
        contentTemplate: function (contentElement) {
            var tableHtml = `
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #dddddd; padding: 8px; text-align: left;">Color</th>
                            <th style="border: 1px solid #dddddd; padding: 8px; text-align: left;">Status</th>
                            <th style="border: 1px solid #dddddd; padding: 8px; text-align: left;">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="background-color: #6C757D; color: #fff; border: 1px solid #dddddd; padding: 8px;"></td>
                            <td style="border: 1px solid #dddddd; padding: 8px;">Draft</td>
                            <td style="border: 1px solid #dddddd; padding: 8px;">Your request has been saved as a draft</td>
                        </tr>
                        <tr>
                            <td style="background-color: #007BFF; color: #fff; border: 1px solid #dddddd; padding: 8px;"></td>
                            <td style="border: 1px solid #dddddd; padding: 8px;">Pending</td>
                            <td style="border: 1px solid #dddddd; padding: 8px;">Your request has been submitted and is awaiting approval</td>
                        </tr>
                        <tr>
                            <td style="background-color: #FFC107; border: 1px solid #dddddd; padding: 8px;"></td>
                            <td style="border: 1px solid #dddddd; padding: 8px;">Rework</td>
                            <td style="border: 1px solid #dddddd; padding: 8px;">Your request requires action</td>
                        </tr>
                        <tr>
                            <td style="background-color: #28A745; color: #fff; border: 1px solid #dddddd; padding: 8px;"></td>
                            <td style="border: 1px solid #dddddd; padding: 8px;">Approve</td>
                            <td style="border: 1px solid #dddddd; padding: 8px;">Your submission has been accepted</td>
                        </tr>
                        <tr>                    
                            <td style="background-color: #DC3545; color: #fff; border: 1px solid #dddddd; padding: 8px;"></td>
                            <td style="border: 1px solid #dddddd; padding: 8px;">Rejected</td>
                            <td style="border: 1px solid #dddddd; padding: 8px;">Your submission has been rejected by HR</td>
                        </tr>
                        <tr>                    
                            <td style="background-color: #DC3545; color: #fff; border: 1px solid #dddddd; padding: 8px;"></td>
                            <td style="border: 1px solid #dddddd; padding: 8px;">Delete</td>
                            <td style="border: 1px solid #dddddd; padding: 8px;">Delete Your submission</td>
                        </tr>
                        <tr>                    
                            <td style="background-color: #FFC107; color: #fff; border: 1px solid #dddddd; padding: 8px;"></td>
                            <td style="border: 1px solid #dddddd; padding: 8px;">Cancel</td>
                            <td style="border: 1px solid #dddddd; padding: 8px;">Cancel Your submission from pending</td>
                        </tr>
                        <!-- Tambahkan baris lain sesuai kebutuhan -->
                    </tbody>
                </table>
            `;
            contentElement.append(tableHtml);
        },
        width: 500,
        height: 400,
        showTitle: true,
        title: "Help",
        visible: false,
        dragEnabled: true,
        hideOnOutsideClick: true
    });
    function updateRoomSelector(location) {
        const filteredRooms = roomsWithLocations.filter(emp => emp.location === location);
        $('#room-selector').dxSelectBox({
            dataSource: filteredRooms,
            displayExpr: 'text',
            valueExpr: 'id',
            value: null,
            placeholder: 'Select Room',
            onValueChanged: function (e) {
                const selectedRoomId = e.value;
                updateScheduler(location, selectedRoomId);
            }
        });
        updateScheduler(location, null);
    }
    function safeArray(arr) {
        return Array.isArray(arr) ? arr : [];
    }
    async function getTotalGuestsPerDay(appointments, roomId, startDate, endDate) {
        let dailyGuestCount = 0; 
        appointments.forEach(appointment => {
        if (appointment.requestStatus == 4) {
            console.log(`Skipping rejected booking ID: ${appointment.id}`);
            return;
        }   
            let bookingStart = new Date(startDate);
            let bookingEnd = new Date(endDate);

            if ((appointment.ghm_room_id === roomId) && ((
                (new Date (appointment.startDate) <= bookingEnd) && (new Date (appointment.startDate) > bookingStart)
                ) || ((new Date (appointment.endDate) <= bookingEnd) && (new Date (appointment.endDate) > bookingStart))
            )) 
            {                
                let guestCount = safeArray(appointment.guest).length;
                    let familyCount = safeArray(appointment.family).length;
                    let employeeCount = safeArray(appointment.employee).length;
                    let totalGuests = guestCount + familyCount + employeeCount;

                    dailyGuestCount = (dailyGuestCount || 0) + totalGuests;
                    console.log("dailyGuestCount", dailyGuestCount);
            }
        });
        return dailyGuestCount;
    }
    function moveEditColumnToLeft(dataGrid) {
        dataGrid.columnOption("command:edit", { 
            visibleIndex: -1,
            width: 80 
        });
    }
    function updateScheduler(location, roomId) {
        let dataSource = roomsWithLocations.filter(emp => emp.location === location);
        if (roomId) {
            dataSource = dataSource.filter(emp => emp.id === roomId);
        }
        $(document).ready( async function () {
            schedulerInstance = $(".scheduler").dxScheduler({
                timeZone: 'Asia/Makassar',
                dataSource: booking,
                repaintChangesOnly: true,
                views: ['month'],
                currentView: 'month',
                currentDate: new Date(),
                min: new Date(),
                firstDayOfWeek: 1,
                startDayHour: 8,
                endDayHour: 23,
                colorExpr: "color",
                showAllDayPanel: false,
                height: 710,          
                // onCellClick: async function(e) {
                //     if (dataSubmitted) return;
                //     dataSubmitted = true;
                    
                //     let today = new Date();
                //     today.setHours(0, 0, 0, 0); // Hanya ambil tanggal tanpa waktu
                //     // let cellDate = new Date(e.cellData.startDate);
                    
                //     if (cellDate < today) {
                //         e.cancel = true;
                //         DevExpress.ui.notify({
                //             type: "warning",
                //             displayTime: 3000,
                //             contentTemplate: (e) => {
                //                 e.append(`
                //                     <div style="white-space: pre-line;">
                //                     Tidak bisa memilih tanggal yang sudah lewat!\n
                //                     You cannot select a past date!!\n
                //                     </div>
                //                 `);
                //             }
                //         });
                //         dataSubmitted = false;
                //         return;
                //     }
                //     let cellDate = new Date(e.cellData.startDate);
                //     let roomData = roomsWithLocations.find(room => room.id === e.cellData.groups.ghm_room_id);
                //     if (!roomData) {
                //         DevExpress.ui.notify("Room not Found", "error", 3000);
                //         dataSubmitted = false;
                //         return;
                //     }
        
                //     let sector = roomData.sector;
                //     let response = await sendRequest(apiurl + "/"+modname, "POST", {
                //         requestStatus: 0,
                //         ghm_room_id: e.cellData.groups.ghm_room_id,
                //         startDate: e.cellData.startDate,
                //         endDate: e.cellData.endDate,
                //         sector: sector,
                //         employee: e.cellData.employee || [],
                //         guest: e.cellData.guest || [],
                //         family: e.cellData.family || []
                //     });
                //     if(response.status === 'success') {
                //         const reqid = response.data.id;
                //         popup.option({
                //             contentTemplate: () => popupContentTemplate(reqid),
                //         });
                //         popup.show();
                //     } else {
                //         DevExpress.ui.notify({
                //             type: "error",
                //             displayTime: 3000,
                //             contentTemplate: (e) => {
                //                 e.append(`
                //                     <div style="white-space: pre-line;">
                //                     Gagal mendapatkan ID!\n
                //                     Failed to get ID!!\n
                //                     </div>
                //                 `);
                //             }
                //         });
                //     }
                //     dataSubmitted = false;
                //     e.event.preventDefault();
                // },
                // onContentReady: function(e) {
                //     // Tambahkan event listener untuk double click pada cell
                //     $(e.element).find('.dx-scheduler-date-table-cell').on('dblclick', function(event) {
                //         var cellData = e.component.getCellData(event.target);
        
                //         // Panggil fungsi onCellDblClick dengan data cell
                //         onCellDblClick(e.component, cellData);
                //     });
                // },
                groups: ['ghm_room_id'],
                resources: [
                    {
                        fieldExpr: 'ghm_room_id',
                        allowMultiple: false,
                        dataSource: dataSource,
                        label: 'Room Name',
                    },
                ],
                editing: {
                    refreshMode: 'reshape',
                    mode: 'cell',
                    allowAdding: true,
                    allowUpdating: true,
                    allowDeleting: true,
                },
                onAppointmentRendered: function (e) {
                    if (e.appointmentData.requestColor) {
                        e.appointmentElement.css("background-color", e.appointmentData.requestColor);
                        e.appointmentElement.css("color", "#fff"); // Kontras teks agar terlihat jelas
                    } else {
                        e.appointmentElement.css("background-color", "#6C757D"); // Default abu-abu jika warna tidak ditemukan
                    }
                },
                appointmentTooltipTemplate: function (model) {
                    const booking = model.appointmentData;
                    const room = roomsWithLocations.find(room => room.id === booking.ghm_room_id);
                    const roomOccupancy = room?.roomOccupancy || 0;
                    const guestCount = safeArray(booking.guest).length;
                    const familyCount = safeArray(booking.family).length;
                    const employeeCount = safeArray(booking.employee).length;
                    const totalPeople = booking.totalPeople;
                    const totalGuests = guestCount + familyCount + employeeCount;
                    const remainingCapacity = roomOccupancy - totalGuests;
                    const formatDate = (date) => {
                        if (!date) return "No Date";
                        const d = new Date(date);
                        return isNaN(d.getTime()) ? "No Date" : d.toISOString().split("T")[0];
                    };
                    const actionButtonId = `action-btn-${booking.id}`;
                    const isCancelable = Number(booking.requestStatus) === 1 || Number(booking.requestStatus) === 2 || Number(booking.requestStatus) === 3;
                    const buttonLabel = isCancelable ? "Cancel" : "Delete";
                    const buttonClass = isCancelable ? "btn-warning" : "btn-danger";
                    const tooltipHtml = `
                        <div>
                            <b>Purpose (Text): ${booking.text || "No Title"}</b><br>
                            ${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}<br>
                            <b>Occupancy:</b> ${roomOccupancy} Person<br>
                            <b>Booked:</b> ${totalGuests} Person<br>
                            <b>Approve:</b> ${totalPeople} Person<br>
                            <b>Remaining:</b> ${remainingCapacity} Person<br>
                            <b>Created By:</b> ${booking.creator || "No Name"}<br><br>
                            <button id="${actionButtonId}" class="btn ${buttonClass} btn-sm">${buttonLabel}</button>
                        </div>
                    `;
                    setTimeout(() => {  
                        const actionButton = document.getElementById(actionButtonId);
                        if (actionButton) {
                            actionButton.addEventListener("click", function (event) {
                                event.stopPropagation();
                                event.preventDefault();
                                Swal.fire({
                                    title: isCancelable ? 'Cancel Booking?' : 'Are you sure?',
                                    text: isCancelable
                                        ? "Do you really want to cancel this booking?"
                                        : "Do you really want to delete this booking?",
                                    icon: isCancelable ? 'warning' : 'error',
                                    showCancelButton: true,
                                    confirmButtonText: isCancelable ? 'Yes, cancel it!' : 'Yes, delete it!',
                                    cancelButtonText: 'No, keep it'
                                }).then((result) => {
                                    if (!result.isConfirmed) return;
                                    let requestType = isCancelable ? "PATCH" : "DELETE";
                                    let requestData = isCancelable ? { requestStatus: 0 } : {};
                                    sendRequest(apiurl + "/" + modname + "/" + booking.id, requestType, requestData)
                                        .then(response => {
                                            if (response.status === "success") {
                                                Swal.fire({
                                                    icon: 'success',
                                                    title: isCancelable ? 'Booking Canceled!' : 'Deleted!',
                                                    text: isCancelable ?
                                                        'Booking has been successfully set to Canceled.' :
                                                        'Booking deleted successfully!',
                                                    timer: 2000,
                                                    showConfirmButton: false
                                                });
                                                loadData();    
                                            }
                                        })
                                        .catch(error => {
                                            Swal.fire({
                                                icon: 'error',
                                                title: 'Error',
                                                text: error.responseText || "Unknown error."
                                            });
                                        });
                                });
                            });
                        }
                    }, 200);
                    return tooltipHtml;
                },
                dataCellTemplate: function (cellData, index, container) {
                    const { ghm_room_id } = cellData.groups;
                    const currentBooking = getCurrentBooking(cellData.startDate.getDate(), ghm_room_id);
                    const wrapper = $('<div>')
                        .toggleClass(`employee-weekend-${ghm_room_id}`, isWeekEnd(cellData.startDate))
                        .appendTo(container)
                        .addClass(`employee-${ghm_room_id}`)
                        .addClass('dx-template-wrapper');
                    wrapper.append($('<div>')
                        .text(cellData.text)
                        .text(cellData.roomOccupancy)
                        .addClass(currentBooking)
                        .addClass('day-cell'));
                },
                resourceCellTemplate: function (cellData) {
                    const name = $('<div>')
                        .addClass('name')
                        .append($('<h2>').text(cellData.text));
                    const roomOccupancy = $('<div>')
                        .addClass('roomOccupancy')
                        .html(`Bed: ${cellData.data.roomOccupancy}`);
                    let bgColor;
                    if (cellData.data.roomOccupancy == 4) {
                        bgColor = "#B0BEC5"; // Hijau untuk kamar dengan banyak bed
                    } else if (cellData.data.roomOccupancy == 3) {
                        bgColor = "#90A4AE"; // Oranye untuk kamar dengan kapasitas sedang            
                    } else if (cellData.data.roomOccupancy == 2) {
                        bgColor = "#A5D6A7"; // Oranye untuk kamar dengan kapasitas sedang
                    } else {
                        bgColor = "#FFCCBC"; // Merah untuk kamar dengan kapasitas sedikit
                    }
                    const combinedColumn = $('<div>')
                        .addClass('combined-column')
                        .append(name, roomOccupancy)
                        .css({
                            backgroundColor: bgColor,
                            padding: '10px',
                            borderRadius: '5px',
                            color: '#fff',
                            textAlign: 'center'
                        });
                    return combinedColumn;
                },
                onCellPrepared: function (e) {
                    if (e.rowType == "data" && e.column.dataField === "code") {
                        const isCodeVisible = e.data.code !== null;
                        $("#formdata").dxDataGrid('columnOption', 'code', 'visible', isCodeVisible);
                    }
                    if (e.rowType == "data" && (e.column.index > 0 && e.column.index < 6)) {
                        if (!e.value || /^\s*$/.test(e.value)) {
                            e.cellElement.css({
                                "backgroundColor": "#ffe6e6",
                                "border": "0.5px solid #f56e6e"
                            });
                        }
                    }
                    if (e.rowType == "data" && e.data.isParent === 1) {
                        e.cellElement.css('background', 'rgba(128, 128, 0, 0.1)');
                    }
                },  
                onAppointmentFormOpening: function (e) {
                    e.popup.option({
                        width: 700,
                        height: 800,
                    });
                
                    const form = e.form;
                    const appointmentData = e.appointmentData;
                    // Tambahkan pengecekan untuk e.cellData dan e.cellData.ghm_room_id
                    if (!e.cellData || !e.cellData.ghm_room_id) {
                        DevExpress.ui.notify("Room ID is not defined", "error", 3000);
                        dataSubmitted = false;
                        return;
                    }

                    let roomData = roomsWithLocations.find(room => room.id === e.cellData.ghm_room_id);
                    if (!roomData) {
                        DevExpress.ui.notify("Room not Found", "error", 3000);
                        dataSubmitted = false;
                        return;
                    }
                    
                    let cellDate = new Date(e.cellData.startDate);
                    let reqid = appointmentData.id;
                    if (reqid == null) {
                        let response = sendRequest(apiurl + "/"+modname, "POST", {
                            requestStatus: 0,
                            ghm_room_id: e.cellData.ghm_room_id,
                            startDate: e.cellData.startDate,
                            endDate: e.cellData.endDate,
                            sector: sector,
                            employee: e.cellData.employee || [],
                            guest: e.cellData.guest || [],
                            family: e.cellData.family || []
                        });
                        if(response.status === 'success') {
                            const reqid = response.data.id;
                            popup.option({
                                contentTemplate: () => popupContentTemplate(reqid),
                            });
                            popup.show();
                        } else {
                            DevExpress.ui.notify({
                                type: "error",
                                displayTime: 3000,
                                contentTemplate: (e) => {
                                    e.append(`
                                        <div style="white-space: pre-line;">
                                        Gagal mendapatkan ID!\n
                                        Failed to get ID!!\n
                                        </div>
                                    `);
                                }
                            });
                        }
                        dataSubmitted = false;
                        e.event.preventDefault();
                    }                    
                    console.log("req", reqid);
                    let selectedRoom = appointmentData.ghm_room_id || null;
                    let newStartDate = new Date(appointmentData.startDate);
                    let newEndDate = new Date(appointmentData.endDate);
                    let appointments = e.component.option("dataSource") || [];
                    let totalBooked = appointments
                        .filter(a =>
                            a.ghm_room_id === selectedRoom &&
                            new Date(a.startDate) <= newEndDate &&
                            new Date(a.endDate) >= newStartDate
                        )
                        .reduce((sum, a) => sum + (Number(a.totalPeople) || 0), 0);
                
                    function validateBooking() {
                        let roomCapacity = roomsWithLocations.find(room => room.id === selectedRoom)?.roomOccupancy || 0;
                        let remainingCapacity = roomCapacity - totalBooked;
                        if (totalBooked > roomCapacity) {
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
                        let formData = form.option("formData");
                        let hasGuestOrFamily = (formData.guest && formData.guest.length > 0) || (formData.family && formData.family.length > 0);
                        form.itemOption("supportingDocument", "isRequired", hasGuestOrFamily);
                        let warningMessage = $("#supportingDocumentWarning");
                        if (hasGuestOrFamily) {
                            if (warningMessage.length === 0) {
                                $("#formattachment").after(
                                    "<div id='supportingDocumentWarning' style='color: red; margin-top: 5px;'>* Supporting Document is required for Guest or Family.</div>"
                                );
                            }
                        } else {
                            warningMessage.remove();
                        }
                        return { roomCapacity, remainingCapacity, totalBooked };
                    }
                
                    // function cleanupForm() {
                    //     console.log("Cleaning up form...");
                    //     form.option("formData", {});
                    //     let dataGridAttachment = $("#formattachment").dxDataGrid("instance");
                    //     if (dataGridAttachment) {
                    //         console.log("Resetting data source...");
                    //         dataGridAttachment.option("dataSource", []);
                    //     }
                    // }
                
                    const { roomCapacity, remainingCapacity } = validateBooking();
                    form.option('items', [
                        {
                            itemType: 'group',
                            colCount: 1,
                            caption: 'Interests',
                            items: [
                                {
                                    label: { text: 'Code' },
                                    dataField: 'code',
                                    editorOptions: {
                                        readOnly: true,
                                        value: appointmentData.code || ''
                                    }
                                },
                                {
                                    label: { text: 'Purpose' },
                                    editorType: 'dxTextBox',
                                    dataField: 'text',
                                    editorOptions: {
                                        value: appointmentData.text || ''
                                    },
                                    validationRules: [{ type: "required", message: 'Purpose is required', }],
                                },
                                {
                                    label: { text: 'Details' },
                                    editorType: 'dxTextArea',
                                    dataField: 'description',
                                    editorOptions: {
                                        value: appointmentData.description || ''
                                    },
                                    validationRules: [{ type: "required", message: 'Details is required', }],
                                }
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
                                    }
                                },
                                {
                                    label: { text: 'Start Date' },
                                    editorType: 'dxDateBox',
                                    dataField: 'startDate',
                                    editorOptions: {
                                        type: 'datetime',
                                        value: appointmentData.startDate,
                                        displayFormat: 'dd-MM-yyyy HH:mm:ss',
                                        dateSerializationFormat: 'yyyy-MM-ddTHH:mm:ssZ'
                                    },
                                    validationRules: [{ type: "required", message: 'startDate is required' }],
                                },
                                {
                                    label: { text: 'End Date' },
                                    editorType: 'dxDateBox',
                                    dataField: 'endDate',
                                    editorOptions: {
                                        type: 'datetime',
                                        value: appointmentData.endDate,
                                        displayFormat: 'dd-MM-yyyy HH:mm:ss',
                                        dateSerializationFormat: 'yyyy-MM-ddTHH:mm:ssZ'
                                    },
                                    validationRules: [{ type: "required", message: 'endDate is required' }],
                                },
                                {
                                    label: { text: 'Status' },
                                    editorType: 'dxSelectBox',
                                    dataField: 'requestStatus',
                                    editorOptions: {
                                        readOnly: true,
                                        dataSource: [
                                            { id: "0", text: "Draft" },
                                            { id: "1", text: "Waiting Approval" },
                                            { id: "2", text: "Rework" },
                                            { id: "3", text: "Approved" },
                                            { id: "4", text: "Rejected" }
                                        ],
                                        displayExpr: "text",
                                        valueExpr: "id",
                                        value: String(appointmentData.requestStatus || "0") // Pastikan selalu dalam string
                                    }
                                }
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
                                    dataField: 'employee',
                                    editorOptions: {
                                        dataSource: emplo,
                                        displayExpr: function (item) {
                                            if (!item) return "";
                                            const department = departments.find(dept => dept.id === item.department_id);
                                            return `${item.FullName} | ${item.SAPID} | ${department ? department.DepartmentName : "Failed"}`;
                                        },
                                        valueExpr: 'id',
                                        value: Array.isArray(appointmentData.employee) ? appointmentData.employee : [],
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
                                        onCustomItemCreating: function (args) {
                                            let newValue = args.text;
                                            let guests = form.option('formData').guest || [];
                                            if (!guests.includes(newValue)) {
                                                guests.push(newValue);
                                                args.customItem = newValue;
                                            } else {
                                                args.customItem = null;
                                            }
                                            form.updateData('guest', guests);
                                            validateBooking();
                                        }
                                    }
                                },
                                {
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
                                        onCustomItemCreating: function (args) {
                                            let newValue = args.text;
                                            let familys = form.option('formData').family || [];
                                            if (!familys.includes(newValue)) {
                                                familys.push(newValue);
                                                args.customItem = newValue;
                                            } else {
                                                args.customItem = null;
                                            }
                                            form.updateData('family', familys);
                                            validateBooking();
                                        }
                                    }
                                },
                            ]
                        },
                        {
                            itemType: 'group',
                            caption: 'Supporting Document',
                            colSpan: 2,
                            items: [
                                {
                                    itemType: 'simple',
                                    name: "supportingDocument",
                                    template: function (data, container) {
                                        var supporting = $("<div id='formattachment'>").dxDataGrid({
                                            dataSource: storewithmodule('attachmentrequest', modelclass, reqid),
                                            allowColumnReordering: true,
                                            allowColumnResizing: true,
                                            columnsAutoWidth: true,
                                            rowAlternationEnabled: true,
                                            wordWrapEnabled: true,
                                            showBorders: true,
                                            filterRow: { visible: false },
                                            filterPanel: { visible: false },
                                            headerFilter: { visible: false },
                                            searchPanel: {
                                                visible: true,
                                                width: 240,
                                                placeholder: 'Search...',
                                            },
                                            editing: {
                                                useIcons: true,
                                                mode: "popup",
                                                allowAdding: true,
                                                allowUpdating: true,
                                                allowDeleting: true,
                                            },
                                            paging: { enabled: true, pageSize: 10 },
                                            columns: [
                                                {
                                                    caption: 'Attachment',
                                                    dataField: "path",
                                                    allowFiltering: false,
                                                    allowSorting: false,
                                                    cellTemplate: cellTemplate,
                                                    editCellTemplate: editCellTemplate,
                                                    validationRules: [
                                                        {
                                                            type: "custom",
                                                            validationCallback: function (params) {
                                                                let formData = form.option("formData");
                                                                let hasGuestOrFamily =
                                                                    (formData.guest && formData.guest.length > 0) ||
                                                                    (formData.family && formData.family.length > 0);
                
                                                                return !hasGuestOrFamily || (params.value && params.value.length > 0);
                                                            },
                                                            message: "Attachment is required when Guest or Family is selected."
                                                        }
                                                    ]
                                                },
                                                {
                                                    dataField: "remarks"
                                                },
                                            ],
                                            export: {
                                                enabled: false,
                                                fileName: modname,
                                                excelFilterEnabled: true,
                                                allowExportSelectedData: true
                                            },
                                            onInitialized: function (e) {
                                                dataGridAttachment = e.component;
                                            },
                                            onContentReady: function (e) {
                                                moveEditColumnToLeft(e.component);
                                            },
                                            onToolbarPreparing: function (e) {
                                                e.toolbarOptions.items.unshift({
                                                    location: "after",
                                                    widget: "dxButton",
                                                    options: {
                                                        hint: "Refresh Data",
                                                        icon: "refresh",
                                                        onClick: function () {
                                                            dataGridAttachment.refresh();
                                                        }
                                                    }
                                                });
                                            },
                                            onDataErrorOccurred: function (e) {
                                                console.log("Error loading data:", e.error.message);
                                                dataGridAttachment.refresh();
                                            }
                                        });
                
                                        return supporting;
                                    }
                                }
                            ]
                        }
                    ]);
                    form.on("fieldDataChanged", function (e) {
                        if (e.dataField === "guest" || e.dataField === "family") {
                            validateBooking();
                        }
                    });
                },
                onAppointmentAdding: async function (e) {
                    const appointmentData = e.appointmentData;
                    let scheduler = e.component;
                    let guestCount = safeArray(appointmentData.guest).length;
                    let familyCount = safeArray(appointmentData.family).length;
                    let employeeCount = safeArray(appointmentData.employee).length;
                    let totalNewGuests = guestCount + familyCount + employeeCount;
                
                    if (totalNewGuests < 1) {
                        DevExpress.ui.notify({
                            type: "error",
                            displayTime: 3000,
                            contentTemplate: (e) => {
                                e.append(`
                                    <div style="white-space: pre-line;">
                                    List guest is required!\n
                                    Daftar tamu harus di isi!\n
                                    </div>
                                `);
                            }
                        });
                        e.cancel = true;
                        return;
                    }
                
                    let selectedRoom = appointmentData.ghm_room_id;
                    let roomData = roomsWithLocations.find(room => room.id === selectedRoom);
                    if (!roomData) {
                        DevExpress.ui.notify("Room not Found", "error", 3000);
                        e.cancel = true;
                        return;
                    }
                
                    let sector = roomData.sector;
                    let bookingData = await loadNewData();
                    let roomCapacity = roomsWithLocations.find(room => room.id === selectedRoom)?.roomOccupancy || 0;
                    let dailyGuestCount = await getTotalGuestsPerDay(
                        bookingData.filter(b => b.requestStatus != 4 && b.requestStatus != 0 && b.requestStatus != 2 && b.requestStatus != 1),
                        selectedRoom,
                        appointmentData.startDate,
                        appointmentData.endDate
                    );
                    let totalGuestsAfterAdding = (dailyGuestCount || 0) + totalNewGuests;
                    if (totalGuestsAfterAdding > roomCapacity) {
                        Swal.fire({
                            title: '<strong>UPS...</strong>',
                            html: `
                                <div style="white-space: no wrap; overflow: hidden; text-overflow: ellipsis;">
                                    The room is full, please select another room or another date!<br>
                                    kamar sudah penuh, silahkan pilih kamar lain atau tanggal lain!
                                </div>
                            `,
                            icon: 'error',
                            confirmButtonText: 'OK',
                        });
                        e.cancel = true;
                        loadData();
                        return;
                    }
                
                    Swal.fire({
                        title: 'What do you want to do?',
                        text: 'Choose an option for this booking',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Submit Now',
                        cancelButtonText: 'Save as Draft',
                        reverseButtons: true
                    }).then((result) => {
                        let requestStatus = 0;
                        if (!result.isConfirmed) {
                            sendRequest(apiurl + "/" + modname, "POST", {
                                requestStatus: requestStatus,
                                text: appointmentData.text,
                                description: appointmentData.description,
                                startDate: appointmentData.startDate,
                                endDate: appointmentData.endDate,
                                ghm_room_id: appointmentData.ghm_room_id,
                                employee: appointmentData.employee,
                                guest: appointmentData.guest,
                                family: appointmentData.family,
                                sector: sector,
                            }).then(function () {
                                loadData();
                            });
                        } else {
                            sendRequest(apiurl + "/" + modname, "POST", {
                                requestStatus: requestStatus,
                                text: appointmentData.text,
                                description: appointmentData.description,
                                startDate: appointmentData.startDate,
                                endDate: appointmentData.endDate,
                                ghm_room_id: appointmentData.ghm_room_id,
                                employee: appointmentData.employee,
                                guest: appointmentData.guest,
                                family: appointmentData.family,
                                sector: sector,
                            }).then(function (response) {
                                let valapprovalAction = null;
                                let actionForm = 'submission';
                                let valApprovalType = '';
                                let valremarks = '';
                                if (response.status == 'success') {
                                    const reqid = response.data.id;
                                    // console.log("reqid", reqid);
                                    sendRequest(apiurl + "/submissionrequest/" + reqid + "/" + modelclass, "POST", {
                                        requestStatus: 1,
                                        action: actionForm,
                                        approvalAction: (valapprovalAction == null) ? 1 : parseInt(valapprovalAction),
                                        approvalType: valApprovalType,
                                        remarks: valremarks
                                    }).then(function (response) {
                                        if (response.status == 'success') {
                                            loadData();
                                            Swal.fire({
                                                icon: 'success',
                                                title: 'Saved',
                                                text: 'The submission has been submitted.',
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                },
                onAppointmentUpdating: async function (e) {
                    $('#btnadd').on('click',function(){
                        sendRequest(apiurl + "/"+modname, "POST", {requestStatus:0}).then(function(response){
                            const reqid = response.data.id;
                            const mode = 'add';
                            popup.option({
                                contentTemplate: () => popupContentTemplate(reqid),
                            });
                            popup.show();
                        });
                    })
                    const appointmentData = e.newData;
                    const oldAppointmentData = e.oldData;
                    const currentStatus = oldAppointmentData.requestStatus;
                    if (!["0", "1", "2"].includes(currentStatus)) {
                        DevExpress.ui.notify({
                            type: "error",
                            displayTime: 3000,
                            contentTemplate: (e) => {
                                e.append(`
                                    <div style="white-space: pre-line;">
                                    THis booking status cannot be updated!\n
                                    Booking dengan status ini tidak dapat diperbarui!\n
                                    </div>
                                `);
                            }
                        });
                        e.cancel = true;
                        return;
                    }
                    let selectedRoom = appointmentData.ghm_room_id;
                    let bookingData = await loadNewData();
                    let roomCapacity = roomsWithLocations.find(room => room.id === selectedRoom)?.roomOccupancy || 0;                    
                    let dailyGuestCount = await getTotalGuestsPerDay(
                        bookingData.filter(b => b.requestStatus != 4 && b.requestStatus != 0 && b.requestStatus != 2 && b.requestStatus != 1),
                        selectedRoom,
                        appointmentData.startDate,
                        appointmentData.endDate
                    );
                    let guestCount = safeArray(appointmentData.guest).length;
                    let familyCount = safeArray(appointmentData.family).length;
                    let employeeCount = safeArray(appointmentData.employee).length;
                    let totalNewGuests = guestCount + familyCount + employeeCount;
                    let totalGuestsAfterUpdating = (dailyGuestCount || 0) + totalNewGuests;
                    if (totalGuestsAfterUpdating > roomCapacity) {
                        Swal.fire({
                            title: '<strong>UPS...</strong>',
                            html: `
                                <div style="white-space: no wrap; overflow: hidden; text-overflow: ellipsis;">
                                    The room is full, please select another room or another date!<br>
                                    kamar sudah penuh, silahkan pilih kamar lain atau tanggal lain!
                                </div>
                            `,
                            icon: 'error',
                            confirmButtonText: 'OK',
                        });
                        e.cancel = true;
                        loadData();
                        return;
                    }
                    const formatDateForDB = (date) => {
                        const d = new Date(date);
                        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
                    };
                    appointmentData.startDate = formatDateForDB(appointmentData.startDate);
                    appointmentData.endDate = formatDateForDB(appointmentData.endDate);
                    appointmentData.id = e.oldData.id;
                    let requestStatus = 0;
                    Swal.fire({
                        title: 'What do you want to do?',
                        text: 'Choose an option for this booking',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Submit Now',
                        cancelButtonText: 'Save as Draft',
                        reverseButtons: true
                    }).then((result) => {
                        if (!result.isConfirmed) {
                            sendRequest(apiurl + "/" + modname + "/" + appointmentData.id, "PUT", {
                                requestStatus: requestStatus,
                                text: appointmentData.text,
                                description: appointmentData.description,
                                startDate: appointmentData.startDate,
                                endDate: appointmentData.endDate,
                                ghm_room_id: appointmentData.ghm_room_id,
                                employee: appointmentData.employee,
                                guest: appointmentData.guest,
                                family: appointmentData.family,
                            });
                            loadData();
                        } else {
                            sendRequest(apiurl + "/" + modname + "/" + appointmentData.id, "PUT", {
                                requestStatus: requestStatus,
                                text: appointmentData.text,
                                description: appointmentData.description,
                                startDate: appointmentData.startDate,
                                endDate: appointmentData.endDate,
                                ghm_room_id: appointmentData.ghm_room_id,
                                employee: appointmentData.employee,
                                guest: appointmentData.guest,
                                family: appointmentData.family,
                            }).then(function (response) {
                                loadData();
                                let valapprovalAction = null;
                                let actionForm = 'submission';
                                let valApprovalType = '';
                                let valremarks = '';
                                if (response.status == 'success') {
                                    const reqid = appointmentData.id;
                                    sendRequest(apiurl + "/submissionrequest/" + reqid + "/" + modelclass, "POST", {
                                        requestStatus: 1,
                                        action: actionForm,
                                        approvalAction: (valapprovalAction == null) ? 1 : parseInt(valapprovalAction),
                                        approvalType: valApprovalType,
                                        remarks: valremarks
                                    }).then(function (response) {
                                        if (response.status == 'success') {
                                            Swal.fire({
                                                icon: 'success',
                                                title: 'Saved',
                                                text: 'The submission has been submitted.',
                                            });
                                            loadData();
                                        }
                                    });
                                }
                            });
                        }
                    })
                }
            }).dxScheduler("instance");
        });
    }
    function isWeekEnd(date) {
        const day = date.getDay();
        return day === 0 || day === 6;
    }
    function getCurrentBooking(date, ghm_room_id) {
        const result = (date + ghm_room_id) % 3;
        const currentBooking = `Booking-background-${result}`;
        return currentBooking;
    }
    updateRoomSelector(uniqueLocations[0]);
    $('#btnadd').on('click', function () {
        sendRequest(apiurl + "/" + modname, "POST", { requestStatus: 0 }).then(function (response) {
            const reqid = response.data.id;
            const mode = 'add';
            const options = { "data": { "isMine": 1 } };
            popup.option({
                contentTemplate: () => popupContentTemplate(reqid, mode, options),
            });
            popup.show();
        });
    });
    function cellTemplate(container, options) {
        container.append('<a href="public/upload/'+options.value+'" target="_blank"><img src="public/assets/images/showfile.png" height="50" width="70"></a>');
    }
    
    function editCellTemplate(cellElement, cellInfo) {
        let buttonElement = document.createElement("div");
        buttonElement.classList.add("retryButton");
        let retryButton = $(buttonElement).dxButton({
          text: "Retry",
          visible: false,
          onClick: function() {
            // The retry UI/API is not implemented. Use a private API as shown at T611719.
            for (var i = 0; i < fileUploader._files.length; i++) {
              delete fileUploader._files[i].uploadStarted;
            }
            fileUploader.upload();
          }
        }).dxButton("instance");
    
        $path = "";
        $adafile = "";
        let fileUploaderElement = document.createElement("div");
        let fileUploader = $(fileUploaderElement).dxFileUploader({
          multiple: false,
          accept: ".pptx,.ppt,.docx,.pdf,.xlsx,.csv,.png,.jpg,.jpeg,.zip",
          uploadMode: "instantly",
          name: "myFile",
          uploadUrl: apiurl + "/upload-berkas/"+modname,
          onValueChanged: function(e) {
            let reader = new FileReader();
            reader.onload = function(args) {
              imageElement.setAttribute('src', args.target.result);
            }
            reader.readAsDataURL(e.value[0]); // convert to base64 string
          },
          onUploaded: function(e){
           
            let path = e.request.response;
    
            const unsafeCharacters = /[#"%<>\\^`{|}]/g;
            let unsafeFound = path.match(unsafeCharacters);
    
            if (unsafeFound) {
                let unsafeCharactersString = unsafeFound.join(', ');
                DevExpress.ui.dialog.alert(
                    `The file name contains these unsafe characters: ${unsafeCharactersString}. Please rename the file to continue.`,
                    "error"
                );
            
                path = "";
                retryButton.option("visible", true);
            } else {
                cellInfo.setValue(e.request.responseText);
                retryButton.option("visible", false);
            }
    
          },
          onUploadError: function(e){
              $path = "";
              DevExpress.ui.notify(e.request.response,"error");
          }
        }).dxFileUploader("instance");
            cellElement.append(fileUploaderElement);
            cellElement.append(buttonElement);
      
    }
});

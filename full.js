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

function updateScheduler(location, roomId) {
    let dataSource = roomsWithLocations.filter(emp => emp.location === location);
    if (roomId) {
        dataSource = dataSource.filter(emp => emp.id === roomId);
    }

    console.log('Booking Data:', booking); // Debug log for bookings

    $('.scheduler').dxScheduler({
        timeZone: 'Asia/Makassar',
        dataSource: booking,
        views: ['month'],
        currentView: 'month',
        currentDate: new Date(),
        firstDayOfWeek: 1,
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

            const totalPeople = booking.totalPeople ?? 0;
            const remainingCapacity = roomAccupancy - totalPeople;

            const formatDate = (date) => {
                if (!date) return "No Date";
                const d = new Date(date);
                return isNaN(d.getTime()) ? "No Date" : d.toISOString().split("T")[0];
            };
        
            // ID unik untuk tombol delete
            const deleteButtonId = `delete-btn-${booking.id}`;
            const tooltipHtml = `
                <div>
                    <b>Subject : ${booking.text || "No Title"}</b><br>
                    ${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}<br>
                    Accupancy: ${roomAccupancy} Person"<br>
                    Person: ${booking.totalPeople || "No Name"} Person<br>
                    remaining: ${remainingCapacity} Person<br>                    
                    Created By: ${booking.creator || "No Name"}<br><br>
                    <button id="${deleteButtonId}" class="btn btn-danger btn-sm">Delete</button>
                </div>
            `;
        
            // Event listener harus ditambahkan setelah tooltip muncul
            setTimeout(() => {
                const deleteButton = document.getElementById(deleteButtonId);
                if (deleteButton) {
                    deleteButton.addEventListener("click", function (event) {
                        event.stopPropagation(); // Mencegah popup scheduler terbuka
                        if (confirm("Are you sure you want to delete this booking?")) {
                            sendRequest(apiurl + "/" + modname + "/" + booking.id, "DELETE")
                                .then(function (response) {
                                    if (response.status === "success") {
                                        alert("Booking deleted successfully!");
                                        $("#scheduler").dxScheduler("instance").getDataSource().reload();
                                    } else {
                                        alert("Error: " + (response.message || "Failed to delete booking."));
                                    }
                                })
                                .catch(function (error) {
                                    alert("Error: " + (error.responseText || "Unknown error."));
                                });
                        }
                    });
                }
            }, 500); // Timeout agar DOM siap
        
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
        
            // Create a parent div to combine name and roomAccupancy into a single column
            const combinedColumn = $('<div>')
            .addClass('combined-column')
            .append(name, roomAccupancy)
            .css({ backgroundColor: cellData.color });
        
            return combinedColumn;
        },
        onCellPrepared: function(e) {
            if (e.column.index == 0 && e.rowType == "data") {
                if (e.data.code === null) {
                    $("#formdata").dxDataGrid('columnOption', 'code', 'visible', false);
                } else {
                    $("#formdata").dxDataGrid('columnOption', 'code', 'visible', true);
                }
            }
            if (e.rowType == "data" && (e.column.index > 0 && e.column.index < 6)) {
                if (e.value === "" || e.value === null || e.value === undefined || /^\s*$/.test(e.value)) {
                    e.cellElement.css({
                        "backgroundColor": "#ffe6e6",
                        "border": "0.5px solid #f56e6e"
                    });
                }
            }
            if (e.rowType == "data") {
                if (e.data.isParent === 1) {
                    e.cellElement.css('background', 'rgba(128, 128, 0,0.1)');
                }
            }
        },
        onAppointmentFormOpening: function(e) {
            const form = e.form;
            const appointmentData = e.appointmentData;
            const isNewAppointment = !appointmentData.id;
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
            // Define the groupCaptionTemplate function
            function groupCaptionTemplate(param) {
                // Function implementation here
                return `Group Caption for ${param}`;
            }
            
            form.option('items', [
                {
                    itemType: 'group',
                    colCount: 1,
                    caption: 'Interests',
                    items: [
                        {
                            label: { text: 'Code' },
                            editorType: 'dxTextBox',
                            dataField: 'code',
                            disabled: true,
                            editorOptions: {
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
                                value: appointmentData.ghm_room_id || null
                            }
                        },
                        {
                            label: { text: 'Start Date' },
                            editorType: 'dxDateBox',
                            dataField: 'startDate',
                            editorOptions: {
                                type: 'datetime',
                                value: appointmentData.startDate || new Date(),
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
                                value: appointmentData.endDate || new Date(),
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
                                searchEnabled: true
                            }
                            
                        },
                        {                                        
                            title: 'Guest',
                            editorType: 'dxTagBox',
                            dataField: 'guest',
                            editorOptions: {
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
                                    form.updateData('guest', guests);
                                }
                            }
                        },                            
                        {
                            // label: { text: 'Family' },
                            title: 'Family',
                            editorType: 'dxTagBox',
                            dataField: 'family',
                            editorOptions: {
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
                                    form.updateData('family', familys);
                                }
                            }
                        } 
                    ]
                }                         
            ]);
        },
        onAppointmentAdding: function(e) {
            const appointmentData = e.appointmentData;
            // appointmentData.employee_id = serializeToJSON(appointmentData.employee_id);
            appointmentData.guest = serializeToJSON(appointmentData.guest);
            appointmentData.family = serializeToJSON(appointmentData.family);
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
                    alert('Booking created successfully!');
                } else {
                    alert('Error: ' + response.message);
                }
            }).catch(function(error) {
                alert('Error: ' + error.responseText);
            });
        },
        onAppointmentUpdating: function(e) {
            const appointmentData = e.newData;
            appointmentData.id = e.oldData.id; // Ensure id is included in appointmentData for updating
            // appointmentData.employee_id = serializeToJSON(appointmentData.employee_id);
            appointmentData.employee_id = Array.isArray(appointmentData.employee_id) ? JSON.stringify(appointmentData.employee_id):appointmentData.employee_id;
            appointmentData.guest = Array.isArray(appointmentData.guest) ? JSON.stringify(appointmentData.guest):appointmentData.guest;
            appointmentData.family = Array.isArray(appointmentData.family) ? JSON.stringify(appointmentData.family):appointmentData.family;
            console.log('Updating appointment with data:', appointmentData); // Debug log
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
                    e.component._dataSource.reload();
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

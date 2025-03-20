$(function () {
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
            placeholder: 'Search...'
        },
        paging: { enabled: true, pageSize: 10 },
        columns: [
            { 
                caption: 'Attachment',
                dataField: "path",
                allowFiltering: false,
                allowSorting: false,
                validationRules: [{ type: "required" }],
                cellTemplate: function(container, options) {
                    var fileUploader = $("<div>").dxFileUploader({
                        multiple: false,  
                        accept: "image/*,.pdf,.doc,.docx,.xls,.xlsx", 
                        uploadMode: "useForm",  
                        maxFileSize: 5242880,  
                        showFileList: true,  
                        selectButtonText: "Pilih File",
                        labelText: "",  
                        onValueChanged: function(e) {
                            if (e.value.length > 0) {
                                let selectedFile = e.value[0];  
                                DevExpress.ui.notify("File dipilih: " + selectedFile.name, "info", 2000);
                                options.setValue(selectedFile.name);  
                            }
                        }
                    });

                    $(container).append(fileUploader);
                }
            },
            {
                dataField: "remarks",
                caption: "Remarks"
            }
        ]
    });

    $("#yourContainer").append(supporting);
});





onAppointmentFormOpening: function (e) {
                    e.popup.option ({
                        width: 700,
                        height: 800
                    });
                    const form = e.form;
                    const appointmentData = e.appointmentData;
                    const reqid = appointmentData.id;
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
                        return { roomCapacity, remainingCapacity, totalBooked };
                    }
                    const { roomCapacity, remainingCapacity} = validateBooking();
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
                                        // onValueChanged: validateBooking()
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
                                {
                                    itemType: 'group',
                                    colSpan: 2,
                                    caption: 'Supporting Document',
                                    items: [
                                        {
                                            itemType: 'simple',
                                            template: function(data, container) {
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
                                                        placeholder: 'Search...'
                                                    },
                                                    paging: { enabled: true, pageSize: 10 },
                                                    columns: [
                                                        { 
                                                            caption: 'Attachment',
                                                            dataField: "path",
                                                            allowFiltering: false,
                                                            allowSorting: false,
                                                            validationRules: [{ type: "required" }],
                                                            editorOptions: {
                                                                accept: "image/*,.pdf,.doc,.docx,.xls,.xlsx",
                                                                uploadMode: "useForm",
                                                                maxFileSize: 5242880 // 5MB
                                                            }
                                                        },
                                                        {
                                                            dataField: "remarks"
                                                        }
                                                    ],
                                                });
                                                $(container).append(supporting);
                                            }
                                        }
                                    ]
                                }        
                            ]
                        },                                           
                    ]);
                },

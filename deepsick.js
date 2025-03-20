onAppointmentFormOpening: function (e) {
                    e.popup.option ({
                        width: 700,
                        height: 800
                    });
                    const form = e.form;
                    const appointmentData = e.appointmentData;
                    const reqid = (appointmentData.id) || 0;
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
                                                            validationCallback: function(params) {
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
                                            onInitialized: function(e) {
                                                dataGridAttachment = e.component;
                                            },
                                            onContentReady: function(e) {
                                                moveEditColumnToLeft(e.component);
                                            },
                                            onToolbarPreparing: function(e) {
                                                e.toolbarOptions.items.unshift({						
                                                    location: "after",
                                                    widget: "dxButton",
                                                    options: {
                                                        hint: "Refresh Data",
                                                        icon: "refresh",
                                                        onClick: function() {
                                                            dataGridAttachment.refresh();
                                                        }
                                                    }
                                                });
                                            },
                                            onDataErrorOccurred: function(e) {
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
                    form.on("fieldDataChanged", function(e) {
                        if (e.dataField === "guest" || e.dataField === "family") {
                            validateBooking();
                        }
                    });
                },

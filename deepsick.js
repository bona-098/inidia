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
                                    template: function(data, container) {
                                        var supporting = $("<div id='formattachment'>").dxDataGrid({    
                                            dataSource: storewithmodule('attachmentrequest',modelclass,reqid),
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
                                                useIcons:true,
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
                                                    validationRules: [{ type: "required", message: 'Details is required', }],
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
                                            onContentReady: function(e){
                                                moveEditColumnToLeft(e.component);
                                            },
                                            onInitNewRow : function(e) {
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
                                                })
                                            },
                                            onDataErrorOccurred: function(e) {
                                                // Menampilkan pesan kesalahan
                                                console.log("Terjadi kesalahan saat memuat data (2):", e.error.message);
                                        
                                                // Memuat ulang DataGrid
                                                dataGridAttachment.refresh();
                                            }
                                        })
                    
                                        return supporting;
                                    }                                        
                                } 
                                // : null
                            ].filter(Boolean) // Menghapus item null dari array
                        }                                         
                    ]);

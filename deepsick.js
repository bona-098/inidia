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

    // Cek apakah guest atau family diisi
    let formData = form.option("formData");
    let hasGuestOrFamily = (formData.guest && formData.guest.length > 0) || (formData.family && formData.family.length > 0);
    
    // Jika guest atau family diisi, dokumen harus diunggah
    form.itemOption("supportingDocument", "isRequired", hasGuestOrFamily);

    // Update pesan peringatan
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

// Panggil validateBooking saat form berubah
form.option('items', [ 
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

// Jalankan validasi saat form berubah
form.on("fieldDataChanged", function(e) {
    if (e.dataField === "guest" || e.dataField === "family") {
        validateBooking();
    }
});

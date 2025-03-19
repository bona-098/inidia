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
                    editing: {
                        useIcons: true,
                        mode: "popup",
                        allowAdding: ((isMine == 1 || isPIC == 1) && mode == 'view') || (isMine == 1 && (mode == 'edit' || mode == 'add')) || (admin == 1),
                        allowUpdating: ((isMine == 1 || isPIC == 1) && mode == 'view') || (isMine == 1 && (mode == 'edit' || mode == 'add')) || (admin == 1),
                        allowDeleting: ((isMine == 1 || isPIC == 1) && mode == 'view') || (isMine == 1 && (mode == 'edit' || mode == 'add')) || (admin == 1)
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
                        console.log("Terjadi kesalahan saat memuat data:", e.error.message);
                        dataGridAttachment.refresh();
                    }
                });
                $(container).append(supporting);
            }
        }
    ]
}

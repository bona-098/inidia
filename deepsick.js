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
            uploadUrl: apiurl + "/upload-berkas/" + modname,
            onValueChanged: function(e) {
                let reader = new FileReader();
                reader.onload = function(args) {
                    imageElement.setAttribute('src', args.target.result);
                }
                reader.readAsDataURL(e.value[0]);
            },
            onUploaded: function(e) {
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
            onUploadError: function(e) {
                $path = "";
                DevExpress.ui.notify(e.request.response, "error");
            }
        }).dxFileUploader("instance");
    
        cellElement.append(fileUploaderElement);
        cellElement.append(buttonElement);
    }

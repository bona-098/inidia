var modname = 'hrscrequest';
var modelclass = 'Hrsc';
var popupmode;

function moveEditColumnToLeft(dataGrid) {
    dataGrid.columnOption("command:edit", { 
        visibleIndex: -1,
        width: 80 
    });
}


var dataGrid = $("#gridContainer").dxDataGrid({    
    dataSource: store(modname),
    allowColumnReordering: true,
    allowColumnResizing: true,
    columnHidingEnabled: true,
    rowAlternationEnabled: false,
    wordWrapEnabled: true,
    autoExpandAll: true,
    showBorders: true,
    filterRow: { visible: true },
    filterPanel: { visible: true },
    headerFilter: { visible: true },
    searchPanel: {
        visible: true,
        width: 240,
        placeholder: 'Search...',
    },
    editing: {
        useIcons:true,
        mode: "popup",
        allowAdding: false,
        allowUpdating: false,
        allowDeleting: true,
    },
    scrolling: {
        mode: "virtual"
    },
    pager: {
        visible: false,
        showInfo: true,
    },
    columns: [
        {
            caption: 'Category',
            dataField: 'hrsc_category_id',
            width: 200,
            lookup: {
                dataSource: listOption('/list-categoryhrsc','id','name'),  
                valueExpr: 'id',
                displayExpr: 'name',
            },
        },
        { 
			dataField: "description",
            width: 180
        },
        {
            caption: 'Action',
            width: 140,
            cellTemplate: function(container, options) {

                var isMine = options.data.isMine;
                var isPIC = (options.data.ticketStatus == 'Completed') ? 0 : options.data.isPIC;
                var isPendingOnMe = options.data.isPendingOnMe;
                var reqid = options.data.id;
                var reqstatus = options.data.requestStatus;
                var ticketstatus = options.data.ticketStatus;
                var confirmationStatus = options.data.confirmationStatus;
                var mode = (reqstatus == 0 || reqstatus == 2 && (isMine == 1)) ? 'edit' : (reqstatus == 1 && ((isMine == 0 && isPendingOnMe == 1) || (isMine == 1 && isPendingOnMe == 1)) ? 'approval' : 'view') ;
                var arrColor = [
                    "btn-secondary",
                    (mode == 'approval' && reqstatus == 1) ? "btn-danger" : "btn-primary",
                    "btn-warning",
                    (isMine == 0 && isPIC == 1 && (ticketstatus != 'Completed' && confirmationStatus != 'Completed')) ? "btn-info" : (isMine == 1 && isPIC == 0 && ((ticketstatus == 'Completed') && (confirmationStatus != 'Completed'))) ? "btn-info" : "btn-success",
                    "btn-danger",
                ];

                var viewIcon = ((mode == 'approval' && reqstatus == 1) || (isMine == 0 && isPIC == 1 && (ticketstatus != 'Completed' && confirmationStatus != 'Completed'))) ? "fa-check" :  ((mode == 'approval' && reqstatus == 1) || (isMine == 1 && isPIC == 0 && ((ticketstatus == 'Completed') && (confirmationStatus != 'Completed')))) ? "fa-check" : "fa-search";
    
                $('<button class="btn '+arrColor[reqstatus]+'" id="btnreqid'+reqid+'"><i class="fa '+viewIcon+'"></i></button>').on('dxclick', function(evt) {
                    evt.stopPropagation();
                
                            popup.option({
                                contentTemplate: () => popupContentTemplate(reqid,mode,options),
                            });
                            popup.show();

                }).appendTo(container);
                if((reqstatus == 1 || reqstatus == 2) && ((isMine == 1 && (isPendingOnMe == 0 || isPendingOnMe == null)))) {
                    $('<button class="btn btn-danger" id="btnreqid'+reqid+'" style="margin-left: 3px;">Cancel</button>').on('dxclick', function(evt) {
                        evt.stopPropagation();

                        Swal.fire({
                            title: 'Are you sure?',
                            text: "Are you sure you want to cancel this submission?",
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#3085d6',
                            confirmButtonText: 'Yes, cancel it'
                          }).then((result) => {
                            if (result.isConfirmed) {
                              sendRequest(apiurl + "/submissionrequest/"+reqid+"/"+modelclass, "POST", {
                                requestStatus:0,
                                action:'submission',
                                approvalAction: 0
                              }).then(function(response){
                                if(response.status != 'error') {
                                    dataGrid.refresh();
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Saved',
                                        text: 'The submission has been cancelled.',
                                    });
                                }
                              });
                            } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Cancelled',
                                    text: 'The submission cancellation has been cancelled.'
                                });
                            }
                          });
    
                    }).appendTo(container); 
                }
            
            }
        },
        {
            caption: "Code",
            dataField: 'code',
            width: 180,
            sortOrder: "desc"
        },
        { 
			dataField: "user.fullname",
            caption: 'Creator Name',
            width: 180
        },
        {
            dataField: 'requestStatus',
            encodeHtml: false,
            allowFiltering: false,
            allowHeaderFiltering: true,
            customizeText: function (e) {
                var arrText = [
                    "<span class='btn btn-secondary btn-xs btn-status'>Draft</span>",
                    "<span class='btn btn-primary btn-xs btn-status'>Waiting Approval</span>",
                    "<span class='btn btn-warning btn-xs btn-status'>Rework</span>",
                    "<span class='btn btn-success btn-xs btn-status'>Approved</span>",
                    "<span class='btn btn-danger btn-xs btn-status'>Rejected</span>",
                ];
                return arrText[e.value];
            },
        },     
        {
            dataField: 'ticketStatus',
            encodeHtml: false,
            width: 180,
            customizeText: function (e) {
                if(e.value == 'Completed') {
                    return "<span class='btn btn-success btn-xs btn-status'>Completed</span>"
                } else if(e.value == 'Immediately') {
                    return "<span class='btn btn-warning btn-xs btn-status'>Immediately</span>"
                } else {
                    return "<span class='btn btn-primary btn-xs btn-status'>On Queue</span>"
                }
            },
        },
        {
            dataField: 'confirmationStatus',
            encodeHtml: false,
            width: 180,
            customizeText: function (e) {
                if(e.value == 'Completed') {
                    return "<span class='btn btn-success btn-xs btn-status'>Completed</span>"
                } else if(e.value == 'Reworked') {
                    return "<span class='btn btn-warning btn-xs btn-status'>Reworked</span>"
                } else {
                    return "<span class='btn btn-primary btn-xs btn-status'>Waiting</span>"
                }
            },
        },
      
    ],
    export: {
        enabled: true,
        fileName: modname,
        excelFilterEnabled: true,
        allowExportSelectedData: true
    },
    onContentReady: function(e){
        moveEditColumnToLeft(e.component);
        runpopup();
    },
    onCellPrepared: function (e) {
        if (e.rowType == "data") {
            if(e.data.isParent === 1) {
                e.cellElement.css('background','rgba(128, 128, 0,0.1)')
            }
        }
    },
    onToolbarPreparing: function(e) {
        dataGrid = e.component;

        e.toolbarOptions.items.unshift({						
            location: "after",
            widget: "dxButton",
            options: {
                hint: "Refresh Data",
                icon: "refresh",
                onClick: function() {
                    dataGrid.refresh();
                }
            }
        })
    },
    onDataErrorOccurred: function(e) {
        // Menampilkan pesan kesalahan
        console.log("Terjadi kesalahan saat memuat data (0):", e.error.message);

        // Memuat ulang Page
        location.reload();
    }
}).dxDataGrid("instance");

$('#btnadd').on('click',function(){
    sendRequest(apiurl + "/"+modname, "POST", {requestStatus:0}).then(function(response){
        const reqid = response.data.id;
        const mode = 'add';
        const options = {"data": {"isMine": 1}};
        popup.option({
            contentTemplate: () => popupContentTemplate(reqid,mode,options),
        });
        popup.show();
    });
})

const accordionItems = [
    {
        ID: 1,
        Title: '<i class="far fa-newspaper"> Form Data </i>',
        visible: true
    },
    {
        ID: 5,
        Title: '<i class="fas fa-users"> Assignment To </i>',
        visible: false
    },
    {
        ID: 2,
        Title: '<i class="fas fa-file"> Supporting Document </i>',
        visible: true
    },
    {
        ID: 3,
        Title: '<i class="fas fa-list-ul"> Approver List </i>',
        visible: true
    },
    {
        ID: 4,
        Title: '<i class="fas fa-history"> History </i>',
        visible: true
    },
];

const updateVisibleById = (itemId, visible) => {
    accordionItems.forEach(item => {
      if (item.ID === itemId) {
        item.visible = visible;
      }
    });
  };

const popupContentTemplate = function (reqid,mode,options) {

    var isMine = options.data.isMine;
    var isMineCompleted = (isMine == 1 && options.data.ticketStatus == 'Completed') ? 0 : 1;
    var isPIC = (options.data.ticketStatus == 'Completed') ? 0 : options.data.isPIC;
    var isPendingOnMe = options.data.isPendingOnMe;
    var completed = (options.data.ticketStatus == 'Completed' && options.data.confirmationStatus == 'Completed') ? 1 : 0;

    // console.log(options.data)
    // console.log('isMine :' + isMine)
    // console.log('isMineCompleted :' + isMineCompleted)
    console.log('isPIC :' + isPIC)
    // console.log('completed :' + completed)
    // console.log(mode)

    var validationRules = [];

    popupid = reqid;

    const scrollView = $('<div />');

    if ((isMine == 1 || isPendingOnMe == 1) && (mode == 'add' || mode == 'edit' || mode == 'approval')) {
        if((isPendingOnMe == 1) && (mode == 'approval')) {
            var approvalOptions = 
                '<div class="row">' +
                    '<div class="col-md-6">' +
                    '<label for="remarks">Approval Action :</label>' +
                    '<div class="form-check">'+
                        '<input class="form-check-input" type="radio" name="approvalaction" id="rappraction1" value="3">'+
                        '<label class="form-check-label" for="rappraction1">'+
                        'Approved'+
                        '</label>'+
                    '</div>'+
                    '<div class="form-check">'+
                        '<input class="form-check-input" type="radio" name="approvalaction" id="rappraction2" value="2">'+
                        '<label class="form-check-label" for="rappraction2">'+
                        'Reworked'+
                        '</label>'+
                    '</div>'+
                    '<div class="form-check mb-3">'+
                        '<input class="form-check-input" type="radio" name="approvalaction" id="rappraction3" value="4">'+
                        '<label class="form-check-label" for="rappraction3">'+
                        'Rejected'+
                        '</label>'+
                    '</div>'+
                    '</div>' +
                    '<div class="col-md-6">' +
                    '<div class="form-group">' +
                        '<label for="remarks">Remarks :</label>' +
                        '<textarea class="form-control" id="remarks" rows="3"></textarea>' +
                    '</div>' +
                    '</div>' +
                '</div><hr>';
          } else {
            var approvalOptions = '';
          }
          
          scrollView.append('<div class="row">' +
            '<div class="col-lg-12">' +
              '<div class="card">' +
                '<div class="card-header">' +
                  '<h5 class="card-title">Form Action</h5>' +
                '</div>' +
                '<div class="card-body" style="border-bottom-color: darkseagreen !important;border-left-color: darkseagreen;">' +
                  approvalOptions +
                  '<button id="btn-submit" type="button" onClick="btnreqsubmit('+reqid+',\''+mode+'\')" class="btn btn-success waves-effect btn-label waves-light m-1"><i class="bx bx-check-double label-icon"></i> Submit Submission</button>'+
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>');
    }

    if(options.data.requestStatus == 3 || isPendingOnMe) {
        updateVisibleById(5, true);
    } else {
        updateVisibleById(5, false);
    }

    var dataSector = [
        { bu: 'IHM', sector: 'NKL' },
        { bu: 'IHM', sector: 'TRN' },
        { bu: 'IHM', sector: 'SPU' },
        { bu: 'IHM', sector: 'SNI' },
        { bu: 'IHM', sector: 'HO' },
        { bu: 'AHL', sector: 'SBG' },
        { bu: 'AHL', sector: 'SBS' },
        { bu: 'AHL', sector: 'SSP' },
        { bu: 'AHL', sector: 'HO' },
    ];

    scrollView.append("<hr>"),

    scrollView.append(

        $("<div>").dxAccordion({
            dataSource: accordionItems,
            animationDuration: 600,
            selectedItems: [accordionItems[0],accordionItems[1],accordionItems[2],accordionItems[3],accordionItems[4],accordionItems[5],accordionItems[6],accordionItems[7]],
            collapsible: true,
            multiple: true,
            itemTitleTemplate: function (data) {
                return '<small style="margin-bottom:10px !important ;">'+data.Title+'</small>'
            },
            itemTemplate: function (data) {
                var container = $("<div>");
                if(data.ID == 1) {
                    if (mode == 'add' || mode == 'edit'){
                        $("<span style='color:red;font-size:11pt'>").html('Silahkan lengkapi <b><i style="color:black;font-weight:bold" class="far fa-newspaper"> Form Data </i></b> dan tekan tombol <b>Simpan</b> (<i style="color:black;font-weight:bold" class="fas fa-save"></i>) yang ada di pojok kanan atas tabel serta lampirkan <i style="color:black;font-weight:bold" class="fas fa-file"> Supporting Document </i> sebelum klik tombol <span style="color:black;font-weight:bold"><i class="bx bx-check-double label-icon"></i> Submit Submission</span>').appendTo(container);
                    }
                    var formData = $("<div id='formdata'>").dxDataGrid({    
                        dataSource: storedetail(modname,reqid),
                        allowColumnReordering: true,
                        allowColumnResizing: true,
                        columnsAutoWidth: true,
                        rowAlternationEnabled: true,
                        wordWrapEnabled: true,
                        showBorders: true,
                        showColumnLines:true,
                        filterRow: { visible: false },
                        filterPanel: { visible: false },
                        headerFilter: { visible: false },
                        searchPanel: {
                            visible: false,
                            width: 240,
                            placeholder: 'Search...',
                        },
                        sorting: {
                            mode: "none" // or "multiple" | "none"
                        },
                        editing: {
                            useIcons:true,
                            mode: "batch",
                            allowAdding: false,
                            allowUpdating: ((isMine == 1) && mode == 'edit' || mode == 'add') ? true : (admin == 1 || isPIC == 1 || isMineCompleted == 0 ? true : false),
                            allowDeleting: false,
                        },
                        scrolling: {
                            mode: "virtual"
                        },
                        columns: [
                            {
                                caption: 'Code',
                                dataField: 'code',
                                allowFiltering: false,
                                allowHeaderFiltering: false,
                                editorOptions: { 
                                    readOnly: true
                                }
                            },
                            {
                                caption: 'BU',
                                dataField: 'bu',
                                validationRules: [{ type: "required" }],
                                lookup: {
                                    dataSource: [{bu:'IHM'},{bu:'AHL'}],
                                    valueExpr: 'bu',
                                    displayExpr: 'bu',
                                },
                                setCellValue: function (rowData, value) {
                                    rowData.bu = value;
                                    if (value === "IHM") {
                                        rowData.sector = "HO";
                                    } else if (value === "AHL") {
                                        rowData.sector = "HO";
                                    }
                                },
                                editorOptions: { 
                                    readOnly: (isMine == 0 && isPIC == 0 && isMineCompleted == 0 || (mode == 'add' || mode == 'edit')) ? false : (isMine == 1 && isPIC == 0 && isMineCompleted == 1 || (mode == 'add' || mode == 'edit')) ? false : true,
                                }
                            },
                            {
                                caption: 'Sector',
                                dataField: 'sector',
                                lookup: {
                                    dataSource: function (options) {
                                        return {
                                            store: {
                                                type: 'array',
                                                data: dataSector
                                            },
                                            filter: options.data ? ["bu", "=", options.data.bu] : null
                                        };
                                    },
                                    valueExpr: 'sector',
                                    displayExpr: 'sector',
                                },
                                validationRules: [{ type: "required" }],
                                editorOptions: { 
                                    readOnly: (isMine == 0 && isPIC == 0 && isMineCompleted == 0 || (mode == 'add' || mode == 'edit')) ? false : (isMine == 1 && isPIC == 0 && isMineCompleted == 1 || (mode == 'add' || mode == 'edit')) ? false : true,
                                },
                            },
                            {
                                dataField: 'location',
                                dataType: 'string',
                                validationRules: [{ type: "required" }],
                                editorOptions: { 
                                    readOnly: (isMine == 0 && isPIC == 0 && isMineCompleted == 0 || (mode == 'add' || mode == 'edit')) ? false : (isMine == 1 && isPIC == 0 && isMineCompleted == 1 || (mode == 'add' || mode == 'edit')) ? false : true
                                }
                            },
                            {
                                caption: 'Category',
                                dataField: 'hrsc_category_id',
                                lookup: {
                                    dataSource: listOption('/list-categoryhrsc','id','name'),  
                                    valueExpr: 'id',
                                    displayExpr: 'name',
                                },
                                width: 200,
                                validationRules: [{ type: "required" }],
                                editorOptions: { 
                                    readOnly: (isMine == 0 && isPIC == 0 && isMineCompleted == 0 || (mode == 'add' || mode == 'edit')) ? false : (isMine == 1 && isPIC == 0 && isMineCompleted == 1 || (mode == 'add' || mode == 'edit')) ? false : true
                                }
                            },
                            {
                                dataField: 'description',
                                dataType: 'string',
                                validationRules: [{ type: "required" }],
                                editorOptions: { 
                                    readOnly: (isMine == 0 && isPIC == 0 && isMineCompleted == 0 || (mode == 'add' || mode == 'edit')) ? false : (isMine == 1 && isPIC == 0 && isMineCompleted == 1 || (mode == 'add' || mode == 'edit')) ? false : true
                                }
                            },
                            {
                                dataField: 'ticketStatus',
                                dataType: 'string',
                                lookup: {
                                    dataSource: ['On Queue','Immediately','Completed'],  
                                },
                                editorOptions: { 
                                    readOnly: (isPIC == 1) ? false : true
                                }
                            },
                            {
                                dataField: 'confirmationStatus',
                                dataType: 'string',
                                lookup: {
                                    dataSource: ['Waiting','Reworked','Completed'],  
                                },
                                setCellValue: function (rowData, value) {
                                    rowData.confirmationStatus = value;
                                    // console.log(value)
                                    // console.log(validationRules)
                                    if (value == "Reworked") {
                                        validationRules.length = 0;
                                        validationRules.push({
                                            type: "required", 
                                            message: "Confirmation remarks are required"
                                        });
                                        rowData.confirmationRemarks = null;
                                    } else {
                                        validationRules.length = 0;
                                        rowData.confirmationRemarks = null;
                                    }
                                },
                                visible: (options.data.ticketStatus == 'Completed') ? true : false,
                                editorOptions: { 
                                    readOnly: (isPIC == 0 && isMine == 1 && options.data.confirmationStatus == 'Waiting') ? false : true
                                },
                            },
                            {
                                dataField: 'confirmationRemarks',
                                dataType: 'string',
                                visible: (options.data.ticketStatus == 'Completed' && (options.data.confirmationStatus != 'Completed')) ? true : false,
                                editorOptions: { 
                                    readOnly: (isPIC == 0 && isMine == 1 && options.data.confirmationStatus == 'Waiting') ? false : true
                                },
                                validationRules: validationRules,
                            },
                            {
                                dataField: "created_at",
                                dataType: "date",
                                format: "dd-MM-yyyy",
                                editorOptions: { 
                                    readOnly: true
                                }
                            },
                        ],
                        export: {
                            enabled: false,
                            fileName: modname,
                            excelFilterEnabled: true,
                            allowExportSelectedData: true
                        },
                        onInitialized: function(e) {
                            dataGrid1 = e.component;
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
                                        dataGrid1.refresh();
                                    }
                                }
                            });
                        },
                        onEditorPreparing: function (e) {
                            if (e.dataField == "hrsc_category_id" && e.parentType == "dataRow") {
                                e.editorName = "dxDropDownBox";            
                                e.editorOptions.dropDownOptions = {                
                                    height: 500,
                                    width: 600
                                };
                                e.editorOptions.contentTemplate = function (args, container) {
                    
                                    var value = args.component.option("value"),
                                        $dataGrid = $("<div>").dxDataGrid({
                                            width: '100%',
                                            dataSource: args.component.option("dataSource"),
                                            keyExpr: "id",
                                            // columns: ["category","name","remarks"],
                                            columns: [
                                                { 
                                                    dataField: "category",
                                                    sortOrder: "asc",
                                                },
                                                { 
                                                    dataField: "name",
                                                    sortOrder: "asc",
                                                },
                                                { 
                                                    dataField: "remarks",
                                                },
                                            ],
                                            hoverStateEnabled: true,
                                            // paging: { enabled: true, pageSize: 5 },
                                            scrolling: {
                                                mode: "virtual"
                                            },
                                            pager: {
                                                visible: false,
                                                showInfo: true,
                                            },
                                            filterRow: { visible: true },
                                            height: '90%',
                                            showRowLines: true,
                                            showBorders: true,
                                            selection: { mode: "single" },
                                            selectedRowKeys: [value],
                                            focusedRowEnabled: true,
                                            focusedRowKey: args.component.option("value"),
                                            searchPanel: {
                                                visible: true,
                                                width: 265,
                                                placeholder: "Search..."
                                            },
                                            onSelectionChanged: function (selectedItems) {
                                                const keys = selectedItems.selectedRowKeys;
                                                const hasSelection = keys.length;
                                                args.component.option('value', hasSelection ? keys[0] : null);
                                                if(hasSelection !== 0) {
                                                    args.component.close();
                                                }
                                            }
                                        });
                    
                                    var dataGrid = $dataGrid.dxDataGrid("instance");
                    
                                    args.component.on("valueChanged", function (args) {
                                        var value = args.value;
                    
                                        dataGrid.selectRows(value, false);
                                    });
                                    container.append($dataGrid);
                                    $("<div>").dxButton({
                                        text: "Close",
                    
                                        onClick: function (ev) {
                                            args.component.close();
                                        }
                                    }).css({ float: "right", marginTop: "10px" }).appendTo(container);
                                    return container;
                    
                                };
                            }
                        },
                        onRowUpdating: function(e) {
                            var newTicketStatus = e.newData.ticketStatus;
                            var newConfirmationStatus = e.newData.confirmationStatus;
                            if (newTicketStatus === "Completed") {
                                if (!confirm("Are you sure you want to mark this ticket as completed?")) {
                                    e.cancel = true; // Cancel the update operation
                                } else {
                                    e.newData.confirmationStatus = 'Waiting'; // Update the confirmationStatus to 'Waiting'
                                    e.component.columnOption("ticketStatus", "allowEditing", false);
                                }
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
                        },
                        onCellPrepared: function (e) {
                            if (e.column.index == 0 && e.rowType == "data") {
                                if(e.data.code === null) {
                                    $("#formdata").dxDataGrid('columnOption','code', 'visible', false);
                                } else {
                                    $("#formdata").dxDataGrid('columnOption','code', 'visible', true);
                                }
                            }
                            if ( e.rowType == "data" && (e.column.index>0 && e.column.index<6)) {
                                if (e.value === "" || e.value === null || e.value === undefined || /^\s*$/.test(e.value)) {
                                    e.cellElement.css({
                                        "backgroundColor": "#ffe6e6",
                                        "border": "0.5px solid #f56e6e"
                                    })
                                }
                            }
                        },
                        onDataErrorOccurred: function(e) {
                            // Menampilkan pesan kesalahan
                            console.log("Terjadi kesalahan saat memuat data (1):", e.error.message);
                    
                            // Memuat ulang DataGrid
                            dataGrid1.refresh();
                        }
                    }).appendTo(container)
                    return container
                } 
                else if(data.ID == 2) {
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
                            allowAdding: (((isMine == 1 || isPIC == 1) && mode == 'view') ? true : (isMine == 1) && mode == 'edit' || mode == 'add' ) ? true : (admin == 1 ? true : false),
                            allowUpdating: (((isMine == 1 || isPIC == 1) && mode == 'view') ? true : (isMine == 1) && mode == 'edit' || mode == 'add' ) ? true : (admin == 1 ? true : false),
                            allowDeleting: (((isMine == 1 || isPIC == 1) && mode == 'view') ? true : (isMine == 1) && mode == 'edit' || mode == 'add' ) ? true : (admin == 1 ? true : false),
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
                                validationRules: [{ type: "required" }]
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
                else if(data.ID == 3) {
                    return $("<div id='formapproverlist'>").dxDataGrid({    
                        dataSource: storewithmodule('approverlistrequest',modelclass,reqid),
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
                            mode: "cell",
                            allowAdding: (admin == 1) ? true : false,
                            allowUpdating: (admin == 1) ? true : false,
                            allowDeleting: (admin == 1) ? true : false,
                        },
                        scrolling: {
                            mode: "virtual"
                        },
                        columns: [
                            {
                                caption: "Fullname",
                                dataField: "approver_id",
                                lookup: {
                                    dataSource: listOption('/list-approver/'+modelclass,'id','fullname'),  
                                    valueExpr: 'id',
                                    displayExpr: 'fullname',
                                },
                                validationRules: [
                                    { 
                                        type: "required" 
                                    }
                                ]
                            },
                            {
                                dataField: "ApprovalType",
                                editorOptions: { 
                                    readOnly: true
                                }
                            },
                            {
                                dataField: "approvalDate",
                                dataType: "datetime",
                                format: "dd-MM-yyyy hh:mm:ss",
                            },
                            {
                                caption: "Approval Status",
                                dataField: "approvalAction",
                                encodeHtml: false,
                                allowFiltering: false,
                                allowHeaderFiltering: true,
                                customizeText: function (e) {
                                    var arrText = [
                                        "<span class='btn btn-secondary btn-xs btn-status'>Draft</span>",
                                        "<span class='btn btn-primary btn-xs btn-status'>Waiting Approval</span>",
                                        "<span class='btn btn-warning btn-xs btn-status'>Rework</span>",
                                        "<span class='btn btn-success btn-xs btn-status'>Approved</span>",
                                        "<span class='btn btn-danger btn-xs btn-status'>Rejected</span>",
                                    ];
                                    return arrText[e.value];
                                }
                            },
                        ],
                        export: {
                            enabled: false,
                            fileName: modname,
                            excelFilterEnabled: true,
                            allowExportSelectedData: true
                        },
                        onInitialized: function(e) {
                            dataGridApproverList = e.component;
                        },
                        onContentReady: function(e){
                            moveEditColumnToLeft(e.component);
                        },
                        onInitNewRow : function(e) {
                        },
                        onEditorPreparing: function (e) {
                            if (e.dataField == "approver_id" && e.parentType == "dataRow") {
                                e.editorName = "dxDropDownBox";                
                                e.editorOptions.dropDownOptions = {                
                                    height: 500,
                                    width: 600
                                };
                                e.editorOptions.contentTemplate = function (args, container) {
                    
                                    var value = args.component.option("value"),
                                        $dataGrid = $("<div>").dxDataGrid({
                                            width: '100%',
                                            dataSource: args.component.option("dataSource"),
                                            keyExpr: "id",
                                            columns: ["fullname","ApprovalType"],
                                            hoverStateEnabled: true,
                                            paging: { enabled: true, pageSize: 10 },
                                            filterRow: { visible: true },
                                            height: '90%',
                                            showRowLines: true,
                                            showBorders: true,
                                            selection: { mode: "single" },
                                            selectedRowKeys: [value],
                                            focusedRowEnabled: true,
                                            focusedRowKey: args.component.option("value"),
                                            searchPanel: {
                                                visible: true,
                                                width: 265,
                                                placeholder: "Search..."
                                            },
                                            onSelectionChanged: function (selectedItems) {
                                                const keys = selectedItems.selectedRowKeys;
                                                const hasSelection = keys.length;
                                                args.component.option('value', hasSelection ? keys[0] : null);
                                                if(hasSelection !== 0) {
                                                    args.component.close();
                                                }
                                            }
                                        });
                    
                                    var dataGrid = $dataGrid.dxDataGrid("instance");
                    
                                    args.component.on("valueChanged", function (args) {
                                        var value = args.value;
                    
                                        dataGrid.selectRows(value, false);
                                    });
                                    container.append($dataGrid);
                                    $("<div>").dxButton({
                                        text: "Close",
                    
                                        onClick: function (ev) {
                                            args.component.close();
                                        }
                                    }).css({ float: "right", marginTop: "10px" }).appendTo(container);
                                    return container;
                    
                                };
                            }
                        },
                        onToolbarPreparing: function(e) {
                            e.toolbarOptions.items.unshift({						
                                location: "after",
                                widget: "dxButton",
                                options: {
                                    hint: "Refresh Data",
                                    icon: "refresh",
                                    onClick: function() {
                                        dataGridApproverList.refresh();
                                    }
                                }
                            })
                        },
                        onDataErrorOccurred: function(e) {
                            // Menampilkan pesan kesalahan
                            console.log("Terjadi kesalahan saat memuat data (3):", e.error.message);
                    
                            // Memuat ulang DataGrid
                            dataGridApproverList.refresh();
                        }
                    })

                }
                else if(data.ID == 4) {
                    return $("<div id='formhistorylist'>").dxDataGrid({    
                        dataSource: storewithmodule('approverlisthistory',modelclass,reqid),
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
                            mode: "cell",
                            allowAdding: false,
                            allowUpdating: false,
                            allowDeleting: false,
                        },
                        paging: { enabled: true, pageSize: 10 },
                        columns: [
                            {
                                dataField: "fullname"
                            },
                            {
                                caption: "Type",
                                dataField: "approvalType"
                            },
                            {
                                caption: "Date",
                                dataField: "approvalDate",
                                dataType: "datetime",
                                format: "dd-MM-yyyy hh:mm:ss",
                            },
                            {
                                caption: "Action",
                                dataField: "approvalAction",
                                encodeHtml: false,
                                allowFiltering: false,
                                allowHeaderFiltering: true,
                                customizeText: function (e) {
                                    var arrText = [
                                        "<span class='btn btn-secondary btn-xs btn-status'>Draft</span>",
                                        "<span class='btn btn-primary btn-xs btn-status'>Submitted</span>",
                                        "<span class='btn btn-warning btn-xs btn-status'>Rework</span>",
                                        "<span class='btn btn-success btn-xs btn-status'>Approved</span>",
                                        "<span class='btn btn-danger btn-xs btn-status'>Rejected</span>",
                                        "<span class='btn btn-secondary btn-xs btn-status'>Cancelled</span>",
                                    ];
                                    return arrText[e.value];
                                }
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
                            dataGridApproverHistory = e.component;
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
                                        dataGridApproverHistory.refresh();
                                    }
                                }
                            })
                        },
                        onDataErrorOccurred: function(e) {
                            // Menampilkan pesan kesalahan
                            console.log("Terjadi kesalahan saat memuat data (4):", e.error.message);
                    
                            // Memuat ulang DataGrid
                            dataGridApproverHistory.refresh();
                        }
                    })
                }
                else if(data.ID == 5) {
                    return $("<div id='formassignmentto'>").dxDataGrid({    
                        dataSource: storewithmodule('assignmentto',modelclass,reqid),
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
                            mode: "cell",
                            allowAdding: (admin == 1 || isPendingOnMe == 1) ? true : false,
                            allowUpdating: (admin == 1 || isPendingOnMe == 1) ? true : false,
                            allowDeleting: (admin == 1 || isPendingOnMe == 1) ? true : false,
                        },
                        paging: { enabled: true, pageSize: 10 },
                        columns: [
                            {
                                caption: "PIC Name",
                                dataField: "employee_id",
                                lookup: {
                                    dataSource: listOption('/list-employeeall','id','fullname'),  
                                    valueExpr: 'id',
                                    displayExpr: 'fullname',
                                },
                                validationRules: [{ type: "required" }]
                            },
                        ],
                        export: {
                            enabled: false,
                            fileName: modname,
                            excelFilterEnabled: true,
                            allowExportSelectedData: true
                        },
                        onInitialized: function(e) {
                            dataGridAssignmentto = e.component;
                        },
                        onContentReady: function(e){
                            moveEditColumnToLeft(e.component);
                        },
                        onInitNewRow : function(e) {
                        },
                        onEditorPreparing: function (e) {
                            if (e.dataField == "employee_id" && e.parentType == "dataRow") {
                                e.editorName = "dxDropDownBox";                
                                e.editorOptions.dropDownOptions = {                
                                    height: 500,
                                    width: 600
                                };
                                e.editorOptions.contentTemplate = function (args, container) {
                    
                                    var value = args.component.option("value"),
                                        $dataGrid = $("<div>").dxDataGrid({
                                            width: '100%',
                                            dataSource: args.component.option("dataSource"),
                                            keyExpr: "id",
                                            columns: ["sapid","fullname","companycode","departmentname"],
                                            hoverStateEnabled: true,
                                            paging: { enabled: true, pageSize: 10 },
                                            filterRow: { visible: true },
                                            height: '90%',
                                            showRowLines: true,
                                            showBorders: true,
                                            selection: { mode: "single" },
                                            selectedRowKeys: [value],
                                            focusedRowEnabled: true,
                                            focusedRowKey: args.component.option("value"),
                                            searchPanel: {
                                                visible: true,
                                                width: 265,
                                                placeholder: "Search..."
                                            },
                                            onSelectionChanged: function (selectedItems) {
                                                const keys = selectedItems.selectedRowKeys;
                                                const hasSelection = keys.length;
                                                args.component.option('value', hasSelection ? keys[0] : null);
                                                // console.log(hasSelection)
                                                if(hasSelection !== 0) {
                                                    args.component.close();
                                                }
                                            }
                                        });
                    
                                    var dataGrid = $dataGrid.dxDataGrid("instance");
                    
                                    args.component.on("valueChanged", function (args) {
                                        var value = args.value;
                    
                                        dataGrid.selectRows(value, false);
                                    });
                                    container.append($dataGrid);
                                    $("<div>").dxButton({
                                        text: "Close",
                    
                                        onClick: function (ev) {
                                            args.component.close();
                                        }
                                    }).css({ float: "right", marginTop: "10px" }).appendTo(container);
                                    return container;
                    
                                };
                            }
                        },
                        onToolbarPreparing: function(e) {
                            e.toolbarOptions.items.unshift({						
                                location: "after",
                                widget: "dxButton",
                                options: {
                                    hint: "Refresh Data",
                                    icon: "refresh",
                                    onClick: function() {
                                        dataGridAssignmentto.refresh();
                                    }
                                }
                            })
                        },
                        onDataErrorOccurred: function(e) {
                            // Menampilkan pesan kesalahan
                            console.log("Terjadi kesalahan saat memuat data (5):", e.error.message);
                    
                            // Memuat ulang DataGrid
                            dataGridAssignmentto.refresh();
                        }
                    })
                }
            }
        })
    
    );

    scrollView.dxScrollView({
        width: '100%',
        height: '100%',
    })

    return scrollView;

};

function btnreqsubmit(reqid,mode) {

    var btnSubmit = $('#btn-submit');
    btnSubmit.prop('disabled', true);
    var actionForm = (mode == 'approval') ? 'approval' : 'submission';

    if(mode == 'approval') {
        var valapprovalAction = $('input[name="approvalaction"]:checked').val(); // mengambil nilai dari radio button
        var valremarks = $('#remarks').val(); // mengambil nilai dari text area
        if (!valapprovalAction) {
            alert('Please select approval action.')
            btnSubmit.prop('disabled', false);
            return false;
        }
        else if (!valremarks) {
            alert('Please enter remarks.')
            btnSubmit.prop('disabled', false);
            return false;
        }
        
    }

    var valApprovalType = valapprovalAction == 3 ? 'Approved' : valapprovalAction == 2 ? 'Reworked' : valapprovalAction == 4 ? 'Rejected' : '';

    // var result = confirm('Are you sure you want to send this submission ?');
    // if (result) {
    //     sendRequest(apiurl + "/submissionrequest/"+reqid+"/"+modelclass, "POST", {
    //         requestStatus:1,
    //         action: actionForm,
    //         approvalAction: (valapprovalAction == null) ? 1 : parseInt(valapprovalAction),
    //         approvalType: valApprovalType,
    //         remarks: valremarks
    //     }).then(function(response){
    //         if(response.status == 'error') {
    //             btnSubmit.prop('disabled', false);
    //         } else {
    //             popup.hide();
    //         }
    //     });
    // } else {
    //     btnSubmit.prop('disabled', false);
    //     alert('Cancelled.');
    // }

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
            sendRequest(apiurl + "/submissionrequest/"+reqid+"/"+modelclass, "POST", {
                requestStatus:1,
                action: actionForm,
                approvalAction: (valapprovalAction == null) ? 1 : parseInt(valapprovalAction),
                approvalType: valApprovalType,
                remarks: valremarks
          }).then(function(response){
                if(response.status == 'error') {
                    btnSubmit.prop('disabled', false);
                    hideLoadingScreen();
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: 'Saved',
                        text: 'The submission has been submited.',
                    });
                    popup.hide();
                    hideLoadingScreen();
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
  
    // let imageElement = document.createElement("img");
    //     imageElement.classList.add("uploadedImage");
    //     imageElement.setAttribute('src', "upload/" +cellInfo.value);
    //     imageElement.setAttribute('height', "50");
        
    //     cellElement.append(imageElement);
        cellElement.append(fileUploaderElement);
        cellElement.append(buttonElement);
  
  }

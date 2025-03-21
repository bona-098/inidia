$("#schedulerPopup").dxPopup({
    onHidden: function () {
        // Reset file uploader setelah popup ditutup
        if (dataGridAttachment) {
            let dataSource = dataGridAttachment.getDataSource();
            dataSource.store().clear(); // Hapus data di grid
            dataGridAttachment.refresh(); // Refresh grid
        }
    }
});


let fileUploader = $(fileUploaderElement).dxFileUploader({
    multiple: false,
    accept: ".pptx,.ppt,.docx,.pdf,.xlsx,.csv,.png,.jpg,.jpeg,.zip",
    uploadMode: "instantly",
    name: "myFile",
    uploadUrl: apiurl + "/upload-berkas/" + modname,
    onUploaded: function(e) {
        cellInfo.setValue(e.request.responseText);
        retryButton.option("visible", false);
    },
    onUploadError: function(e) {
        DevExpress.ui.notify(e.request.response, "error");

        form.option("onFieldDataChanged", function(e) {
    if (e.dataField === "guest" || e.dataField === "family") {
        validateBooking();
    }
});

$("#cancelButton").on("click", function() {
    form.resetValues(); // Reset semua nilai form
    if (dataGridAttachment) {
        dataGridAttachment.refresh(); // Pastikan tidak ada file yang tersimpan
    }
});

    },
    onDisposing: function() {
        fileUploader.option("value", []); // Reset file yang diunggah
    }
}).dxFileUploader("instance");

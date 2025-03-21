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
    },
    onDisposing: function() {
        fileUploader.option("value", []); // Reset file yang diunggah
    }
}).dxFileUploader("instance");

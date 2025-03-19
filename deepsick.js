{
    "itemType": "group",
    "colSpan": 2,
    "caption": "Guest Type",
    "items": [
        {
            "itemType": "simple",
            "editorType": "dxTagBox",
            "label": { "text": "Employee" },
            "dataField": "employee",
            "editorOptions": {
                "dataSource": "emplo",
                "displayExpr": "function (item) { if (!item) return ''; const department = departments.find(dept => dept.id === item.department_id); return `${item.FullName} | ${item.SAPID} | ${department ? department.DepartmentName : 'Failed'}`; }",
                "valueExpr": "id",
                "value": "Array.isArray(appointmentData.employee) ? appointmentData.employee : []",
                "showSelectionControls": true,
                "applyValueMode": "useButtons",
                "searchEnabled": true,
                "onValueChanged": "validateBooking"
            }
        },
        {
            "itemType": "simple",
            "editorType": "dxFileUploader",
            "label": { "text": "Employee" },
            "editorOptions": {
                "selectButtonText": "Select photo",
                "labelText": "",
                "accept": "image/*",
                "uploadMode": "useForm",
                "inputAttr": { "aria-label": "Select Photo" }
            }
        }
    ]
}

schedulerOptions: {
    onAppointmentFormOpening: async function(e) {
        // Temporarily prevent the form from opening
        e.cancel = true;

        try {
            // Fetch reqId from your API
            const response = await fetch('https://your-api-endpoint/getReqId');
            const data = await response.json();

            // Override the reqId in the appointment data
            e.appointmentData.reqId = data.reqId;

            // Re-enable the form opening
            e.cancel = false;

            // Optionally, you can also update the form items
            e.form.option('items', [
                {
                    dataField: 'reqId',
                    editorType: 'dxTextBox',
                    label: { text: 'Request ID' }
                },
                // Other form items...
            ]);
        } catch (error) {
            console.error('Failed to fetch reqId:', error);
            // Handle the error (e.g., show a notification)
            e.cancel = false; // Allow the form to open even if the API call fails
        }
    }
}

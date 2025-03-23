onCellClick: function(e) {
    let today = new Date();
    today.setHours(0, 0, 0, 0); // Hanya ambil tanggal tanpa waktu
    let cellDate = new Date(e.cellData.startDate);
    
    if (cellDate < today) {
        e.cancel = true;
        DevExpress.ui.notify({
            type: "warning",
            displayTime: 3000,
            contentTemplate: (e) => {
                e.append(`
                    <div style="white-space: pre-line;">
                    Tidak bisa memilih tanggal yang sudah lewat!\n
                    You cannot select a past date!!\n
                    </div>
                `);
            }
        });
    }
},

onContentReady: function(e) {
    // Tambahkan event listener untuk double click pada cell
    $(e.element).find('.dx-scheduler-date-table-cell').on('dblclick', async function(event) {
        var cellData = e.component.getCellData(event.target);
        
        let roomData = roomsWithLocations.find(room => room.id === cellData.groups.ghm_room_id);
        if (!roomData) {
            DevExpress.ui.notify("Room not Found", "error", 3000);
            return;
        }

        let sector = roomData.sector;
        let response = await sendRequest(apiurl + "/" + modname, "POST", {
            requestStatus: 0,
            ghm_room_id: cellData.groups.ghm_room_id,
            startDate: cellData.startDate,
            endDate: cellData.endDate,
            sector: sector,
            employee: cellData.employee || [],
            guest: cellData.guest || [],
            family: cellData.family || []
        });

        if (response.status === 'success') {
            const reqid = response.data.id;
            popup.option({
                contentTemplate: () => popupContentTemplate(reqid),
            });
            popup.show();
        } else {
            DevExpress.ui.notify({
                type: "error",
                displayTime: 3000,
                contentTemplate: (e) => {
                    e.append(`
                        <div style="white-space: pre-line;">
                        Gagal mendapatkan ID!\n
                        Failed to get ID!!\n
                        </div>
                    `);
                }
            });
        }
        event.preventDefault();
    });
}

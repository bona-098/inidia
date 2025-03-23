onCellClick: async function(e) {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let cellDate = new Date(e.cellData.startDate);
    
    if (cellDate < today) {
        e.cancel = true;
        DevExpress.ui.notify("Tidak bisa memilih tanggal yang sudah lewat!", "warning", 3000);
        return;
    }

    let roomData = roomsWithLocations.find(room => room.id === e.cellData.groups.ghm_room_id);
    if (!roomData) {
        DevExpress.ui.notify("Room not Found", "error", 3000);
        return;
    }

    // Cek atau buat ID dan simpan di cellData
    if (!e.cellData.reqid) {
        e.cellData.reqid = await getOrCreateRequestId(e.cellData, roomData);
    }
},

onContentReady: function(e) {
    let $cells = $(e.element).find('.dx-scheduler-date-table-cell');

    // Hapus event listener sebelumnya agar tidak duplikasi
    $cells.off('dblclick');

    // Tambahkan event listener dblclick
    $cells.on('dblclick', async function(event) {
        var cellData = e.component.getCellData(event.target);

        // Jika ID belum ada, tunggu hingga ID dibuat
        if (!cellData.reqid) {
            let roomData = roomsWithLocations.find(room => room.id === cellData.groups.ghm_room_id);
            if (!roomData) {
                DevExpress.ui.notify("Room not Found", "error", 3000);
                return;
            }

            cellData.reqid = await getOrCreateRequestId(cellData, roomData);
        }

        // Setelah ID tersedia, tampilkan popup
        if (cellData.reqid) {
            popup.option({
                contentTemplate: () => popupContentTemplate(cellData.reqid),
            });
            popup.show();
        } else {
            DevExpress.ui.notify("Gagal mendapatkan ID!", "error", 3000);
        }
    });
},

// Fungsi untuk mendapatkan atau membuat ID
async function getOrCreateRequestId(cellData, roomData) {
    try {
        // Cek apakah ID sudah ada
        let checkResponse = await sendRequest(apiurl + "/" + modname + "/check", "GET", {
            ghm_room_id: cellData.groups.ghm_room_id,
            startDate: cellData.startDate
        });

        if (checkResponse.status === 'success' && checkResponse.data.id) {
            return checkResponse.data.id; // ID sudah ada, langsung pakai
        }

        // Jika tidak ada, buat ID baru
        let postResponse = await sendRequest(apiurl + "/" + modname, "POST", {
            requestStatus: 0,
            ghm_room_id: cellData.groups.ghm_room_id,
            startDate: cellData.startDate,
            endDate: cellData.endDate,
            sector: roomData.sector,
            employee: cellData.employee || [],
            guest: cellData.guest || [],
            family: cellData.family || []
        });

        if (postResponse.status === 'success') {
            return postResponse.data.id; // Kembalikan ID yang baru dibuat
        }
    } catch (error) {
        console.error("Error getting or creating ID:", error);
    }

    return null; // Jika gagal, kembalikan null
}

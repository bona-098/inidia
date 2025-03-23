secara logika, harusnya ketika membuka form jika reqid tidak ada maka dilakukan post atau generate data kemudian data yang sudah dipostlah yang akan ditampilkan di form, kenyataan di kodingan saat ini post berhasil ketika form dibuka tapi ketika form di submit yang tersubmit adalah data baru bukan data yang sudah di post sebelumnya saat baru membuka 
const form = e.form;
                    const appointmentData = e.appointmentData;                    
                    let reqid = appointmentData.id;
                    console.log("Appointment Data:", appointmentData); 

                    if (reqid == null) {
                        let cellData = e.cellData || {}; 
                        let ghm_room_id = cellData.ghm_room_id || appointmentData.ghm_room_id;
                        let roomData = roomsWithLocations.find(room => room.id === ghm_room_id);
                        let sector = roomData ? roomData.sector : null;
                        let startDate = cellData.startDate || appointmentData.startDate;
                        let endDate = cellData.endDate || appointmentData.endDate;

                        if (ghm_room_id && startDate && endDate) { 
                            sendRequest(apiurl + "/"+modname, "POST", {
                                requestStatus: 0,
                                ghm_room_id: ghm_room_id,
                                startDate: startDate,
                                endDate: endDate,
                                sector: sector,
                                employee: cellData.employee || appointmentData.employee || [],
                                guest: cellData.guest || appointmentData.guest || [],
                                family: cellData.family || appointmentData.family || []
                            }).then(function(response) {
                                console.log("Response from POST request:", response);
                                reqid = response.data.id; // Set reqid with the new ID
                                // Update form with the new reqid
                                appointmentData.id = reqid;
                                form.updateData('id', reqid);
                                // Reload form with updated data
                                form.repaint();
                            }).catch(function(error) {
                                console.error("Error during POST request:", error);
                            });
                        } else {
                            console.error("Required data is missing");
                        }

                        dataSubmitted = false;
                        if (e.event) { 
                            e.event.preventDefault();
                        } else {
                            console.error("event is undefined");
                        }
                    } 
                    console.log("req", reqid);
                             
                    let reqis = appointmentData.id;
                    console.log("reqad", reqis);

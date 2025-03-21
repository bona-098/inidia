DB::raw("CASE 
            WHEN tbl_approverListHistory.approvalDate >= DATEADD(DAY, -2, request_ghm.startDate) 
            THEN '0:00:00:00'
            ELSE 
                CAST(DATEDIFF(SECOND, tbl_approverListHistory.approvalDate, DATEADD(DAY, -2, request_ghm.startDate)) / 86400 AS VARCHAR) + ':' +
                FORMAT(DATEADD(SECOND, DATEDIFF(SECOND, tbl_approverListHistory.approvalDate, DATEADD(DAY, -2, request_ghm.startDate)) % 86400, 0), 'HH:mm:ss')
        END AS time_left")




<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; 

class AutoapproveghmController extends Controller
{
    ////////////////auto-approve\\\\\\\\\\\\\\
    public function index(Request $request)
    {
        $data = DB::table('request_ghm')
            ->join('tbl_approverListHistory', 'request_ghm.id', '=', 'tbl_approverListHistory.req_id')
            ->select(
                'request_ghm.id',
                'tbl_approverListHistory.req_id',
                'tbl_approverListHistory.module_id',
                'request_ghm.requestStatus AS rs',
                'tbl_approverListHistory.approvalType',
                'tbl_approverListHistory.fullname',
                DB::raw("FORMAT(request_ghm.startDate, 'yyyy-MM-dd HH:mm:ss') as startDate"),
                DB::raw("FORMAT(tbl_approverListHistory.approvalDate, 'yyyy-MM-dd HH:mm:ss') as submittedDate"),
                DB::raw("CASE 
                            WHEN DATEDIFF(day, tbl_approverListHistory.approvalDate, request_ghm.startDate) <= 2 
                            THEN '00:00:00'
                            ELSE 
                                CASE 
                                    WHEN DATEDIFF(SECOND, DATEADD(DAY, 2, tbl_approverListHistory.approvalDate), request_ghm.startDate) < 0 
                                    THEN '-' + 
                                        FORMAT(ABS(DATEDIFF(SECOND, DATEADD(DAY, 2, tbl_approverListHistory.approvalDate), request_ghm.startDate)), 'HH:mm:ss')
                                    ELSE 
                                        FORMAT(DATEDIFF(SECOND, DATEADD(DAY, 2, tbl_approverListHistory.approvalDate), request_ghm.startDate), 'HH:mm:ss')
                                END
                        END AS time_left")
            )
            ->where('request_ghm.requestStatus', 1)
            ->where('tbl_approverListHistory.module_id', '57')
            ->get();

        return response()->json([
            'status' => "show",
            'message' => $this->getMessage()['show'],
            'data' => $data,
        ])->setEncodingOptions(JSON_NUMERIC_CHECK);
    }

    ////////////////show-request\\\\\\\\\\\\\\
    public function show($id)
    {
        $data = DB::table('request_ghm')
            ->join('tbl_approverListHistory', 'request_ghm.id', '=', 'tbl_approverListHistory.req_id')
            ->select(
                'request_ghm.id',
                'tbl_approverListHistory.req_id',
                'tbl_approverListHistory.module_id',
                'request_ghm.requestStatus AS rs',
                'tbl_approverListHistory.approvalType',
                'tbl_approverListHistory.fullname',
                DB::raw("FORMAT(request_ghm.startDate, 'yyyy-MM-dd HH:mm:ss') as startDate"),
                DB::raw("FORMAT(tbl_approverListHistory.approvalDate, 'yyyy-MM-dd HH:mm:ss') as submittedDate"),
                DB::raw("CASE 
                            WHEN DATEDIFF(day, tbl_approverListHistory.approvalDate, request_ghm.startDate) <= 2 
                            THEN '00:00:00'
                            ELSE 
                                CASE 
                                    WHEN DATEDIFF(SECOND, DATEADD(DAY, 2, tbl_approverListHistory.approvalDate), request_ghm.startDate) < 0 
                                    THEN '-' + 
                                        FORMAT(ABS(DATEDIFF(SECOND, DATEADD(DAY, 2, tbl_approverListHistory.approvalDate), request_ghm.startDate)), 'HH:mm:ss')
                                    ELSE 
                                        FORMAT(DATEDIFF(SECOND, DATEADD(DAY, 2, tbl_approverListHistory.approvalDate), request_ghm.startDate), 'HH:mm:ss')
                                END
                        END AS time_left")
            )
            ->where('request_ghm.id', $id)
            ->first();

        if ($data) {
            return response()->json([
                'status' => "success",
                'message' => "Record found",
                'data' => $data,
            ]);
        } else {
            return response()->json([
                'status' => "error",
                'message' => "Record not found",
            ], 404);
        }
    }

    ////////////////update-request\\\\\\\\\\\\\\
    public function update(Request $request, $id)
    {
        // Validate the incoming request data
        $request->validate([
            'startDate' => 'required|date_format:Y-m-d H:i:s',
            'requestStatus' => 'required|integer',
        ]);

        // Update the record in the database
        $affected = DB::table('request_ghm')
            ->where('id', $id)
            ->update([
                'startDate' => $request->input('startDate'),
                'requestStatus' => $request->input('requestStatus'),
            ]);

        // Check if the update was successful
        if ($affected) {
            return response()->json([
                'status' => "success",
                'message' => "Record updated successfully",
            ]);
        } else {
            return response()->json([
                'status' => "error",
                'message' => "Failed to update record",
            ], 500);
        }
    }
}

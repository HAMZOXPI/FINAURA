import { NextResponse } from "next/server";

import { runNotificationMaintenanceJobs } from "@/lib/notifications/jobs/maintenance";



export async function GET(request: Request) {

  const authHeader = request.headers.get("authorization");

  const cronSecret = process.env.CRON_SECRET;



  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  }



  try {

    const result = await runNotificationMaintenanceJobs();

    return NextResponse.json({ success: true, ...result });

  } catch (error) {

    console.error("Notification cron failed:", error);

    return NextResponse.json(

      { error: error instanceof Error ? error.message : "Job failed" },

      { status: 500 }

    );

  }

}



import { NextRequest, NextResponse } from "next/server";
import { db, eq } from "@/lib/apiHelper";
import { maintenanceInstallments, maintenance } from "@/db/schema";
import { getSession } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  
  const conditions = [];
  if (search) conditions.push(eq(maintenance.name, search));
  if (from) conditions.push(eq(maintenanceInstallments.createdAt, new Date(from)));
  if (to) conditions.push(eq(maintenanceInstallments.createdAt, new Date(to)));
  
  const rows = await db.select({
    id: maintenanceInstallments.id,
    maintenanceId: maintenanceInstallments.maintenanceId,
    maintenanceName: maintenance.name,
    amount: maintenanceInstallments.amount,
    paidAmount: maintenanceInstallments.paidAmount,
    installmentDate: maintenanceInstallments.installmentDate,
    createdAt: maintenanceInstallments.createdAt,
  }).from(maintenanceInstallments).leftJoin(maintenance, eq(maintenance.id, maintenanceInstallments.maintenanceId));
  
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  
  const result = await db.insert(maintenanceInstallments).values({
    maintenanceId: body.maintenanceId,
    amount: Number(body.amount) || 0,
    paidAmount: body.paidAmount || 0,
    installmentDate: body.installmentDate ? new Date(body.installmentDate) : new Date(),
  }).returning();
  
  // Update maintenance labor cost
  if (body.maintenanceId) {
    const currentMaintenance = await db.select({ laborCost: maintenance.laborCost })
      .from(maintenance)
      .where(eq(maintenance.id, body.maintenanceId))
      .limit(1);
    
    const newLaborCost = Math.max(0, (currentMaintenance[0]?.laborCost || 0) - (Number(body.amount) || 0));
    
    await db.update(maintenance)
      .set({ laborCost: newLaborCost })
      .where(eq(maintenance.id, body.maintenanceId));
  }
  
  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  
  const result = await db.update(maintenanceInstallments)
    .set({
      amount: Number(body.amount) || 0,
      paidAmount: body.paidAmount || 0,
      installmentDate: body.installmentDate ? new Date(body.installmentDate) : undefined,
    })
    .where(eq(maintenanceInstallments.id, body.id))
    .returning();
  
  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  
  await db.delete(maintenanceInstallments).where(eq(maintenanceInstallments.id, Number(id)));
  return NextResponse.json({ success: true });
}
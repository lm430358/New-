"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Download, FileText, Trash2 } from "lucide-react";
import type { PurchaseOrder } from "@prisma/client";

export function PurchaseOrderActions({ po }: { po: PurchaseOrder }) {
  const router = useRouter();
  const [status, setStatus] = useState(po.status);
  const [deleting, setDeleting] = useState(false);

  async function updateStatus(value: string) {
    setStatus(value);
    await fetch(`/api/purchase-orders/${po.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value }),
    });
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this purchase order?")) return;
    setDeleting(true);
    await fetch(`/api/purchase-orders/${po.id}`, { method: "DELETE" });
    router.push("/purchase-orders");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={status} onChange={(e) => updateStatus(e.target.value)} className="max-w-[160px]">
        <option value="draft">Draft</option>
        <option value="sent">Sent</option>
        <option value="received">Received</option>
        <option value="cancelled">Cancelled</option>
      </Select>
      <a href={`/api/purchase-orders/${po.id}/pdf`}>
        <Button type="button" variant="secondary" size="sm"><FileText size={14} /> Export PDF</Button>
      </a>
      <a href={`/api/purchase-orders/${po.id}/csv`}>
        <Button type="button" variant="secondary" size="sm"><Download size={14} /> Export CSV</Button>
      </a>
      <Button type="button" variant="danger" size="sm" onClick={remove} disabled={deleting} className="ml-auto">
        <Trash2 size={14} /> Delete
      </Button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface LineItem {
  partNumber: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

export function PurchaseOrderForm({ vendors }: { vendors: { id: string; name: string }[] }) {
  const router = useRouter();
  const [poNumber, setPoNumber] = useState(() => `PO-${Date.now().toString().slice(-6)}`);
  const [vendorId, setVendorId] = useState("");
  const [shippingCost, setShippingCost] = useState("0");
  const [taxRate, setTaxRate] = useState("0");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ partNumber: "", description: "", quantity: "1", unitPrice: "0" }]);
  const [saving, setSaving] = useState(false);

  function updateItem(idx: number, key: keyof LineItem, value: string) {
    setItems((its) => its.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
  }

  const subtotal = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
  const tax = subtotal * (Number(taxRate) / 100 || 0);
  const total = subtotal + tax + (Number(shippingCost) || 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/purchase-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        poNumber,
        vendorId: vendorId || null,
        shippingCost,
        taxRate,
        notes,
        lineItems: items.filter((it) => it.description.trim()),
      }),
    });
    setSaving(false);
    const data = await res.json();
    if (res.ok) {
      router.push(`/purchase-orders/${data.purchaseOrder.id}`);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardBody className="grid grid-cols-2 gap-4">
          <Field label="PO number"><Input required value={poNumber} onChange={(e) => setPoNumber(e.target.value)} /></Field>
          <Field label="Vendor">
            <Select value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
              <option value="">— select —</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </Select>
          </Field>
          <Field label="Shipping (USD)"><Input type="number" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} /></Field>
          <Field label="Tax rate (%)"><Input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} /></Field>
          <div className="col-span-2"><Field label="Notes"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></Field></div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Line items</CardTitle>
          <Button type="button" size="sm" variant="secondary" onClick={() => setItems((its) => [...its, { partNumber: "", description: "", quantity: "1", unitPrice: "0" }])}>
            + Add line
          </Button>
        </CardHeader>
        <CardBody className="space-y-3">
          {items.map((it, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-2"><Field label="Part #"><Input value={it.partNumber} onChange={(e) => updateItem(idx, "partNumber", e.target.value)} /></Field></div>
              <div className="col-span-4"><Field label="Description"><Input value={it.description} onChange={(e) => updateItem(idx, "description", e.target.value)} /></Field></div>
              <div className="col-span-2"><Field label="Qty"><Input type="number" value={it.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} /></Field></div>
              <div className="col-span-2"><Field label="Unit price"><Input type="number" step="0.01" value={it.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", e.target.value)} /></Field></div>
              <div className="col-span-1 text-sm font-medium pb-2">{formatCurrency((Number(it.quantity) || 0) * (Number(it.unitPrice) || 0))}</div>
              <div className="col-span-1 pb-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setItems((its) => its.filter((_, i) => i !== idx))}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex justify-end">
          <div className="space-y-1 text-sm text-right">
            <p>Subtotal: <span className="font-medium">{formatCurrency(subtotal)}</span></p>
            <p>Tax: <span className="font-medium">{formatCurrency(tax)}</span></p>
            <p>Shipping: <span className="font-medium">{formatCurrency(Number(shippingCost) || 0)}</span></p>
            <p className="text-base font-semibold">Total: {formatCurrency(total)}</p>
          </div>
        </CardBody>
      </Card>

      <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Create purchase order"}</Button>
    </form>
  );
}

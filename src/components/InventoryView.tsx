"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AlertTriangle, Trash2 } from "lucide-react";
import type { InventoryItem } from "@prisma/client";

type Item = InventoryItem & { vendor?: { id: string; name: string } | null };

const emptyForm = {
  partNumber: "",
  description: "",
  brand: "",
  quantity: "0",
  purchaseCost: "",
  sellingPrice: "",
  storageLocation: "",
  reorderLevel: "0",
};

export function InventoryView() {
  const [items, setItems] = useState<Item[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/inventory");
    const data = await res.json();
    setItems(data.items ?? []);
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setShowAdd(false);
    setForm(emptyForm);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Remove this inventory item?")) return;
    await fetch(`/api/inventory/${id}`, { method: "DELETE" });
    load();
  }

  const lowStock = items.filter((i) => i.quantity <= i.reorderLevel);

  return (
    <div className="space-y-6 max-w-5xl">
      {lowStock.length > 0 && (
        <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Low inventory: {lowStock.length} item(s) at or below reorder level</p>
            <p className="text-xs">{lowStock.map((i) => i.description).join(", ")}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="button" onClick={() => setShowAdd((s) => !s)}>{showAdd ? "Cancel" : "+ Add inventory item"}</Button>
      </div>

      {showAdd && (
        <Card>
          <CardHeader><CardTitle>New inventory item</CardTitle></CardHeader>
          <CardBody>
            <form onSubmit={submit} className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Field label="Description"><Input required value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></Field></div>
              <Field label="Part number"><Input value={form.partNumber} onChange={(e) => setForm((f) => ({ ...f, partNumber: e.target.value }))} /></Field>
              <Field label="Brand"><Input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} /></Field>
              <Field label="Quantity"><Input type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} /></Field>
              <Field label="Reorder level"><Input type="number" value={form.reorderLevel} onChange={(e) => setForm((f) => ({ ...f, reorderLevel: e.target.value }))} /></Field>
              <Field label="Purchase cost"><Input type="number" step="0.01" value={form.purchaseCost} onChange={(e) => setForm((f) => ({ ...f, purchaseCost: e.target.value }))} /></Field>
              <Field label="Selling price"><Input type="number" step="0.01" value={form.sellingPrice} onChange={(e) => setForm((f) => ({ ...f, sellingPrice: e.target.value }))} /></Field>
              <Field label="Storage location"><Input value={form.storageLocation} onChange={(e) => setForm((f) => ({ ...f, storageLocation: e.target.value }))} /></Field>
              <div className="col-span-2"><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Add item"}</Button></div>
            </form>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody className="overflow-x-auto">
          {items.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No inventory tracked yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border)]">
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 pr-4">Brand</th>
                  <th className="py-2 pr-4">Qty</th>
                  <th className="py-2 pr-4">Cost</th>
                  <th className="py-2 pr-4">Price</th>
                  <th className="py-2 pr-4">Location</th>
                  <th className="py-2 pr-4">Purchased</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-4">{i.description}{i.partNumber ? ` (${i.partNumber})` : ""}</td>
                    <td className="py-2 pr-4">{i.brand ?? "—"}</td>
                    <td className="py-2 pr-4">
                      {i.quantity}
                      {i.quantity <= i.reorderLevel && <Badge tone="warning" className="ml-1.5">Low</Badge>}
                    </td>
                    <td className="py-2 pr-4">{formatCurrency(i.purchaseCost)}</td>
                    <td className="py-2 pr-4">{formatCurrency(i.sellingPrice)}</td>
                    <td className="py-2 pr-4">{i.storageLocation ?? "—"}</td>
                    <td className="py-2 pr-4">{i.datePurchased ? formatDate(i.datePurchased) : "—"}</td>
                    <td className="py-2 pr-4">
                      <Button type="button" variant="ghost" size="sm" onClick={() => remove(i.id)}><Trash2 size={14} /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

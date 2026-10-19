"use client";

import { useMemo, useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input, Select, Checkbox } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle } from "lucide-react";
import {
  calculateRepairEstimate,
  DEFAULT_REPAIR_ESTIMATE_RATES,
  LIABILITY_CUTOFF_YEAR,
  type RepairEstimateInput,
} from "@/lib/repairEstimate";
import { formatCurrency } from "@/lib/utils";

const currentYear = new Date().getFullYear();

export function RepairEstimateCalculator() {
  const [year, setYear] = useState(String(currentYear - 8));
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [engineSize, setEngineSize] = useState<RepairEstimateInput["engineSize"]>("4cyl");
  const [brakeType, setBrakeType] = useState<RepairEstimateInput["brakeType"]>("hydraulic");
  const [hasRust, setHasRust] = useState(false);
  const [starts, setStarts] = useState(true);
  const [lastServiceDate, setLastServiceDate] = useState("");

  const [laborHours, setLaborHours] = useState("2");
  const [laborRatePerHour, setLaborRatePerHour] = useState(String(DEFAULT_REPAIR_ESTIMATE_RATES.laborRatePerHour));
  const [includeDiagnostic, setIncludeDiagnostic] = useState(true);

  const [distanceMiles, setDistanceMiles] = useState("0");
  const [freeRadiusMiles, setFreeRadiusMiles] = useState(String(DEFAULT_REPAIR_ESTIMATE_RATES.freeRadiusMiles));
  const [ratePerMileBeyondRadius, setRatePerMileBeyondRadius] = useState(
    String(DEFAULT_REPAIR_ESTIMATE_RATES.ratePerMileBeyondRadius)
  );

  const [diagnosticFee, setDiagnosticFee] = useState(String(DEFAULT_REPAIR_ESTIMATE_RATES.diagnosticFee));
  const [rustSurcharge, setRustSurcharge] = useState(String(DEFAULT_REPAIR_ESTIMATE_RATES.rustSurcharge));
  const [nonRunningSurcharge, setNonRunningSurcharge] = useState(String(DEFAULT_REPAIR_ESTIMATE_RATES.nonRunningSurcharge));
  const [liabilitySurcharge, setLiabilitySurcharge] = useState(String(DEFAULT_REPAIR_ESTIMATE_RATES.liabilitySurcharge));
  const [electronicBrakeSurcharge, setElectronicBrakeSurcharge] = useState(
    String(DEFAULT_REPAIR_ESTIMATE_RATES.electronicBrakeSurcharge)
  );

  const result = useMemo(
    () =>
      calculateRepairEstimate({
        year: year ? Number(year) : null,
        make,
        model,
        engineSize,
        brakeType,
        hasRust,
        starts,
        lastServiceDate: lastServiceDate || null,
        laborHours: Number(laborHours) || 0,
        laborRatePerHour: Number(laborRatePerHour) || 0,
        includeDiagnostic,
        distanceMiles: Number(distanceMiles) || 0,
        freeRadiusMiles: Number(freeRadiusMiles) || 0,
        ratePerMileBeyondRadius: Number(ratePerMileBeyondRadius) || 0,
        diagnosticFee: Number(diagnosticFee) || 0,
        rustSurcharge: Number(rustSurcharge) || 0,
        nonRunningSurcharge: Number(nonRunningSurcharge) || 0,
        liabilitySurcharge: Number(liabilitySurcharge) || 0,
        electronicBrakeSurcharge: Number(electronicBrakeSurcharge) || 0,
      }),
    [
      year,
      make,
      model,
      engineSize,
      brakeType,
      hasRust,
      starts,
      lastServiceDate,
      laborHours,
      laborRatePerHour,
      includeDiagnostic,
      distanceMiles,
      freeRadiusMiles,
      ratePerMileBeyondRadius,
      diagnosticFee,
      rustSurcharge,
      nonRunningSurcharge,
      liabilitySurcharge,
      electronicBrakeSurcharge,
    ]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Vehicle</CardTitle></CardHeader>
          <CardBody className="grid grid-cols-3 gap-3">
            <Field label="Year">
              <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
            </Field>
            <Field label="Make"><Input value={make} onChange={(e) => setMake(e.target.value)} /></Field>
            <Field label="Model"><Input value={model} onChange={(e) => setModel(e.target.value)} /></Field>
            <Field label="Engine size">
              <Select value={engineSize} onChange={(e) => setEngineSize(e.target.value as RepairEstimateInput["engineSize"])}>
                <option value="4cyl">4-cylinder</option>
                <option value="6cyl">6-cylinder</option>
                <option value="8cyl-plus">8-cylinder or larger</option>
              </Select>
            </Field>
            <Field label="Brakes">
              <Select value={brakeType} onChange={(e) => setBrakeType(e.target.value as RepairEstimateInput["brakeType"])}>
                <option value="hydraulic">Hydraulic / manual</option>
                <option value="electronic">Electronic parking brake</option>
              </Select>
            </Field>
            <Field label="Last repair / oil change" hint="Optional">
              <Input type="date" value={lastServiceDate} onChange={(e) => setLastServiceDate(e.target.value)} />
            </Field>
            <div className="col-span-3 flex flex-wrap gap-4 pt-1">
              <Checkbox label="Has visible rust" checked={hasRust} onChange={(e) => setHasRust(e.target.checked)} />
              <Checkbox label="Starts" checked={starts} onChange={(e) => setStarts(e.target.checked)} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Job</CardTitle></CardHeader>
          <CardBody className="grid grid-cols-2 gap-3">
            <Field label="Labor hours"><Input type="number" step="0.25" value={laborHours} onChange={(e) => setLaborHours(e.target.value)} /></Field>
            <Field label="Labor rate ($/hr)"><Input type="number" value={laborRatePerHour} onChange={(e) => setLaborRatePerHour(e.target.value)} /></Field>
            <div className="col-span-2">
              <Checkbox
                label={`Include diagnostic fee ($${diagnosticFee || 0}) — recommended for all vehicles`}
                checked={includeDiagnostic}
                onChange={(e) => setIncludeDiagnostic(e.target.checked)}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Travel (from your shop / East-West Connector)</CardTitle></CardHeader>
          <CardBody className="grid grid-cols-3 gap-3">
            <Field label="Distance (miles)"><Input type="number" value={distanceMiles} onChange={(e) => setDistanceMiles(e.target.value)} /></Field>
            <Field label="Free radius (miles)"><Input type="number" value={freeRadiusMiles} onChange={(e) => setFreeRadiusMiles(e.target.value)} /></Field>
            <Field label="Rate beyond radius ($/mi)"><Input type="number" step="0.1" value={ratePerMileBeyondRadius} onChange={(e) => setRatePerMileBeyondRadius(e.target.value)} /></Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Rates (tune these to your shop)</CardTitle></CardHeader>
          <CardBody className="grid grid-cols-2 gap-3">
            <Field label="Diagnostic fee ($)"><Input type="number" value={diagnosticFee} onChange={(e) => setDiagnosticFee(e.target.value)} /></Field>
            <Field label="Rust surcharge ($)"><Input type="number" value={rustSurcharge} onChange={(e) => setRustSurcharge(e.target.value)} /></Field>
            <Field label="Non-running surcharge ($)"><Input type="number" value={nonRunningSurcharge} onChange={(e) => setNonRunningSurcharge(e.target.value)} /></Field>
            <Field label={`Pre-${LIABILITY_CUTOFF_YEAR} liability surcharge ($)`}><Input type="number" value={liabilitySurcharge} onChange={(e) => setLiabilitySurcharge(e.target.value)} /></Field>
            <Field label="Electronic parking brake surcharge ($)"><Input type="number" value={electronicBrakeSurcharge} onChange={(e) => setElectronicBrakeSurcharge(e.target.value)} /></Field>
          </CardBody>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Estimate</CardTitle>
            {result.isLiabilityVehicle && <Badge tone="warning">Pre-{LIABILITY_CUTOFF_YEAR} liability vehicle</Badge>}
          </CardHeader>
          <CardBody className="space-y-3">
            {result.lineItems.map((li) => (
              <div key={li.label} className="flex items-start justify-between text-sm">
                <div>
                  <p>{li.label}</p>
                  <p className="text-xs text-[var(--text-muted)]">{li.detail}</p>
                </div>
                <p className="font-medium shrink-0 pl-3">{formatCurrency(li.amount)}</p>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm pt-2 border-t border-[var(--border)]">
              <span className="text-[var(--text-muted)]">Subtotal</span>
              <span className="font-medium">{formatCurrency(result.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-muted)]">Travel fee</span>
              <span className="font-medium">{formatCurrency(result.travelFee)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
              <span className="font-semibold">Estimated total</span>
              <span className="text-lg font-semibold">{formatCurrency(result.total)}</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
              This is a planning estimate from the numbers entered above — not a binding quote.
              Confirm final pricing with the customer, and adjust for anything found once the
              vehicle is actually inspected.
            </p>
          </CardBody>
        </Card>

        {result.advisories.length > 0 && (
          <Card>
            <CardBody className="space-y-2">
              {result.advisories.map((a) => (
                <div key={a} className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 rounded-md p-3">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <p>{a}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

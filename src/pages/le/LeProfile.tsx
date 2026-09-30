import { useState } from "react";
import { Check, Save, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LePage, Card, Field, inputCls } from "@/components/le/LePage";
import { loadAudit, loadOfficer, saveOfficer, statusBadge } from "@/lib/leData";
import { team } from "./LeAudit";

type Tab = "profile" | "agency" | "users" | "activity" | "password";
const tabs: [Tab, string][] = [["profile", "My Profile"], ["agency", "Agency Profile"], ["users", "Manage Users"], ["activity", "Activity Logs"], ["password", "Change Password"]];

const LeProfile = () => {
  const [tab, setTab] = useState<Tab>("profile");
  const [o, setO] = useState(loadOfficer);
  const [agency, setAgency] = useState({ name: o.agency, address: "2500 W Colonial Dr", country: "United States", zip: "32804", city: "Orlando", state: "Florida", admin: "Capt. Robert Hayes", phone: "+1 (407) 555-0100" });
  const [users, setUsers] = useState(team);
  const [pw, setPw] = useState({ old: "", next: "", confirm: "" });
  const isAdmin = o.role === "Agency Administrator" || o.role === "Supervisor";

  return (
    <LePage eyebrow="Account" title="Profile & Agency">
      <div className="mb-5 flex flex-wrap gap-1 rounded-md bg-muted p-1 w-fit">
        {tabs.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`rounded px-3 py-1.5 text-xs font-semibold ${tab === k ? "bg-card shadow-sm" : "text-muted-foreground"}`}>{l}</button>)}
      </div>

      {tab === "profile" && (
        <Card className="max-w-3xl p-6">
          <div className="mb-5 flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"><User className="h-7 w-7 text-primary" /></div><div><p className="font-semibold">{o.name}</p><p className="text-xs text-muted-foreground">{o.role} · Badge {o.badge}</p></div></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><input className={inputCls} value={o.name} onChange={(e) => setO({ ...o, name: e.target.value })} /></Field>
            <Field label="Title"><input className={inputCls} value={o.title} onChange={(e) => setO({ ...o, title: e.target.value })} /></Field>
            <Field label="Office phone"><input className={inputCls} value={o.officePhone} onChange={(e) => setO({ ...o, officePhone: e.target.value })} /></Field>
            <Field label="Personal phone"><input className={inputCls} value={o.personalPhone} onChange={(e) => setO({ ...o, personalPhone: e.target.value })} /></Field>
            <Field label="Email address"><input className={inputCls} value={o.email} disabled /></Field>
            <Field label="Role (demo switch)"><select className={inputCls} value={o.role} onChange={(e) => setO({ ...o, role: e.target.value as typeof o.role })}>{["Patrol Officer", "Investigator", "Supervisor", "Agency Administrator", "Auditor"].map((r) => <option key={r}>{r}</option>)}</select></Field>
          </div>
          <Button className="mt-5" onClick={() => { saveOfficer(o); toast.success("Profile saved"); }}><Save /> Save</Button>
        </Card>
      )}

      {tab === "agency" && (
        <Card className="max-w-3xl p-6">
          <h2 className="mb-4 text-sm font-semibold">Agency information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name of agency"><input className={inputCls} value={agency.name} onChange={(e) => setAgency({ ...agency, name: e.target.value })} /></Field>
            <Field label="Address"><input className={inputCls} value={agency.address} onChange={(e) => setAgency({ ...agency, address: e.target.value })} /></Field>
            <Field label="City"><input className={inputCls} value={agency.city} onChange={(e) => setAgency({ ...agency, city: e.target.value })} /></Field>
            <Field label="State"><input className={inputCls} value={agency.state} onChange={(e) => setAgency({ ...agency, state: e.target.value })} /></Field>
            <Field label="Country"><input className={inputCls} value={agency.country} onChange={(e) => setAgency({ ...agency, country: e.target.value })} /></Field>
            <Field label="Zip code"><input className={inputCls} value={agency.zip} onChange={(e) => setAgency({ ...agency, zip: e.target.value })} /></Field>
          </div>
          <h2 className="mb-4 mt-6 text-sm font-semibold">About agency</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary admin name"><input className={inputCls} value={agency.admin} onChange={(e) => setAgency({ ...agency, admin: e.target.value })} /></Field>
            <Field label="Phone number"><input className={inputCls} value={agency.phone} onChange={(e) => setAgency({ ...agency, phone: e.target.value })} /></Field>
          </div>
          <Button className="mt-5" onClick={() => toast.success("Agency saved")}><Save /> Save</Button>
        </Card>
      )}

      {tab === "users" && (
        <Card className="overflow-x-auto">
          {!isAdmin && <p className="border-b border-border bg-warning/10 px-4 py-2 text-xs text-warning">Only agency administrators and supervisors can approve or remove users. Switch role in My Profile to try it.</p>}
          <table className="w-full min-w-[600px] text-sm">
            <thead className="border-b border-border text-left text-xs text-muted-foreground"><tr>{["Member", "Role", "Status", ""].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.badge}>
                  <td className="px-4 py-3 font-medium">{u.name}</td><td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadge(u.status)}`}>{u.status}</span></td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {u.status === "Pending" && <Button size="sm" disabled={!isAdmin} onClick={() => setUsers(users.map((x) => (x.badge === u.badge ? { ...x, status: "Active" } : x)))}><Check /> Approve</Button>}
                    <Button size="sm" variant="outline" disabled={!isAdmin} onClick={() => setUsers(users.filter((x) => x.badge !== u.badge))}><Trash2 /> Remove</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "activity" && (
        <Card className="divide-y divide-border">
          {loadAudit().filter((a) => a.officer === o.name || a.agency.includes("Orange")).map((a) => (
            <div key={a.id} className="flex flex-wrap justify-between gap-2 px-5 py-3 text-sm"><span><b className="font-semibold">{a.action}</b> · {a.data}</span><span className="text-xs text-muted-foreground">{a.officer} · {new Date(a.at).toLocaleString()}</span></div>
          ))}
        </Card>
      )}

      {tab === "password" && (
        <Card className="max-w-md space-y-4 p-6">
          <Field label="Old password"><input type="password" className={inputCls} value={pw.old} onChange={(e) => setPw({ ...pw, old: e.target.value })} /></Field>
          <Field label="New password"><input type="password" className={inputCls} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
          <Field label="Confirm password"><input type="password" className={inputCls} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></Field>
          <Button onClick={() => {
            if (!pw.old || pw.next.length < 6) return toast.error("New password must be at least 6 characters");
            if (pw.next !== pw.confirm) return toast.error("Passwords don't match");
            setPw({ old: "", next: "", confirm: "" }); toast.success("Password updated");
          }}><Save /> Save</Button>
        </Card>
      )}
    </LePage>
  );
};

export default LeProfile;

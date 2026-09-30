import { useState } from "react";
import { Plug, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LePage, Card, Field, inputCls } from "@/components/le/LePage";
import { loadApis, saveApis, statusBadge, type ApiConfig } from "@/lib/leData";
import { toast } from "sonner";

const LeApis = () => {
  const [apis, setApis] = useState(loadApis);
  const [editing, setEditing] = useState<string | null>(null);
  const update = (id: string, patch: Partial<ApiConfig>) => setApis((a) => a.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const save = (api: ApiConfig) => {
    const next = apis.map((x) => (x.id === api.id ? { ...x, status: (x.enabled ? (x.endpoint && x.apiKey ? "Synced" : "Error") : "Disabled") as ApiConfig["status"], lastSync: x.enabled ? new Date().toISOString() : x.lastSync } : x));
    setApis(next); saveApis(next); setEditing(null); toast.success(`${api.name} saved`);
  };
  const syncAll = () => {
    const next = apis.map((x) => (x.enabled && x.endpoint && x.apiKey ? { ...x, status: "Synced" as const, lastSync: new Date().toISOString() } : x));
    setApis(next); saveApis(next); toast.success("Sync complete");
  };

  return (
    <LePage eyebrow="Integrations" title="CJIS APIs" subtitle="Connected criminal-justice data sources and their sync status." action={<Button onClick={syncAll}><RefreshCw /> Sync all</Button>}>
      <div className="grid gap-4 lg:grid-cols-2">
        {apis.map((api) => (
          <Card key={api.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Plug className="h-5 w-5 text-primary" /></div>
                <div><h2 className="text-sm font-semibold">{api.name}</h2><p className="text-xs text-muted-foreground">{api.description}</p></div>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadge(api.status)}`}>{api.status}</span>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">Last sync: {api.lastSync === "—" ? "—" : new Date(api.lastSync).toLocaleString()}</p>
            {editing === api.id ? (
              <div className="mt-4 space-y-3">
                <Field label="Endpoint URL"><input className={`${inputCls} font-mono`} value={api.endpoint} onChange={(e) => update(api.id, { endpoint: e.target.value })} /></Field>
                <Field label="API key"><input className={`${inputCls} font-mono`} type="password" value={api.apiKey} onChange={(e) => update(api.id, { apiKey: e.target.value })} /></Field>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm"><Switch checked={api.enabled} onCheckedChange={(v) => update(api.id, { enabled: v })} /> Enabled</label>
                  <div className="flex gap-2"><Button variant="ghost" onClick={() => { setApis(loadApis()); setEditing(null); }}>Cancel</Button><Button onClick={() => save(api)}><Save /> Save</Button></div>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setEditing(api.id)}>Update API</Button>
            )}
          </Card>
        ))}
      </div>
    </LePage>
  );
};

export default LeApis;

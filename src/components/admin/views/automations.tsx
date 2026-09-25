"use client";

import * as React from "react";
import { Play, Plus, Save, Trash2, Power, GitBranch, Zap, CircleDot, MousePointer2, RefreshCw, Users, Bell, Mail, Clock3, Tag, ArrowRight, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { can, type SessionUser } from "@/lib/rbac";

type NodeType = "trigger" | "condition" | "action";
type Node = { id: string; type: NodeType; x: number; y: number; data: Record<string, unknown> };
type Edge = { id: string; source: string; target: string; condition?: "true" | "false" };
type Workflow = { id: string; name: string; description?: string | null; trigger: string; nodes: Node[]; edges: Edge[]; isActive: boolean; version: number; lastRunAt?: string | null };
type Run = { id: string; workflowId: string; trigger: string; status: string; error?: string | null; startedAt: string; completedAt?: string | null; workflow?: { name: string } };
type Staff = { name: string; email: string; role: string };

const PALETTE = [
  { type: "trigger" as const, label: "Incoming Lead", icon: Zap, data: { trigger: "lead.created" } },
  { type: "trigger" as const, label: "Lead Status Changed", icon: GitBranch, data: { trigger: "lead.status_changed" } },
  { type: "trigger" as const, label: "Lead Assigned", icon: Users, data: { trigger: "lead.assigned" } },
  { type: "trigger" as const, label: "Incoming Webhook", icon: Zap, data: { trigger: "webhook.received" } },
  { type: "condition" as const, label: "Check Condition", icon: CircleDot, data: { field: "leadScore", operator: "greater_than", value: "70" } },
  { type: "action" as const, label: "Round-Robin Assign", icon: Users, data: { action: "assign_round_robin" } },
  { type: "action" as const, label: "Assign Staff", icon: Users, data: { action: "assign_staff", value: "" } },
  { type: "action" as const, label: "Set Lead Status", icon: ArrowRight, data: { action: "set_status", value: "IN_PROGRESS" } },
  { type: "action" as const, label: "Add Tag", icon: Tag, data: { action: "add_tag", value: "hot-lead" } },
  { type: "action" as const, label: "Create Follow-up", icon: Clock3, data: { action: "create_followup", minutes: 1440, type: "call", value: "Workflow follow-up" } },
  { type: "action" as const, label: "Notify Team", icon: Bell, data: { action: "notify", title: "Automation matched", message: "A lead matched an automation." } },
  { type: "action" as const, label: "Webhook", icon: Zap, data: { action: "webhook", url: "", secret: "" } },
  { type: "action" as const, label: "Send Email", icon: Mail, data: { action: "send_email", subject: "Thanks for contacting Climbix", body: "Thanks for reaching out. Our team will contact you shortly." } },
];

const triggerLabels: Record<string, string> = { "lead.created": "Incoming lead", "lead.status_changed": "Lead status changed", "lead.assigned": "Lead assigned", "webhook.received": "Incoming webhook" };

function newNode(item: typeof PALETTE[number], x: number, y: number): Node {
  return { id: `${item.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type: item.type, x, y, data: { ...item.data, label: item.label } };
}

export function AdminAutomations({ user }: { user: SessionUser }) {
  const [workflows, setWorkflows] = React.useState<Workflow[]>([]);
  const [runs, setRuns] = React.useState<Run[]>([]);
  const [staff, setStaff] = React.useState<Staff[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [nodes, setNodes] = React.useState<Node[]>([]);
  const [edges, setEdges] = React.useState<Edge[]>([]);
  const [name, setName] = React.useState("New Lead Assignment Workflow");
  const [description, setDescription] = React.useState("Automatically qualify, assign and follow up with new leads.");
  const [trigger, setTrigger] = React.useState("lead.created");
  const [active, setActive] = React.useState(true);
  const [selectedNode, setSelectedNode] = React.useState<string | null>(null);
  const [connectFrom, setConnectFrom] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [dragging, setDragging] = React.useState<string | null>(null);
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const selected = nodes.find(n => n.id === selectedNode) ?? null;
  const canManage = can(user.permissions, "automation.manage");

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/workflows", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setWorkflows(data.workflows ?? []); setRuns(data.runs ?? []); setStaff(data.staff ?? []);
      if (!selectedId && data.workflows?.[0]) selectWorkflow(data.workflows[0]);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [selectedId]);

  React.useEffect(() => { load(); }, [load]);
  React.useEffect(() => {
    if (!canManage) return;
    const timer = window.setInterval(async () => {
      try { const r = await fetch("/api/workflows/runs?limit=30", { cache: "no-store" }); const d = await r.json(); setRuns(d.runs ?? []); } catch {}
    }, 4000);
    return () => clearInterval(timer);
  }, [canManage]);

  function selectWorkflow(w: Workflow) {
    setSelectedId(w.id); setName(w.name); setDescription(w.description ?? ""); setTrigger(w.trigger); setNodes(w.nodes ?? []); setEdges(w.edges ?? []); setActive(w.isActive); setSelectedNode(null); setConnectFrom(null);
  }

  function createBlank() {
    setSelectedId(null); setName("New Lead Assignment Workflow"); setDescription("Automatically qualify, assign and follow up with new leads."); setTrigger("lead.created"); setActive(true);
    const a = newNode(PALETTE[0], 70, 80); const b = newNode(PALETTE[3], 360, 80); const c = newNode(PALETTE[4], 690, 80);
    setNodes([a,b,c]); setEdges([{ id: `e-${Date.now()}-1`, source: a.id, target: b.id }, { id: `e-${Date.now()}-2`, source: b.id, target: c.id, condition: "true" }]); setSelectedNode(a.id);
  }

  function dropPalette(e: React.DragEvent) {
    e.preventDefault(); const raw = e.dataTransfer.getData("application/climbix-node"); if (!raw) return;
    const item = PALETTE.find(x => `${x.type}:${x.label}` === raw); if (!item) return;
    const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return;
    const node = newNode(item, Math.max(20, e.clientX - rect.left - 100), Math.max(20, e.clientY - rect.top - 45));
    setNodes(prev => [...prev, node]); setSelectedNode(node.id);
    if (node.type === "trigger") setTrigger(String(node.data.trigger));
  }

  function startNodeDrag(e: React.PointerEvent, id: string) {
    if ((e.target as HTMLElement).closest("button, input, textarea, [role=combobox]")) return;
    e.preventDefault(); setDragging(id);
    const startX = e.clientX, startY = e.clientY, node = nodes.find(n => n.id === id); if (!node) return;
    const onMove = (ev: PointerEvent) => setNodes(prev => prev.map(n => n.id === id ? { ...n, x: Math.max(10, node.x + ev.clientX - startX), y: Math.max(10, node.y + ev.clientY - startY) } : n));
    const onUp = () => { setDragging(null); window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
    window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp);
  }

  function clickNode(id: string) {
    if (connectFrom && connectFrom !== id) {
      const sourceNode = nodes.find(n => n.id === connectFrom);
      const existing = edges.filter(e => e.source === connectFrom);
      const condition = sourceNode?.type === "condition" ? (existing.length === 0 ? "true" : "false") : undefined;
      setEdges(prev => [...prev, { id: `e-${Date.now()}`, source: connectFrom, target: id, ...(condition ? { condition } : {}) }]);
      setConnectFrom(null); return;
    }
    setSelectedNode(id);
  }

  function removeNode(id: string) { setNodes(prev => prev.filter(n => n.id !== id)); setEdges(prev => prev.filter(e => e.source !== id && e.target !== id)); if (selectedNode === id) setSelectedNode(null); }
  function updateSelected(data: Record<string, unknown>) { if (!selectedNode) return; setNodes(prev => prev.map(n => n.id === selectedNode ? { ...n, data: { ...n.data, ...data } } : n)); if (data.trigger) setTrigger(String(data.trigger)); }

  async function save() {
    if (!canManage) return; setSaving(true);
    try {
      const method = selectedId ? "PATCH" : "POST"; const url = selectedId ? `/api/workflows/${selectedId}` : "/api/workflows";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description, trigger, nodes, edges, isActive: active }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error ?? "Save failed");
      const w = data.workflow as Workflow; setSelectedId(w.id); await load(); selectWorkflow(w);
    } catch (e) { alert(e instanceof Error ? e.message : "Save failed"); } finally { setSaving(false); }
  }

  async function toggle(w: Workflow) { await fetch(`/api/workflows/${w.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !w.isActive }) }); await load(); }
  async function duplicate(w: Workflow) { const r = await fetch(`/api/workflows/${w.id}/duplicate`, { method: "POST" }); if (!r.ok) return; const d = await r.json(); await load(); if (d.workflow) selectWorkflow(d.workflow); }
  async function remove() { if (!selectedId || !confirm("Delete this automation and its run history?")) return; await fetch(`/api/workflows/${selectedId}`, { method: "DELETE" }); setSelectedId(null); await load(); createBlank(); }

  async function testWorkflow() {
    if (!selectedId) return alert("Save the workflow first.");
    const leadId = prompt("Enter a Lead ID to run this automation against:"); if (!leadId) return;
    const res = await fetch(`/api/workflows/${selectedId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId }) });
    const data = await res.json(); if (!res.ok) alert(data.error ?? "Test failed"); else { alert("Workflow test completed. Check Run History."); const r = await fetch("/api/workflows/runs?limit=30"); setRuns((await r.json()).runs ?? []); }
  }

  const lines = edges.map(edge => { const a = nodes.find(n => n.id === edge.source), b = nodes.find(n => n.id === edge.target); if (!a || !b) return null; return { ...edge, x1: a.x+200, y1:a.y+46, x2:b.x, y2:b.y+46 }; }).filter(Boolean) as Array<Edge & {x1:number;y1:number;x2:number;y2:number}>;

  if (loading) return <div className="p-8 text-sm text-muted-foreground">Loading automation engine…</div>;
  return <div className="space-y-5 max-w-[1500px]">
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <div><h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Workflow Automations</h1><p className="text-sm text-muted-foreground mt-1">Build event-driven lead workflows. Changes execute immediately when the event occurs.</p></div>
      <div className="flex gap-2 flex-wrap"><Button variant="outline" onClick={createBlank}><Plus className="size-4 mr-2"/>New Workflow</Button>{selectedId && <Button variant="outline" onClick={testWorkflow}><Play className="size-4 mr-2"/>Test on Lead</Button>} {selectedId && <Button variant="destructive" onClick={remove}><Trash2 className="size-4 mr-2"/>Delete</Button>}<Button onClick={save} disabled={!canManage || saving}><Save className="size-4 mr-2"/>{saving?"Saving…":"Save Workflow"}</Button></div>
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(600px,1fr)_310px] gap-4">
      <Card><CardHeader><CardTitle className="text-base">Blocks</CardTitle></CardHeader><CardContent className="space-y-2">{PALETTE.map(item => { const I=item.icon; return <div key={`${item.type}:${item.label}`} draggable onDragStart={e=>e.dataTransfer.setData("application/climbix-node",`${item.type}:${item.label}`)} className="flex items-center gap-2 p-3 rounded-lg border bg-background hover:border-brand-400 cursor-grab active:cursor-grabbing text-sm"><I className="size-4 text-brand-600"/><span>{item.label}</span><GripVertical className="size-4 ml-auto text-muted-foreground"/></div> })}<div className="text-xs text-muted-foreground pt-3">Drag blocks onto the canvas. Click <b>Connect</b>, then click another block to create a branch.</div></CardContent></Card>
      <Card className="overflow-hidden"><CardHeader className="border-b"><div className="flex flex-col md:flex-row gap-3 md:items-center"><Input value={name} onChange={e=>setName(e.target.value)} className="font-semibold"/><div className="flex items-center gap-2"><Badge variant={active?"default":"secondary"}>{active?"LIVE":"PAUSED"}</Badge><Button size="sm" variant="outline" onClick={()=>setActive(v=>!v)}><Power className="size-4 mr-1"/>{active?"Pause":"Activate"}</Button></div></div><Textarea value={description} onChange={e=>setDescription(e.target.value)} className="mt-2" rows={2}/></CardHeader><CardContent className="p-0"><div ref={canvasRef} onDragOver={e=>e.preventDefault()} onDrop={dropPalette} className="relative min-h-[650px] overflow-auto bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted-foreground)/.14)_1px,transparent_0)] [background-size:22px_22px]" style={{backgroundColor:"hsl(var(--muted)/.18)"}}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{minWidth:1000,minHeight:650}}>{lines.map(l=><g key={l.id}><line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="currentColor" strokeWidth="2" className="text-brand-500"/><circle cx={l.x2} cy={l.y2} r="4" fill="currentColor" className="text-brand-500"/></g>)}</svg>
        {nodes.length===0 && <div className="absolute inset-0 flex items-center justify-center text-center text-muted-foreground"><div><MousePointer2 className="size-8 mx-auto mb-2"/><p>Drag your first trigger here</p></div></div>}
        {nodes.map(n=>{const item=PALETTE.find(p=>p.type===n.type && ((n.type==="trigger" && p.data.trigger===n.data.trigger)||(n.type==="condition" )||(n.type==="action" && p.data.action===n.data.action))) ?? PALETTE.find(p=>p.type===n.type); const I=item?.icon ?? CircleDot; return <div key={n.id} onPointerDown={e=>startNodeDrag(e,n.id)} onClick={()=>clickNode(n.id)} style={{left:n.x,top:n.y}} className={cn("absolute w-[200px] rounded-xl border bg-background shadow-sm select-none", selectedNode===n.id?"ring-2 ring-brand-500 border-brand-400":"", dragging===n.id?"opacity-80 cursor-grabbing":"cursor-grab")}><div className="px-3 py-2 border-b flex items-center gap-2"><I className="size-4 text-brand-600"/><span className="text-xs font-semibold uppercase tracking-wide">{n.type}</span><button className="ml-auto text-muted-foreground hover:text-destructive" onClick={e=>{e.stopPropagation();removeNode(n.id)}}><X className="size-3"/></button></div><div className="p-3 text-sm font-medium">{item?.label ?? n.type}</div>{n.type==="condition"&&<div className="px-3 pb-3 text-xs text-muted-foreground">{String(n.data.field)} {String(n.data.operator)} {String(n.data.value)}</div>}{n.type==="action"&&<div className="px-3 pb-3 text-xs text-muted-foreground">{String(n.data.action).replaceAll("_"," ")}</div>}<div className="px-3 pb-2 flex justify-end"><Button size="sm" variant={connectFrom===n.id?"default":"outline"} onClick={e=>{e.stopPropagation();setConnectFrom(connectFrom===n.id?null:n.id)}}>{connectFrom===n.id?"Click target…":"Connect"}</Button></div></div>})}
      </div></CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Inspector</CardTitle></CardHeader><CardContent className="space-y-4">{!selected?<p className="text-sm text-muted-foreground">Select a block to configure it.</p>:<><div><Label>Block</Label><div className="mt-1 text-sm font-medium">{selected.type}</div></div>{selected.type==="trigger"&&<div><Label>Event</Label><Select value={String(selected.data.trigger ?? trigger)} onValueChange={v=>updateSelected({trigger:v})}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="lead.created">Incoming lead</SelectItem><SelectItem value="lead.status_changed">Lead status changed</SelectItem><SelectItem value="lead.assigned">Lead assigned</SelectItem><SelectItem value="webhook.received">Incoming webhook</SelectItem></SelectContent></Select></div>}{selected.type==="condition"&&<><div><Label>Lead field</Label><Select value={String(selected.data.field ?? "leadScore")} onValueChange={v=>updateSelected({field:v})}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{["leadScore","leadTier","status","source","service","country","company","assignedTo","tags"].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div><div><Label>Operator</Label><Select value={String(selected.data.operator ?? "equals")} onValueChange={v=>updateSelected({operator:v})}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{["equals","not_equals","contains","starts_with","greater_than","less_than","exists"].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div><div><Label>Value</Label><Input className="mt-1" value={String(selected.data.value ?? "")} onChange={e=>updateSelected({value:e.target.value})}/></div><div className="space-y-2"><Label>Branches</Label>{edges.filter(e=>e.source===selected.id).map((e,i)=><div key={e.id} className="flex items-center gap-2"><span className="text-xs truncate flex-1">→ {nodes.find(n=>n.id===e.target)?.data?.label ? String(nodes.find(n=>n.id===e.target)?.data?.label) : nodes.find(n=>n.id===e.target)?.type ?? "target"}</span><Select value={e.condition ?? "true"} onValueChange={v=>setEdges(prev=>prev.map(x=>x.id===e.id?{...x,condition:v as "true"|"false"}:x))}><SelectTrigger className="w-24 h-8"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="true">TRUE</SelectItem><SelectItem value="false">FALSE</SelectItem></SelectContent></Select><button className="text-muted-foreground hover:text-destructive" onClick={()=>setEdges(prev=>prev.filter(x=>x.id!==e.id))}><X className="size-3"/></button></div>)}<p className="text-xs text-muted-foreground">Connect two outgoing paths, then mark them TRUE/FALSE.</p></div></>}{selected.type==="action"&&<><div><Label>Action</Label><Select value={String(selected.data.action ?? "assign_round_robin")} onValueChange={v=>updateSelected({action:v})}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{[["assign_round_robin","Round-robin assign"],["assign_staff","Assign specific staff"],["set_status","Set status"],["add_tag","Add tag"],["create_followup","Create follow-up"],["notify","Notify team"],["webhook","Webhook"],["send_email","Send email"]].map(([v,l])=><SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div>{String(selected.data.action)==="assign_staff"&&<div><Label>Staff member</Label><Select value={String(selected.data.value ?? "")} onValueChange={v=>updateSelected({value:v})}><SelectTrigger className="mt-1"><SelectValue placeholder="Choose staff"/></SelectTrigger><SelectContent>{staff.map(s=><SelectItem key={s.email} value={s.email}>{s.name} — {s.email}</SelectItem>)}</SelectContent></Select></div>}{["set_status","add_tag"].includes(String(selected.data.action))&&<div><Label>Value</Label><Input className="mt-1" value={String(selected.data.value ?? "")} onChange={e=>updateSelected({value:e.target.value})}/>{String(selected.data.action)==="set_status"&&<div className="text-xs text-muted-foreground mt-1">Use NEW, IN_PROGRESS, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, CONVERTED, LOST, FOLLOW_UP or CLOSED.</div>}</div>}{selected.data.action==="create_followup"&&<><div><Label>Minutes from now</Label><Input type="number" min="5" value={String(selected.data.minutes ?? 1440)} onChange={e=>updateSelected({minutes:Number(e.target.value)})}/></div><div><Label>Follow-up type</Label><Select value={String(selected.data.type ?? "call")} onValueChange={v=>updateSelected({type:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{["call","whatsapp","email","meeting","sms","other"].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div></>}{selected.data.action==="notify"&&<><div><Label>Title</Label><Input className="mt-1" value={String(selected.data.title ?? "")} onChange={e=>updateSelected({title:e.target.value})}/></div><div><Label>Message</Label><Textarea className="mt-1" value={String(selected.data.message ?? "")} onChange={e=>updateSelected({message:e.target.value})}/></div></>}{selected.data.action==="webhook"&&<><div><Label>Webhook URL</Label><Input className="mt-1" placeholder="https://example.com/webhook" value={String(selected.data.url ?? "")} onChange={e=>updateSelected({url:e.target.value})}/></div><div><Label>Signing secret (optional)</Label><Input className="mt-1" type="password" value={String(selected.data.secret ?? "")} onChange={e=>updateSelected({secret:e.target.value})}/></div></>}{selected.data.action==="send_email"&&<><div><Label>Subject</Label><Input className="mt-1" value={String(selected.data.subject ?? "")} onChange={e=>updateSelected({subject:e.target.value})}/></div><div><Label>Body</Label><Textarea className="mt-1" rows={6} value={String(selected.data.body ?? "")} onChange={e=>updateSelected({body:e.target.value})}/></div></>}</>}</>}</CardContent></Card>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4"><Card><CardHeader><div className="flex items-center justify-between"><CardTitle className="text-base">Automations</CardTitle><Button size="sm" variant="ghost" onClick={load}><RefreshCw className="size-4"/></Button></div></CardHeader><CardContent className="space-y-2">{workflows.map(w=><button key={w.id} onClick={()=>selectWorkflow(w)} className={cn("w-full text-left p-3 rounded-lg border hover:border-brand-400",selectedId===w.id&&"border-brand-500 bg-brand-50/40")}><div className="flex items-center gap-2"><span className="font-medium">{w.name}</span><Badge variant={w.isActive?"default":"secondary"}>{w.isActive?"Live":"Paused"}</Badge><span className="ml-auto text-xs text-muted-foreground">v{w.version}</span></div><div className="text-xs text-muted-foreground mt-1">{triggerLabels[w.trigger] ?? w.trigger} · {w.nodes.length} blocks · {w.lastRunAt?`last run ${new Date(w.lastRunAt).toLocaleString()}`:"never run"}</div><div className="flex gap-3 mt-2"><span onClick={e=>{e.stopPropagation();toggle(w)}} className="inline-flex text-xs text-brand-600">{w.isActive?"Pause":"Activate"}</span><span onClick={e=>{e.stopPropagation();duplicate(w)}} className="inline-flex text-xs text-muted-foreground">Duplicate</span></div></button>)}{!workflows.length&&<p className="text-sm text-muted-foreground">No saved workflows yet.</p>}</CardContent></Card><Card><CardHeader><CardTitle className="text-base">Live Run History</CardTitle></CardHeader><CardContent><div className="space-y-2 max-h-72 overflow-auto">{runs.map(r=><div key={r.id} className="flex items-center gap-2 text-sm border-b pb-2"><Badge variant={r.status==="completed"?"default":r.status==="failed"?"destructive":"secondary"}>{r.status}</Badge><span className="truncate">{r.workflow?.name ?? r.workflowId}</span><span className="ml-auto text-xs text-muted-foreground">{new Date(r.startedAt).toLocaleTimeString()}</span></div>)}{!runs.length&&<p className="text-sm text-muted-foreground">No runs yet. New leads will appear here in real time.</p>}</div></CardContent></Card></div>
  </div>;
}

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db-alias";
import { isResponse, logActivity, requirePermission } from "@/lib/auth";
import { validateWorkflow } from "@/lib/workflow-engine";
export const runtime = "nodejs";
const parse=(v:string)=>{try{return JSON.parse(v)}catch{return []}};
export async function POST(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 const session=await requirePermission(req,"automation.manage"); if(isResponse(session)) return session;
 const {id}=await params; const source=await prisma.workflow.findUnique({where:{id}});
 if(!source) return NextResponse.json({error:"Workflow not found"},{status:404});
 const nodes=parse(source.nodes), edges=parse(source.edges); const validation=validateWorkflow(nodes,edges,source.trigger);
 if(!validation.valid) return NextResponse.json({error:"Source workflow is invalid",details:validation.errors},{status:400});
 const copy=await prisma.workflow.create({data:{name:`${source.name} (Copy)`,description:source.description,trigger:source.trigger,nodes:source.nodes,edges:source.edges,isActive:false,createdBy:session.user.id,webhookSecret:source.trigger==="webhook.received"?crypto.randomBytes(32).toString("hex"):null}});
 await logActivity({userId:session.user.id,userName:session.user.name,action:"workflow.duplicate",module:"automation",details:`Duplicated workflow ${source.name}`});
 const {webhookSecret,...safe}=copy; return NextResponse.json({workflow:{...safe,nodes,edges},webhookSecret:webhookSecret??null},{status:201});
}

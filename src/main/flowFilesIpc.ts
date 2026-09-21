import { ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';
import { ensureFlowsDir, getFlowsDir } from './flowsDirectory';
import { slugify, uniqueSlug } from './slug';
import { FLOWS_CHANNELS } from '../shared/flowsApi';
import type { FlowChartFile, FlowNode, FlowEdge, FlowSummary } from '../shared/flowTypes';

const SAFE_SLUG_PATTERN = /^[a-z0-9-]+$/;

function flowFilePath(slug: string): string {
  if (!SAFE_SLUG_PATTERN.test(slug)) {
    throw new Error(`Invalid flow slug: "${slug}"`);
  }
  return path.join(getFlowsDir(), `${slug}.json`);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function normalizeNode(node: Partial<FlowNode> & { id: string; position: { x: number; y: number } }): FlowNode {
  return {
    ...node,
    type: 'text',
    data: { text: '', ...(node.data as Record<string, unknown> | undefined) },
  } as FlowNode;
}

function normalizeEdge(edge: Partial<FlowEdge> & { id: string; source: string; target: string }): FlowEdge {
  return {
    ...edge,
    type: 'floating',
    data: { label: '', ...(edge.data as Record<string, unknown> | undefined) },
  } as FlowEdge;
}

async function readFlow(slug: string): Promise<FlowChartFile> {
  const raw = await fs.readFile(flowFilePath(slug), 'utf-8');
  const parsed = JSON.parse(raw) as Partial<FlowChartFile>;
  return {
    name: parsed.name ?? slug,
    published: parsed.published ?? false,
    body: parsed.body ?? '',
    nodes: (parsed.nodes ?? []).map(normalizeNode),
    edges: (parsed.edges ?? []).map(normalizeEdge),
  };
}

export function registerFlowFilesIpc(): void {
  ipcMain.handle(FLOWS_CHANNELS.list, async (): Promise<FlowSummary[]> => {
    const dir = await ensureFlowsDir();
    const entries = await fs.readdir(dir);
    const summaries: FlowSummary[] = [];

    for (const entry of entries) {
      if (!entry.endsWith('.json')) continue;
      const slug = entry.slice(0, -'.json'.length);
      try {
        const flow = await readFlow(slug);
        summaries.push({ slug, name: flow.name });
      } catch (error) {
        console.warn(`Skipping unreadable flow file "${entry}":`, error);
      }
    }

    summaries.sort((a, b) => a.name.localeCompare(b.name));
    return summaries;
  });

  ipcMain.handle(FLOWS_CHANNELS.read, async (_event, slug: string): Promise<FlowChartFile> => {
    return readFlow(slug);
  });

  ipcMain.handle(FLOWS_CHANNELS.save, async (_event, slug: string, flow: FlowChartFile): Promise<void> => {
    await ensureFlowsDir();
    await fs.writeFile(flowFilePath(slug), JSON.stringify(flow, null, 2), 'utf-8');
  });

  ipcMain.handle(FLOWS_CHANNELS.create, async (_event, name: string): Promise<FlowSummary> => {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Flow chart name must not be empty.');
    }

    await ensureFlowsDir();
    const base = slugify(trimmed);
    const slug = await uniqueSlug(base, (candidate) => fileExists(flowFilePath(candidate)));

    const flow: FlowChartFile = { name: trimmed, published: false, body: '', nodes: [], edges: [] };
    await fs.writeFile(flowFilePath(slug), JSON.stringify(flow, null, 2), 'utf-8');

    return { slug, name: trimmed };
  });
}

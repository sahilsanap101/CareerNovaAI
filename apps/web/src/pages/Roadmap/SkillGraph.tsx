import { useMemo } from 'react';
import ReactFlow, { Background, Controls, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { GitFork, Network } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

export function SkillGraph() {
  const nodes: Node[] = useMemo(
    () => [
      // Web Tree
      { id: 'html', position: { x: 50, y: 50 }, data: { label: 'HTML (Foundation)' }, style: { background: '#eff6ff', border: '2px solid #3b82f6', borderRadius: '12px', fontWeight: 'bold' } },
      { id: 'css', position: { x: 250, y: 50 }, data: { label: 'CSS (Styling)' }, style: { background: '#eff6ff', border: '2px solid #3b82f6', borderRadius: '12px', fontWeight: 'bold' } },
      { id: 'js', position: { x: 450, y: 50 }, data: { label: 'JavaScript (Logic)' }, style: { background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '12px', fontWeight: 'bold' } },
      { id: 'ts', position: { x: 650, y: 50 }, data: { label: 'TypeScript (Types)' }, style: { background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '12px', fontWeight: 'bold' } },
      { id: 'react', position: { x: 850, y: 50 }, data: { label: 'React (UI)' }, style: { background: '#faf5ff', border: '2px solid #a855f7', borderRadius: '12px', fontWeight: 'bold' } },

      // Backend & DB Tree
      { id: 'nodejs', position: { x: 450, y: 200 }, data: { label: 'Node.js (Runtime)' }, style: { background: '#f0fdf4', border: '2px solid #22c55e', borderRadius: '12px', fontWeight: 'bold' } },
      { id: 'express', position: { x: 650, y: 200 }, data: { label: 'Express (APIs)' }, style: { background: '#f0fdf4', border: '2px solid #22c55e', borderRadius: '12px', fontWeight: 'bold' } },
      { id: 'postgres', position: { x: 850, y: 200 }, data: { label: 'PostgreSQL (Database)' }, style: { background: '#f0fdf4', border: '2px solid #22c55e', borderRadius: '12px', fontWeight: 'bold' } },

      // Cloud & DevOps Tree
      { id: 'linux', position: { x: 50, y: 350 }, data: { label: 'Linux (OS)' }, style: { background: '#fff1f2', border: '2px solid #f43f5e', borderRadius: '12px', fontWeight: 'bold' } },
      { id: 'docker', position: { x: 250, y: 350 }, data: { label: 'Docker (Containers)' }, style: { background: '#fff1f2', border: '2px solid #f43f5e', borderRadius: '12px', fontWeight: 'bold' } },
      { id: 'k8s', position: { x: 450, y: 350 }, data: { label: 'Kubernetes (Orchestration)' }, style: { background: '#fff1f2', border: '2px solid #f43f5e', borderRadius: '12px', fontWeight: 'bold' } },
      { id: 'aws', position: { x: 650, y: 350 }, data: { label: 'AWS Cloud' }, style: { background: '#fff1f2', border: '2px solid #f43f5e', borderRadius: '12px', fontWeight: 'bold' } },
    ],
    [],
  );

  const edges: Edge[] = useMemo(
    () => [
      { id: 'e-html-css', source: 'html', target: 'css', animated: true },
      { id: 'e-css-js', source: 'css', target: 'js', animated: true },
      { id: 'e-js-ts', source: 'js', target: 'ts', animated: true },
      { id: 'e-ts-react', source: 'ts', target: 'react', animated: true },
      { id: 'e-js-nodejs', source: 'js', target: 'nodejs', animated: true },
      { id: 'e-nodejs-express', source: 'nodejs', target: 'express', animated: true },
      { id: 'e-express-postgres', source: 'express', target: 'postgres', animated: true },
      { id: 'e-linux-docker', source: 'linux', target: 'docker', animated: true },
      { id: 'e-docker-k8s', source: 'docker', target: 'k8s', animated: true },
      { id: 'e-k8s-aws', source: 'k8s', target: 'aws', animated: true },
    ],
    [],
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <Breadcrumb />

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <GitFork className="h-6 w-6 text-primary-500" />
          Interactive Skill Dependency Graph
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Visual prerequisite relationships ensuring skills are learned in the correct order.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Skill Tree Visualizer</CardTitle>
          <CardDescription>Drag and zoom nodes to explore prerequisite dependency paths</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900">
            <ReactFlow nodes={nodes} edges={edges} fitView>
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

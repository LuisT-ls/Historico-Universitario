import dagre from 'dagre'
import type { MindMapEdge, MindMapNode } from '@/types'

const NODE_WIDTH  = 180
const NODE_HEIGHT = 60

/**
 * Aplica layout automático direcional usando Dagre.
 * direction: 'LR' (esquerda→direita) | 'TB' (cima→baixo)
 *
 * Retorna novos arrays de nós e arestas com posições calculadas.
 * Os nós recebem posição centrada (Dagre usa o centro do nó).
 */
export function getLayoutedElements(
    nodes: MindMapNode[],
    edges: MindMapEdge[],
    direction: 'LR' | 'TB' = 'LR'
): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
    if (nodes.length === 0) return { nodes, edges }

    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 120 })

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
    })

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target)
    })

    dagre.layout(dagreGraph)

    const layoutedNodes: MindMapNode[] = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id)
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - NODE_WIDTH  / 2,
                y: nodeWithPosition.y - NODE_HEIGHT / 2,
            },
        }
    })

    return { nodes: layoutedNodes, edges }
}

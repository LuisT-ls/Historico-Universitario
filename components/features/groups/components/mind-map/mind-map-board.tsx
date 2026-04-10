'use client'

import { useCallback, useMemo, useRef } from 'react'
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    useReactFlow,
    ReactFlowProvider,
    type NodeTypes,
    type XYPosition,
    type OnConnectEnd,
    type FinalConnectionState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useMindMap } from '@/components/features/groups/hooks/use-mind-map'
import { MindMapNodeComponent } from './mind-map-node'
import { MindMapToolbar } from './mind-map-toolbar'
import { MindMapEmptyState } from './mind-map-empty-state'
import { MindMapContext } from './mind-map-context'
import { Loader2 } from 'lucide-react'
import type { MindMapNodeData } from '@/types'

// NodeTypes estático fora do componente — evita re-registros a cada render.
// O cast é necessário porque `memo()` retorna `MemoExoticComponent` e o React Flow
// espera `ComponentType`, que são estruturalmente equivalentes mas não idênticos para o TS.
const nodeTypes: NodeTypes = {
    mindMapNode: MindMapNodeComponent as unknown as NodeTypes[string],
}

interface MindMapBoardProps {
    groupId: string
    currentUserId: string
}

// Componente interno — precisa estar dentro do ReactFlowProvider para usar useReactFlow
function MindMapCanvas({ groupId, currentUserId }: MindMapBoardProps) {
    const {
        nodes,
        edges,
        isLoading,
        isSaving,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        addNodeFromDrop,
        addChildNode,
        addSiblingNode,
        duplicateNode,
        deleteNode,
        updateNodeData,
        clearAll,
    } = useMindMap({ groupId, currentUserId })

    const { zoomIn, zoomOut, fitView, screenToFlowPosition } = useReactFlow()
    const containerRef = useRef<HTMLDivElement>(null)

    // Fornece callbacks para os nós via Context (evita prop drilling pelo nodeTypes)
    const contextValue = useMemo(
        () => ({ updateNodeData, deleteNode, addChildNode, addSiblingNode, duplicateNode }),
        [updateNodeData, deleteNode, addChildNode, addSiblingNode, duplicateNode]
    )

    // Adiciona um nó no centro visível do canvas com leve offset aleatório
    const handleAddNode = useCallback(() => {
        const container = containerRef.current
        if (!container) { addNode({ x: 200, y: 200 }); return }

        const rect = container.getBoundingClientRect()
        const position: XYPosition = {
            x: rect.width / 2 - 60 + (Math.random() - 0.5) * 80,
            y: rect.height / 2 - 20 + (Math.random() - 0.5) * 80,
        }
        addNode(position)
    }, [addNode])

    // Soltar a linha de conexão no canvas vazio cria um novo nó conectado
    const onConnectEnd: OnConnectEnd = useCallback((event, connectionState: FinalConnectionState) => {
        // Só age se a conexão foi solta no canvas (sem nó de destino)
        if (connectionState.toNode !== null) return
        // Precisa ter um nó de origem válido
        const sourceId = connectionState.fromNode?.id
        if (!sourceId) return

        // Extrai coordenadas de tela (suporte a touch e mouse)
        let clientX: number
        let clientY: number
        if ('touches' in event || 'changedTouches' in event) {
            const touch = (event as TouchEvent).changedTouches?.[0]
            if (!touch) return
            clientX = touch.clientX
            clientY = touch.clientY
        } else {
            clientX = (event as MouseEvent).clientX
            clientY = (event as MouseEvent).clientY
        }

        // Converte coordenadas de tela para coordenadas do canvas (respeitando zoom e pan)
        const position = screenToFlowPosition({ x: clientX, y: clientY })
        addNodeFromDrop(sourceId, position)
    }, [screenToFlowPosition, addNodeFromDrop])

    // Duplo-clique no canvas vazio cria um nó naquela posição
    const handleCanvasDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement
        if (target.closest('.react-flow__node')) return

        const container = containerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()
        const position: XYPosition = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        }
        addNode(position)
    }, [addNode])

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[500px]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">
                        Carregando mapa mental...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <MindMapContext.Provider value={contextValue}>
            <div
                ref={containerRef}
                className="relative w-full rounded-[2rem] border border-border/50 overflow-hidden bg-[#fafafa] dark:bg-slate-950"
                style={{ height: 'calc(100vh - 380px)', minHeight: '500px' }}
                onDoubleClick={handleCanvasDoubleClick}
            >
                <MindMapToolbar
                    isSaving={isSaving}
                    hasNodes={nodes.length > 0}
                    onAddNode={handleAddNode}
                    onClearAll={clearAll}
                    onZoomIn={() => zoomIn({ duration: 300 })}
                    onZoomOut={() => zoomOut({ duration: 300 })}
                    onFitView={() => fitView({ duration: 400, padding: 0.2 })}
                />

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onConnectEnd={onConnectEnd}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.3 }}
                    deleteKeyCode="Delete"
                    multiSelectionKeyCode="Shift"
                    className="!bg-transparent"
                    proOptions={{ hideAttribution: true }}
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={20}
                        size={1.2}
                        color="hsl(var(--border))"
                        className="opacity-60"
                    />

                    {nodes.length > 3 && (
                        <MiniMap
                            nodeColor={(node) => {
                                const data = node.data as MindMapNodeData
                                return data.color ?? 'hsl(var(--primary) / 0.3)'
                            }}
                            className="!bg-white/80 dark:!bg-slate-900/80 !border !border-border/60 !rounded-2xl overflow-hidden"
                            maskColor="hsl(var(--background) / 0.6)"
                            zoomable
                            pannable
                        />
                    )}

                    <Controls
                        className="!bg-white/80 dark:!bg-slate-900/80 !border !border-border/60 !rounded-2xl overflow-hidden !shadow-md"
                        showInteractive={false}
                    />
                </ReactFlow>

                {nodes.length === 0 && (
                    <MindMapEmptyState onAddFirstNode={handleAddNode} />
                )}
            </div>
        </MindMapContext.Provider>
    )
}

// Wrapper público — envolve com ReactFlowProvider obrigatório
export function MindMapBoard({ groupId, currentUserId }: MindMapBoardProps) {
    return (
        <ReactFlowProvider>
            <MindMapCanvas groupId={groupId} currentUserId={currentUserId} />
        </ReactFlowProvider>
    )
}

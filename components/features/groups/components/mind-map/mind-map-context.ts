import { createContext } from 'react'
import type { MindMapNodeData } from '@/types'
import type { XYPosition } from '@xyflow/react'

interface MindMapContextValue {
    // Single-node operations
    updateNodeData: (nodeId: string, data: Partial<MindMapNodeData>) => void
    deleteNode: (nodeId: string) => void
    addChildNode: (sourceId: string, sourcePosition: XYPosition) => void
    addSiblingNode: (sourcePosition: XYPosition) => void
    duplicateNode: (sourcePosition: XYPosition, data: MindMapNodeData) => void
    convertToTask: (label: string) => Promise<void>
    openAttachModal: (nodeId: string, currentAttachments: MindMapNodeData['attachments']) => void
    // Bulk operations (multi-seleção)
    deleteNodes: (nodeIds: string[]) => void
    updateNodesData: (nodeIds: string[], data: Partial<MindMapNodeData>) => void
    getSelectedIds: () => string[]
}

export const MindMapContext = createContext<MindMapContextValue>({
    updateNodeData:  () => {},
    deleteNode:      () => {},
    addChildNode:    () => {},
    addSiblingNode:  () => {},
    duplicateNode:   () => {},
    convertToTask:   async () => {},
    openAttachModal: () => {},
    deleteNodes:     () => {},
    updateNodesData: () => {},
    getSelectedIds:  () => [],
})

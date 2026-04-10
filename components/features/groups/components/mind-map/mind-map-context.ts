import { createContext } from 'react'
import type { MindMapNodeData } from '@/types'

interface MindMapContextValue {
    updateNodeData: (nodeId: string, data: Partial<MindMapNodeData>) => void
}

export const MindMapContext = createContext<MindMapContextValue>({
    updateNodeData: () => {},
})

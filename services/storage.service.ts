import { getStorageLazy } from '@/lib/firebase/config'
import { ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage'
import { logger } from '@/lib/logger'

/**
 * Serviço de Storage para operações de upload e download de arquivos
 */

/**
 * Faz upload de um arquivo para o Firebase Storage
 * @param file - Arquivo a ser enviado
 * @param path - Caminho no storage (ex: 'certificados/user123/arquivo.pdf')
 * @returns URL de download do arquivo
 */
export async function uploadFile(file: File, path: string): Promise<string> {
    try {
        const storage = await getStorageLazy()
        if (!storage) throw new Error('Storage não inicializado')

        const storageRef = ref(storage, path)
        const snapshot = await uploadBytes(storageRef, file)
        const downloadURL = await getDownloadURL(snapshot.ref)

        logger.info('Arquivo enviado com sucesso', { path, downloadURL })
        return downloadURL
    } catch (error) {
        logger.error('Erro ao enviar arquivo:', error)
        throw error
    }
}

/**
 * Remove um arquivo do Firebase Storage
 * @param path - Caminho do arquivo no storage
 */
export async function deleteFile(path: string): Promise<void> {
    try {
        const storage = await getStorageLazy()
        if (!storage) throw new Error('Storage não inicializado')

        const storageRef = ref(storage, path)
        await deleteObject(storageRef)

        logger.info('Arquivo removido com sucesso', { path })
    } catch (error) {
        logger.error('Erro ao remover arquivo:', error)
        throw error
    }
}

/**
 * Obtém a URL de download de um arquivo
 * @param path - Caminho do arquivo no storage
 * @returns URL de download
 */
export async function getFileDownloadURL(path: string): Promise<string> {
    try {
        const storage = await getStorageLazy()
        if (!storage) throw new Error('Storage não inicializado')

        const storageRef = ref(storage, path)
        const downloadURL = await getDownloadURL(storageRef)

        return downloadURL
    } catch (error) {
        logger.error('Erro ao obter URL de download:', error)
        throw error
    }
}

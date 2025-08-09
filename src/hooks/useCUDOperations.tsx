import { useCallback } from 'react'

import { useError } from '@/contexts/ErrorProvider'
import { api } from '@/lib/api'

const useCUDOperations = <PostType, PatchType, ReturnType = void> (
	entityPath: string
): {
	createEntity: (data: PostType) => void
	updateEntity: (id: string, data: PatchType) => void
	deleteEntity: (id: string, confirm: boolean) => void
	createEntityAsync: (data: PostType) => Promise<ReturnType>
	updateEntityAsync: (id: string, data: PatchType) => Promise<ReturnType>
} => {
	const { addError } = useError()

	const createEntity = useCallback((data: PostType) => {
		api.post(entityPath, data).catch(addError)
	}, [entityPath, addError])

	const createEntityAsync = useCallback(async (data: PostType) => {
		const response = await api.post<ReturnType>(entityPath, data)
		return response.data
	}, [entityPath])

	const updateEntity = useCallback((id: string, data: PatchType) => {
		const url = id ? `${entityPath}/${id}` : entityPath
		api.patch(url, data).catch(addError)
	}, [entityPath, addError])

	const updateEntityAsync = useCallback(async (id: string, data: PatchType) => {
		const url = id ? `${entityPath}/${id}` : entityPath
		const response = await api.patch<ReturnType>(url, data)
		return response.data
	}, [entityPath])

	const deleteEntity = useCallback((id: string, confirm: boolean) => {
		api.delete(`${entityPath}/${id}`, {
			data: { confirm }
		}).catch(addError)
	}, [entityPath, addError])

	return {
		createEntity,
		updateEntity,
		deleteEntity,
		createEntityAsync,
		updateEntityAsync
	}
}

export default useCUDOperations

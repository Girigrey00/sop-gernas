
import { LibraryDocument, SopResponse } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000'; // Default local backend

// Helper to handle API errors
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
    }
    return response.json();
};

export const apiService = {
    // Check backend health
    checkHealth: async (): Promise<boolean> => {
        try {
            const res = await fetch(`${API_BASE_URL}/health`);
            return res.ok;
        } catch (e) {
            console.error("Backend health check failed", e);
            return false;
        }
    },

    // List all documents
    getDocuments: async (): Promise<LibraryDocument[]> => {
        const data = await handleResponse(await fetch(`${API_BASE_URL}/documents?limit=100`));
        
        // Map backend response to frontend LibraryDocument interface
        return data.map((doc: any) => ({
            id: doc._id || doc.id,
            sopName: doc.product_id || doc.file_name, // Fallback if product_id not in list view
            documentName: doc.file_name,
            description: doc.summary || 'No description available',
            pageCount: doc.page_count || 0,
            uploadedBy: doc.uploaded_by || 'Unknown',
            uploadedDate: doc.start_time ? new Date(doc.start_time).toLocaleDateString() : new Date().toLocaleDateString(),
            indexName: doc.index_name,
            status: doc.status,
            version: '1.0',
            // Store metadata needed for flow retrieval
            metadata: {
                linkedApp: 'ProcessHub', // Default/Assumed for now if missing
                productId: doc.product_id
            }
        }));
    },

    // Upload a new document
    uploadDocument: async (file: File, metadata: any): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);
        
        // Ensure strictly required metadata for flow generation exists
        const metaPayload = {
            category: 'SOP',
            Linked_App: metadata.linkedApp || 'ProcessHub', 
            product_id: metadata.productId || file.name, // Use filename as product ID if missing
            generate_flow: true, // Trigger flow gen logic if supported by ingestion
            ...metadata
        };
        
        formData.append('metadata', JSON.stringify(metaPayload));

        return handleResponse(await fetch(`${API_BASE_URL}/ingest`, {
            method: 'POST',
            body: formData,
        }));
    },

    // Delete a document
    deleteDocument: async (docId: string): Promise<any> => {
        return handleResponse(await fetch(`${API_BASE_URL}/documents/${docId}`, {
            method: 'DELETE',
        }));
    },

    // Trigger Flow Generation (Explicitly)
    // Note: The backend usually requires a blob_url, but if we just uploaded, 
    // we might not have the direct blob URL handy in the list unless returned.
    // For MVP, we assume ingestion with 'generate_flow': true prepares it, 
    // or we use this endpoint if we have the URL.
    generateProcess: async (fileUrl: string, metadata: any): Promise<any> => {
        const formData = new FormData();
        formData.append('file_url', fileUrl);
        formData.append('metadata', JSON.stringify(metadata));
        
        return handleResponse(await fetch(`${API_BASE_URL}/generate-process`, {
            method: 'POST',
            body: formData,
        }));
    },

    // Retrieve the generated Process Flow JSON
    getProcessFlow: async (linkedApp: string, productId: string): Promise<SopResponse> => {
        const params = new URLSearchParams({
            linked_app: linkedApp,
            product_id: productId
        });
        
        const data = await handleResponse(await fetch(`${API_BASE_URL}/process-flow?${params.toString()}`));
        return data as SopResponse;
    }
};

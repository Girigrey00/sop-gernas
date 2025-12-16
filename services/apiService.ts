
import { LibraryDocument, SopResponse } from '../types';

const API_BASE_URL = '/api'; // Use proxy defined in vite.config.ts

// Azure SAS Configuration
const AZURE_CONTAINER_URL = 'https://auranpunawlsa.blob.core.windows.net/cbg-knowledge-hub';
const AZURE_SAS_TOKEN = '?sp=rawl&st=2025-11-28T17:25:15Z&se=2026-03-31T01:40:15Z&spr=https&sv=2024-11-04&sr=c&sig=YE9KebhPjaR8a4lsQXgIBWOxIx2tQg2x%2FpeFOmTGpNY%3D';

// Helper to handle API errors
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
    }
    return response.json();
};

// Helper to upload to Azure Blob Storage
const uploadToAzureBlob = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const url = `${AZURE_CONTAINER_URL}/${fileName}${AZURE_SAS_TOKEN}`;

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'x-ms-blob-type': 'BlockBlob',
            'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
    });

    if (!response.ok) {
        throw new Error(`Azure Upload Failed: ${response.statusText}`);
    }

    // Return the clean URL without the SAS token for the backend to use
    return `${AZURE_CONTAINER_URL}/${fileName}`;
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
            sopName: doc.product_id || doc.file_name,
            documentName: doc.file_name,
            description: doc.summary || 'No description available',
            pageCount: doc.page_count || 0,
            uploadedBy: doc.uploaded_by || 'Unknown',
            uploadedDate: doc.start_time ? new Date(doc.start_time).toLocaleDateString() : new Date().toLocaleDateString(),
            indexName: doc.index_name,
            status: doc.status,
            version: '1.0',
            metadata: {
                linkedApp: 'ProcessHub',
                productId: doc.product_id,
                category: doc.category
            }
        }));
    },

    // Upload a new document (Azure Direct -> Backend Notify)
    uploadDocument: async (file: File, metadata: any): Promise<any> => {
        try {
            // 1. Upload to Azure Blob Storage
            const fileUrl = await uploadToAzureBlob(file);

            // 2. Notify Backend to Process/Ingest
            // We use generate-process as the entry point since we have a file_url now.
            // We pass generate_flow in metadata to control if it generates a flow or just ingests (if supported).
            const metaPayload = {
                category: 'SOP',
                Linked_App: metadata.linkedApp || 'ProcessHub', 
                product_id: metadata.productId || file.name, 
                generate_flow: metadata.generate_flow ?? true,
                ...metadata
            };

            const formData = new FormData();
            formData.append('file_url', fileUrl);
            formData.append('metadata', JSON.stringify(metaPayload));

            // Use generate-process endpoint as it accepts file_url
            return handleResponse(await fetch(`${API_BASE_URL}/generate-process`, {
                method: 'POST',
                body: formData,
            }));

        } catch (error) {
            console.error("Upload sequence failed", error);
            throw error;
        }
    },

    // Delete a document
    deleteDocument: async (docId: string): Promise<any> => {
        return handleResponse(await fetch(`${API_BASE_URL}/documents/${docId}`, {
            method: 'DELETE',
        }));
    },

    // Generate Process (Explicit call if needed)
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
        // If productId is a UUID (like ccaf1e1e...), use the direct path
        // Otherwise use query parameters
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
        
        let url = '';
        if (isUuid) {
            url = `${API_BASE_URL}/process-flow/${productId}`;
        } else {
            const params = new URLSearchParams({
                linked_app: linkedApp,
                product_id: productId
            });
            url = `${API_BASE_URL}/process-flow?${params.toString()}`;
        }
        
        const data = await handleResponse(await fetch(url));
        return data as SopResponse;
    }
};

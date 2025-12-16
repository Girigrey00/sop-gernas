
import { LibraryDocument, SopResponse } from '../types';

// CHANGED: Use relative path to leverage Vite Proxy configured in vite.config.ts
// This resolves CORS issues by routing requests through the local dev server
const API_BASE_URL = '/api';

// Container SAS URL for direct upload
const AZURE_SAS_URL = "https://auranpunawlsa.blob.core.windows.net/cbg-knowledge-hub?sp=rawl&st=2025-11-28T17:25:15Z&se=2026-03-31T01:40:15Z&spr=https&sv=2024-11-04&sr=c&sig=YE9KebhPjaR8a4lsQXgIBWOxIx2tQg2x%2FpeFOmTGpNY%3D";

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
                productId: doc.product_id,
                category: doc.category
            }
        }));
    },

    // Upload to Azure Blob Storage using SAS Token
    uploadToAzure: async (file: File): Promise<string> => {
        const sasUrl = new URL(AZURE_SAS_URL);
        const fileName = encodeURIComponent(file.name);
        
        // 1. Construct the Real URL (this is what the backend needs to know)
        // Format: https://host/container/filename?sas
        const realBlobUrl = `${sasUrl.origin}${sasUrl.pathname}/${fileName}${sasUrl.search}`;

        // 2. Construct the Proxy URL (this is what the browser uses to upload to bypass CORS)
        // Format: /azure-blob/container/filename?sas
        // We strip the origin and replace it with our proxy prefix defined in vite.config.ts
        const proxyUploadUrl = `/azure-blob${sasUrl.pathname}/${fileName}${sasUrl.search}`;
        
        console.log("Uploading to Proxy URL:", proxyUploadUrl);

        // We PUT the file to the PROXY URL
        const response = await fetch(proxyUploadUrl, {
            method: 'PUT',
            headers: {
                'x-ms-blob-type': 'BlockBlob',
                'Content-Type': file.type || 'application/octet-stream' // Important for Azure
            },
            body: file
        });

        if (!response.ok) {
            throw new Error(`Azure Upload Failed: ${response.statusText}`);
        }

        // Return the REAL URL to the backend, not the proxy URL
        return realBlobUrl;
    },

    // Upload Document: 1. Upload to Azure, 2. Call Ingest API
    uploadDocument: async (file: File, metadata: any): Promise<any> => {
        try {
            // 1. Upload to Azure Blob
            console.log("Starting Azure Upload...");
            const blobUrl = await apiService.uploadToAzure(file);
            console.log("Azure Upload Success. Real Blob URL:", blobUrl);

            // 2. Prepare Ingest Payload
            const payload = {
                blob_url: blobUrl,
                metadata: {
                    category: metadata.category || "Policy",
                    Root_Folder: metadata.Root_Folder || "PIL",
                    Linked_App: metadata.Linked_App || "cbgknowledgehub",
                    is_financial: "false",
                    target_index: "cbgknowledgehub",
                    generate_flow: metadata.generate_flow ? "true" : "false",
                    ...metadata // Overrides if provided
                }
            };

            // 3. Call Ingest API
            console.log("Calling Ingest API with payload:", payload);
            return handleResponse(await fetch(`${API_BASE_URL}/ingest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
            }));

        } catch (error) {
            console.error("Full Upload Process Failed:", error);
            throw error;
        }
    },

    // Delete a document
    deleteDocument: async (docId: string): Promise<any> => {
        return handleResponse(await fetch(`${API_BASE_URL}/documents/${docId}`, {
            method: 'DELETE',
        }));
    },

    // Retrieve the generated Process Flow JSON
    // Updated to use the direct ID endpoint as requested: /api/process-flow/:id
    getProcessFlow: async (linkedApp: string, productId: string): Promise<SopResponse> => {
        // We use productId directly as the ID path parameter
        const url = `${API_BASE_URL}/process-flow/${productId}`;
        console.log("Fetching Flow from:", url);
        const data = await handleResponse(await fetch(url));
        return data as SopResponse;
    }
};

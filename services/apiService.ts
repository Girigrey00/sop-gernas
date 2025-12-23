import { LibraryDocument, SopResponse, Product } from '../types';

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

// Stream Parser Class to handle "JSON inside Stream"
class JsonStreamParser {
    private buffer = '';
    private isJson = false;
    private hasCheckJson = false;
    private inAnswer = false;
    private isEscaped = false;
    private answerDone = false;
    
    constructor(
        private onToken: (text: string) => void,
        private onCitations: (citations: any) => void
    ) {}

    process(chunk: string) {
        // Initial Check: Is this a JSON stream?
        if (!this.hasCheckJson) {
            this.buffer += chunk;
            // Need enough chars to detect '{"answer":' or similar
            if (this.buffer.length > 20) {
                 if (this.buffer.trim().startsWith('{')) {
                     this.isJson = true;
                 }
                 this.hasCheckJson = true;
            } else {
                return; // Wait for more data
            }
        }

        if (this.isJson) {
            this.processJsonStream(chunk);
        } else {
            // Text Stream (Legacy / Raw)
            this.onToken(chunk);
        }
    }

    private processJsonStream(chunk: string) {
        // Simple state machine to extract "answer" value and "citations" object
        
        const fullBuffer = this.buffer + chunk;
        this.buffer = fullBuffer;

        // 1. Find Answer Start
        if (!this.inAnswer) {
            const answerMatch = this.buffer.indexOf('"answer":');
            if (answerMatch !== -1) {
                // Look for the opening quote of the value
                const startQuote = this.buffer.indexOf('"', answerMatch + 9);
                if (startQuote !== -1) {
                    this.inAnswer = true;
                    // Process the part after the quote
                    const remainder = this.buffer.substring(startQuote + 1);
                    this.buffer = remainder; // Reset buffer to just the content
                }
            }
        }

        if (this.inAnswer && !this.answerDone) {
            // We are streaming the answer string.
            // Look for closing quote, watching for escapes.
            let emitStr = '';
            let i = 0;
            
            for (; i < this.buffer.length; i++) {
                const char = this.buffer[i];
                
                if (this.isEscaped) {
                    emitStr += char;
                    this.isEscaped = false;
                    continue;
                }

                if (char === '\\') {
                    this.isEscaped = true;
                    // Don't emit backslash yet, wait to see what it escapes
                    continue;
                }

                if (char === '"') {
                    // End of answer
                    this.answerDone = true;
                    break;
                }

                // Handle standard JSON escapes
                emitStr += char;
            }

            if (emitStr) {
                // Convert JSON escapes to real characters for display
                const cleanText = emitStr
                    .replace(/\\n/g, '\n')
                    .replace(/\\t/g, '\t')
                    .replace(/\\"/g, '"');
                
                this.onToken(cleanText);
            }

            // Remove processed part from buffer
            this.buffer = this.buffer.substring(i + (this.answerDone ? 1 : 0));
        }

        // 2. Look for Citations after answer
        if (this.answerDone) {
             const citMatch = this.buffer.indexOf('"citations":');
             if (citMatch !== -1) {
                 const braceStart = this.buffer.indexOf('{', citMatch);
                 if (braceStart !== -1) {
                     // We have started the citations object.
                 }
             }
        }
    }
    
    // Called when stream ends
    finish() {
        // Try to find citations in the remaining buffer
        try {
            // Find last occurrence of citations object
            const match = this.buffer.match(/"citations":\s*({[\s\S]*?})/);
            if (match && match[1]) {
                let jsonStr = match[1];
                const lastBrace = jsonStr.lastIndexOf('}');
                if (lastBrace !== -1) {
                    jsonStr = jsonStr.substring(0, lastBrace + 1);
                    const citations = JSON.parse(jsonStr);
                    this.onCitations(citations);
                }
            }
        } catch (e) {
            console.warn("Could not parse final citations", e);
        }
    }
}

export const apiService = {

  // --- Document Management ---

  getDocuments: async (): Promise<LibraryDocument[]> => {
    try {
        // Add timestamp to prevent caching
        const data = await handleResponse(await fetch(`${API_BASE_URL}/documents?t=${Date.now()}`));
        return data.map((doc: any) => ({
            ...doc,
            id: doc.id || doc._id,
            progressPercentage: doc.progressPercentage || 100,
            status: doc.status || 'Completed'
        }));
    } catch (error) {
        console.error("Fetch Documents Error:", error);
        return [];
    }
  },

  deleteDocument: async (docId: string, indexName: string) => {
    return handleResponse(await fetch(`${API_BASE_URL}/delete-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: docId, index_name: indexName })
    }));
  },

  // --- Products ---

  getProducts: async (): Promise<Product[]> => {
    try {
        const data = await handleResponse(await fetch(`${API_BASE_URL}/products?t=${Date.now()}`));
        return data;
    } catch (error) {
        console.error("Fetch Products Error", error);
        return [];
    }
  },

  createProduct: async (payload: { product_name: string, folder_name: string, product_description: string }) => {
    return handleResponse(await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }));
  },

  deleteProduct: async (productName: string) => {
    return handleResponse(await fetch(`${API_BASE_URL}/products/${productName}`, {
        method: 'DELETE'
    }));
  },

  // --- Ingestion Flow ---

  /**
   * 1. Uploads file directly to Azure Blob Storage using SAS Token
   * 2. Returns the Blob URL
   */
  uploadToAzure: async (file: File, folder: string): Promise<string> => {
    const cleanFileName = file.name.replace(/\s+/g, '_');
    // Construct the URL with the specific folder path
    // SAS URL Structure: https://<account>.blob.core.windows.net/<container>?<sas_token>
    // We need to insert the folder/filename before the query string
    const baseUrl = AZURE_SAS_URL.split('?')[0];
    const sasToken = AZURE_SAS_URL.split('?')[1];
    
    // e.g. https://.../cbg-knowledge-hub/PIL_Folder/myfile.pdf
    const blobUrl = `${baseUrl}/${folder}/${cleanFileName}`;
    const uploadUrl = `${blobUrl}?${sasToken}`;

    // STRICT UPLOAD: No Simulation Fallback
    // We expect the SAS token to be valid. 
    // If it fails (403/404/500), we throw the error so the UI can handle it properly.
    const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
            "x-ms-blob-type": "BlockBlob",
            "Content-Type": file.type,
        },
        body: file
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Azure Upload Error Details:", errorText);
        throw new Error(`Azure Upload Failed: ${response.status} ${response.statusText}`);
    }

    return blobUrl; 
  },

  uploadDocument: async (file: File, metadata: any) => {
    try {
        // 1. Upload to Azure
        const folderName = metadata.Root_Folder || 'Unassigned';
        const blobUrl = await apiService.uploadToAzure(file, folderName);
        
        // 2. Trigger Ingestion Backend
        const payload = {
            file_name: file.name,
            file_url: blobUrl,
            file_type: file.type || 'application/pdf',
            ...metadata
        };

        return handleResponse(await fetch(`${API_BASE_URL}/ingest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }));

    } catch (error) {
        console.error("Full Upload Process Failed:", error);
        throw error;
    }
  },

  // --- Process Flow (SOP) ---

  getProcessFlow: async (productName: string): Promise<SopResponse | null> => {
      try {
          const res = await fetch(`${API_BASE_URL}/process-flow/${productName}`);
          if (!res.ok) {
              if (res.status === 404) return null; // No flow yet
              throw new Error("Failed to fetch flow");
          }
          return res.json();
      } catch (error) {
          console.error("Get Process Flow Error", error);
          return null;
      }
  },

  // --- Chat Inference (Streaming) ---
  
  chatInference: async (params: {
      question: string,
      index_name: string,
      session_id: string,
      question_id: string,
      product: string,
      onToken: (token: string) => void,
      onComplete: (citations: any) => void,
      onError: (msg: string) => void
  }) => {
      try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: params.question,
                index_name: params.index_name,
                session_id: params.session_id,
                question_id: params.question_id,
                product: params.product
            })
        });

        if (!response.ok) {
            throw new Error(`Chat API Error: ${response.statusText}`);
        }

        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        const parser = new JsonStreamParser(params.onToken, params.onComplete);

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            parser.process(chunk);
        }
        
        parser.finish();
        // Fallback: If parser didn't trigger complete (maybe no citations), trigger it now
        // We pass undefined for citations if not found
        params.onComplete(undefined);

      } catch (error: any) {
          console.error("Chat Inference Error", error);
          params.onError(error.message || "Unknown error");
      }
  }
};
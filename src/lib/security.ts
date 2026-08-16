export const APP_SERVICE_FEE = 100;

export const ALLOWED_FILE_TYPES = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export function validateFileUpload(file: { size: number; type: string }) {
    if (!ALLOWED_FILE_TYPES.has(file.type)) {
        return { valid: false, error: 'Unsupported file type.' };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        return { valid: false, error: 'File exceeds 5MB limit.' };
    }

    return { valid: true };
}

export function buildAuditEntry(action: string, entityType: string, metadata: Record<string, unknown>) {
    return {
        action,
        entityType,
        metadata,
        createdAt: new Date().toISOString()
    };
}

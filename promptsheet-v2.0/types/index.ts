export interface LibraryItem {
    id: string;
    title: string;
    description: string;
    content: string;
    createdAt: number;
    lastAccessedAt: number;
    pinned: boolean;
}

export interface Draft {
    id: string;
    title: string;
    description: string;
    content: string;
    updatedAt: number;
}

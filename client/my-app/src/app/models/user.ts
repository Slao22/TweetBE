import { UserVerifyStatus } from "@/types/enum";

export interface User {
    _id?: string;
    name: string;
    email: string;
    date_of_birth: string; // ISO date string (e.g. "2025-11-05T00:00:00Z")
    created_at?: string;
    updated_at?: string;
    verify?: UserVerifyStatus;
    tweet_circle?: string[]; // array of user IDs
    bio?: string;
    location?: string;
    website?: string;
    username?: string;
    avatar?: string;
    cover_photo?: string;
}

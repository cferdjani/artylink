export interface AccountProfileRecord {
    id: string;
    email: string | null;
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    age: number | null;
    phone: string | null;
    role: string | null;
    avatar_url: string | null;
    wilaya: string | null;
    commune: string | null;
    city: string | null;
}

export interface AccountArtisanRecord {
    id: string;
    bio: string | null;
    company_name: string | null;
    profession: string | null;
    specialties: string[] | null;
    wilaya: string | null;
    city: string | null;
    address: string | null;
    hourly_rate: number | null;
    currency: string | null;
    availability_status: string | null;
    years_of_experience: number | null;
}

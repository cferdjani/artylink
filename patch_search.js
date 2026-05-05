const fs = require('fs');

const func = `
export async function searchArtisans(params: {
    q?: string;
    wilaya?: string;
    commune?: string;
    category?: string;
    subcategory?: string;
    limit?: number;
    offset?: number;
}): Promise<{ artisans: MarketplaceArtisan[]; totalCount: number }> {
    try {
        const supabase = await createSupabaseServerClient();
        
        let query = supabase.from('artisans').select(
            'id, wilaya, city, is_verified, rating, review_count, profiles!inner(full_name,email,phone,avatar_url), artisan_categories!inner(is_primary,categories!inner(slug,name))',
            { count: 'exact' }
        );

        if (params.wilaya && params.wilaya !== 'toute-l-algerie') {
            query = query.ilike('wilaya', \`%\${params.wilaya.replace(/-/g, ' ')}%\`);
        }
        
        if (params.commune && params.commune !== 'toutes-communes') {
             query = query.ilike('city', \`%\${params.commune.replace(/-/g, ' ')}%\`);
        }
        
        if (params.category && params.category !== 'tous-services') {
             query = query.eq('artisan_categories.categories.slug', params.category);
        }

        // We apply a naive search on full_name if q exists
        if (params.q) {
            query = query.or(\`wilaya.ilike.%\${params.q}%,city.ilike.%\${params.q}%,profiles.full_name.ilike.%\${params.q}%\`);
        }

        query = query.order('is_verified', { ascending: false })
            .order('rating', { ascending: false });

        const limit = params.limit ?? 36;
        const offset = params.offset ?? 0;
        
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error || !data?.length) {
            console.log('Search DB error or empty:', error);
            const fallback = featuredArtisans.slice(0, limit);
            return { artisans: fallback, totalCount: fallback.length };
        }

        let mapped = (data as unknown as DbArtisanRow[]).map((row, index) => mapDbArtisan(row, index));
        return { artisans: mapped, totalCount: count ?? 0 };
    } catch (e) {
        console.error('searchArtisans exception', e);
        const fb = featuredArtisans.slice(0, params.limit ?? 36);
        return { artisans: fb, totalCount: fb.length };
    }
}
`;

let code = fs.readFileSync('src/lib/marketplace-server-data.ts', 'utf8');
code = code.replace('export async function getArtisanById', func + '\nexport async function getArtisanById');
fs.writeFileSync('src/lib/marketplace-server-data.ts', code);

import { ProductWithPrice } from '@/types';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const getActiveProductsWithPrices = async (): Promise<ProductWithPrice[]> => {
  const cookiesStore = await cookies();
  const supabase = createServerComponentClient({
    cookies:() => cookiesStore,
  });

  const { data, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { foreignTable: 'prices' });

  if (error) {
    console.log(error);
  }

  return (data as any) || [];
};

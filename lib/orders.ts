import { supabase } from '@/lib/supabase'

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')

  if (error) {
    console.error('Supabase orders error:', error)
    return []
  }

  return data
}
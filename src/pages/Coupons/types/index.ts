export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_amount?: number;
  maximum_discount?: number;
  usage_limit?: number;
  usage_count: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CreateCouponInput {
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_amount?: number;
  maximum_discount?: number;
  usage_limit?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export interface UpdateCouponInput extends Partial<CreateCouponInput> {
  id: string;
}

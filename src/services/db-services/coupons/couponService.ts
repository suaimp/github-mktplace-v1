import { supabase } from "../../../lib/supabase";
import { Coupon, CreateCouponInput, UpdateCouponInput } from "../../../pages/Coupons/types";

/**
 * Get all coupons
 */
export async function getCoupons(): Promise<Coupon[]> {
  try {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching coupons:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getCoupons:", error);
    return [];
  }
}

/**
 * Get a single coupon by ID
 */
export async function getCouponById(id: string): Promise<Coupon | null> {
  try {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching coupon:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getCouponById:", error);
    return null;
  }
}

/**
 * Get a coupon by code
 */
export async function getCouponByCode(code: string): Promise<Coupon | null> {
  try {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .ilike("code", code)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching coupon by code:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getCouponByCode:", error);
    return null;
  }
}

/**
 * Create a new coupon
 */
export async function createCoupon(couponData: CreateCouponInput): Promise<Coupon | null> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("coupons")
      .insert({
        ...couponData,
        code: couponData.code.toUpperCase(), // Ensure code is uppercase
        created_by: user?.id,
        updated_by: user?.id
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating coupon:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in createCoupon:", error);
    return null;
  }
}

/**
 * Update an existing coupon
 */
export async function updateCoupon(couponData: UpdateCouponInput): Promise<Coupon | null> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    const { id, ...updateData } = couponData;
    
    const { data, error } = await supabase
      .from("coupons")
      .update({
        ...updateData,
        code: updateData.code ? updateData.code.toUpperCase() : undefined,
        updated_by: user?.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating coupon:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in updateCoupon:", error);
    return null;
  }
}

/**
 * Delete a coupon
 */
export async function deleteCoupon(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("coupons")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting coupon:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteCoupon:", error);
    return false;
  }
}

/**
 * Toggle coupon active status
 */
export async function toggleCouponStatus(id: string, isActive: boolean): Promise<boolean> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from("coupons")
      .update({
        is_active: isActive,
        updated_by: user?.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      console.error("Error toggling coupon status:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in toggleCouponStatus:", error);
    return false;
  }
}

/**
 * Validate coupon for use
 */
export async function validateCoupon(code: string, orderAmount: number): Promise<{
  valid: boolean;
  coupon?: Coupon;
  error?: string;
}> {
  try {
    const coupon = await getCouponByCode(code);
    
    if (!coupon) {
      return { valid: false, error: "Cupom não encontrado" };
    }
    
    if (!coupon.is_active) {
      return { valid: false, error: "Cupom inativo" };
    }
    
    // Check date range
    const now = new Date();
    const startDate = coupon.start_date ? new Date(coupon.start_date) : null;
    const endDate = coupon.end_date ? new Date(coupon.end_date) : null;
    if (startDate && startDate.getTime() > now.getTime()) {
      return { valid: false, error: "Cupom ainda não está ativo" };
    }
    if (endDate && endDate.getTime() < now.getTime()) {
      return { valid: false, error: "Cupom expirado" };
    }
    
    // Check minimum amount
    if (coupon.minimum_amount && orderAmount < coupon.minimum_amount) {
      return { 
        valid: false, 
        error: `Valor mínimo de R$ ${coupon.minimum_amount.toFixed(2)} não atingido` 
      };
    }
    
    // Check usage limit
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return { valid: false, error: "Limite de uso do cupom atingido" };
    }
    
    return { valid: true, coupon };
  } catch (error) {
    console.error("Error in validateCoupon:", error);
    return { valid: false, error: "Erro ao validar cupom" };
  }
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(coupon: Coupon, orderAmount: number): number {
  if (coupon.discount_type === "percentage") {
    const discount = (orderAmount * coupon.discount_value) / 100;
    // Apply maximum discount limit if set
    if (coupon.maximum_discount && discount > coupon.maximum_discount) {
      return coupon.maximum_discount;
    }
    return discount;
  } else {
    // Fixed discount
    return Math.min(coupon.discount_value, orderAmount);
  }
}

/**
 * Use coupon (increment usage count)
 */
export async function useCoupon(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('increment_coupon_usage', {
      coupon_id: id
    });

    if (error) {
      console.error("Error using coupon:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in useCoupon:", error);
    return false;
  }
}

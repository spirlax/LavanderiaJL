// src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: 'admin' | 'operator'
          phone: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: 'admin' | 'operator'
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: 'admin' | 'operator'
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          customer_type: 'registered' | 'name_only' | 'quick'
          full_name: string
          phone: string | null
          whatsapp_opt_in: boolean
          whatsapp_opt_in_at: string | null
          notes: string | null
          total_orders: number
          total_spent: number
          last_order_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_type?: 'registered' | 'name_only' | 'quick'
          full_name: string
          phone?: string | null
          whatsapp_opt_in?: boolean
          whatsapp_opt_in_at?: string | null
          notes?: string | null
          total_orders?: number
          total_spent?: number
          last_order_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_type?: 'registered' | 'name_only' | 'quick'
          full_name?: string
          phone?: string | null
          whatsapp_opt_in?: boolean
          whatsapp_opt_in_at?: string | null
          notes?: string | null
          total_orders?: number
          total_spent?: number
          last_order_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          service_type: 'wash_per_kg' | 'drying' | 'drying_spin' | 'ironing' | 'special_item'
          price_per_kg: number | null
          price_per_unit: number | null
          estimated_hours: number
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          service_type: 'wash_per_kg' | 'drying' | 'drying_spin' | 'ironing' | 'special_item'
          price_per_kg?: number | null
          price_per_unit?: number | null
          estimated_hours?: number
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          service_type?: 'wash_per_kg' | 'drying' | 'drying_spin' | 'ironing' | 'special_item'
          price_per_kg?: number | null
          price_per_unit?: number | null
          estimated_hours?: number
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string
          received_by: string
          status: 'received' | 'washing' | 'drying' | 'ironing' | 'ready' | 'delivered' | 'cancelled'
          total_weight_kg: number | null
          total: number
          payment_method: 'cash' | 'yape' | 'plin' | 'transfer'
          payment_reference: string | null
          notes: string | null
          talonario_number: string | null
          estimated_delivery: string | null
          delivered_at: string | null
          delivered_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          customer_id: string
          received_by: string
          status?: 'received' | 'washing' | 'drying' | 'ironing' | 'ready' | 'delivered' | 'cancelled'
          total_weight_kg?: number | null
          total?: number
          payment_method: 'cash' | 'yape' | 'plin' | 'transfer'
          payment_reference?: string | null
          notes?: string | null
          talonario_number?: string | null
          estimated_delivery?: string | null
          delivered_at?: string | null
          delivered_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string
          received_by?: string
          status?: 'received' | 'washing' | 'drying' | 'ironing' | 'ready' | 'delivered' | 'cancelled'
          total_weight_kg?: number | null
          total?: number
          payment_method?: 'cash' | 'yape' | 'plin' | 'transfer'
          payment_reference?: string | null
          notes?: string | null
          talonario_number?: string | null
          estimated_delivery?: string | null
          delivered_at?: string | null
          delivered_to?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          service_id: string
          description: string | null
          quantity: number
          weight_kg: number | null
          unit_price: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          service_id: string
          description?: string | null
          quantity?: number
          weight_kg?: number | null
          unit_price: number
          subtotal: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          service_id?: string
          description?: string | null
          quantity?: number
          weight_kg?: number | null
          unit_price?: number
          subtotal?: number
          created_at?: string
        }
      }
      order_status_history: {
        Row: {
          id: string
          order_id: string
          previous_status: 'received' | 'washing' | 'drying' | 'ironing' | 'ready' | 'delivered' | 'cancelled' | null
          new_status: 'received' | 'washing' | 'drying' | 'ironing' | 'ready' | 'delivered' | 'cancelled'
          changed_by: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          previous_status?: 'received' | 'washing' | 'drying' | 'ironing' | 'ready' | 'delivered' | 'cancelled' | null
          new_status: 'received' | 'washing' | 'drying' | 'ironing' | 'ready' | 'delivered' | 'cancelled'
          changed_by: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          previous_status?: 'received' | 'washing' | 'drying' | 'ironing' | 'ready' | 'delivered' | 'cancelled' | null
          new_status?: 'received' | 'washing' | 'drying' | 'ironing' | 'ready' | 'delivered' | 'cancelled'
          changed_by?: string
          notes?: string | null
          created_at?: string
        }
      }
      daily_cash_close: {
        Row: {
          id: string
          date: string
          total_orders: number
          total_cash: number
          total_yape: number
          total_plin: number
          total_transfer: number
          grand_total: number
          closed_by: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          date?: string
          total_orders?: number
          total_cash?: number
          total_yape?: number
          total_plin?: number
          total_transfer?: number
          grand_total?: number
          closed_by: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          total_orders?: number
          total_cash?: number
          total_yape?: number
          total_plin?: number
          total_transfer?: number
          grand_total?: number
          closed_by?: string
          notes?: string | null
          created_at?: string
        }
      }
      machines: {
        Row: {
          id: string
          name: string
          brand: string | null
          machine_type: 'washer' | 'dryer' | 'ironer' | 'other'
          capacity_kg: number | null
          status: 'working' | 'review' | 'repair' | 'out_of_service'
          status_note: string | null
          last_maintenance: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          brand?: string | null
          machine_type: 'washer' | 'dryer' | 'ironer' | 'other'
          capacity_kg?: number | null
          status?: 'working' | 'review' | 'repair' | 'out_of_service'
          status_note?: string | null
          last_maintenance?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: string | null
          machine_type?: 'washer' | 'dryer' | 'ironer' | 'other'
          capacity_kg?: number | null
          status?: 'working' | 'review' | 'repair' | 'out_of_service'
          status_note?: string | null
          last_maintenance?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      supplies: {
        Row: {
          id: string
          name: string
          unit: string
          current_stock: number
          min_stock: number
          cost_per_unit: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          unit: string
          current_stock?: number
          min_stock?: number
          cost_per_unit?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          unit?: string
          current_stock?: number
          min_stock?: number
          cost_per_unit?: number | null
          updated_at?: string
        }
      }
      business_config: {
        Row: {
          id: string
          business_name: string
          address: string
          phone: string | null
          currency: string
          logo_url: string | null
          order_prefix: string
          next_order_number: number
          schedule: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_name?: string
          address?: string
          phone?: string | null
          currency?: string
          logo_url?: string | null
          order_prefix?: string
          next_order_number?: number
          schedule?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string
          address?: string
          phone?: string | null
          currency?: string
          logo_url?: string | null
          order_prefix?: string
          next_order_number?: number
          schedule?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth_user_role: {
        Args: Record<PropertyKey, never>
        Returns: 'admin' | 'operator'
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_active_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'admin' | 'operator'
      order_status: 'received' | 'washing' | 'drying' | 'ironing' | 'ready' | 'delivered' | 'cancelled'
      payment_method: 'cash' | 'yape' | 'plin' | 'transfer'
      service_type: 'wash_per_kg' | 'drying' | 'drying_spin' | 'ironing' | 'special_item'
      customer_type: 'registered' | 'name_only' | 'quick'
      machine_status: 'working' | 'review' | 'repair' | 'out_of_service'
      machine_type: 'washer' | 'dryer' | 'ironer' | 'other'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

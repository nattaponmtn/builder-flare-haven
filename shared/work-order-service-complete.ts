/**
 * Complete Work Order Service
 * Comprehensive service for managing work orders with full database integration
 */

import { createTableService } from './supabase/database-service';
import type { DatabaseRecord } from './supabase/types';

export interface WorkOrder extends DatabaseRecord {
  id: string;
  work_type: string;
  title: string;
  description: string;
  status: string;
  priority: number;
  asset_id?: string;
  location_id?: string;
  system_id?: string;
  pm_template_id?: string;
  assigned_to_user_id?: string;
  requested_by_user_id?: string;
  created_at: string;
  scheduled_date?: string;
  completed_at?: string;
  wo_number: string;
  estimated_hours?: number;
  assigned_to?: string;
  requested_by?: string;
  total_cost?: number;
  labor_cost?: number;
  parts_cost?: number;
  actual_hours?: number;
  updated_at: string;
  company_id: string;
}

export interface WorkOrderTask extends DatabaseRecord {
  id: string;
  work_order_id: string;
  description: string;
  is_completed: boolean;
  actual_value_text?: string;
  actual_value_numeric?: number;
  completed_at?: string;
  is_critical: boolean;
  expected_input_type?: string;
  standard_text_expected?: string;
  standard_min_value?: number;
  standard_max_value?: number;
  step_number?: number;
}

export interface WorkOrderWithDetails extends WorkOrder {
  tasks: WorkOrderTask[];
  asset?: {
    id: string;
    serial_number: string;
    status: string;
  };
  location?: {
    id: string;
    name: string;
    address?: string;
  };
  system?: {
    id: string;
    name: string;
    description?: string;
  };
  assigned_user?: {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
    email: string;
  };
  requested_user?: {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
    email: string;
  };
}

export interface WorkOrderStatistics {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  by_priority: Record<number, number>;
  by_work_type: Record<string, number>;
  completion_rate: number;
  avg_completion_time: number;
  total_cost: number;
}

export interface CreateWorkOrderData {
  work_type: string;
  title: string;
  description: string;
  priority: number;
  asset_id?: string;
  location_id?: string;
  system_id?: string;
  pm_template_id?: string;
  assigned_to_user_id?: string;
  requested_by_user_id: string;
  scheduled_date?: string;
  estimated_hours?: number;
  company_id: string;
  tasks?: Omit<WorkOrderTask, 'id' | 'work_order_id'>[];
}

export interface UpdateWorkOrderData extends Partial<CreateWorkOrderData> {
  status?: string;
  completed_at?: string;
  actual_hours?: number;
  total_cost?: number;
  labor_cost?: number;
  parts_cost?: number;
}

export class WorkOrderService {
  private workOrdersService = createTableService('work_orders');
  private tasksService = createTableService('work_order_tasks');
  private assetsService = createTableService('assets');
  private locationsService = createTableService('locations');
  private systemsService = createTableService('systems');
  private userProfilesService = createTableService('user_profiles');

  /**
   * Generate unique work order number
   */
  async generateWorkOrderNumber(companyId: string): Promise<string> {
    try {
      const currentYear = new Date().getFullYear();
      const prefix = `WO${currentYear}-`;
      
      const result = await this.workOrdersService.getAll({
        filters: { company_id: companyId },
        orderBy: 'created_at',
        ascending: false,
        limit: 1
      });
      
      let number = 1;
      if (result.data && result.data.length > 0) {
        const lastWO = result.data[0] as WorkOrder;
        const lastNumber = lastWO.wo_number?.split('-')[1];
        if (lastNumber) {
          number = parseInt(lastNumber) + 1;
        }
      }
      
      return `${prefix}${number.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating WO number:', error);
      return `WO${new Date().getFullYear()}-0001`;
    }
  }

  /**
   * Create new work order with tasks
   */
  async createWorkOrder(data: CreateWorkOrderData): Promise<{ data: WorkOrder | null; error: any }> {
    try {
      // Generate WO number
      const wo_number = await this.generateWorkOrderNumber(data.company_id);
      
      // Prepare work order data
      const workOrderData = {
        ...data,
        wo_number,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Remove tasks from work order data
      const { tasks, ...woData } = workOrderData;

      // Create work order
      const result = await this.workOrdersService.create(woData);
      
      if (result.error || !result.data) {
        return { data: null, error: result.error };
      }

      const workOrder = result.data as WorkOrder;

      // Create tasks if provided
      if (tasks && tasks.length > 0) {
        for (let i = 0; i < tasks.length; i++) {
          await this.tasksService.create({
            work_order_id: workOrder.id,
            step_number: i + 1,
            ...tasks[i],
          });
        }
      }

      return { data: workOrder, error: null };
    } catch (error) {
      console.error('Error creating work order:', error);
      return { data: null, error };
    }
  }

  /**
   * Get work order with full details
   */
  async getWorkOrderWithDetails(id: string): Promise<{ data: WorkOrderWithDetails | null; error: any }> {
    try {
      // Get work order
      const woResult = await this.workOrdersService.getById(id);
      if (woResult.error || !woResult.data) {
        return { data: null, error: woResult.error };
      }

      const workOrder = woResult.data as WorkOrder;
      const details: WorkOrderWithDetails = { ...workOrder, tasks: [] };

      // Get tasks
      const tasksResult = await this.tasksService.getByField('work_order_id', id, {
        orderBy: 'step_number',
        ascending: true
      });
      if (tasksResult.data) {
        details.tasks = tasksResult.data as WorkOrderTask[];
      }

      // Get asset details
      if (workOrder.asset_id) {
        const assetResult = await this.assetsService.getById(workOrder.asset_id);
        if (assetResult.data) {
          details.asset = assetResult.data as any;
        }
      }

      // Get location details
      if (workOrder.location_id) {
        const locationResult = await this.locationsService.getById(workOrder.location_id);
        if (locationResult.data) {
          details.location = locationResult.data as any;
        }
      }

      // Get system details
      if (workOrder.system_id) {
        const systemResult = await this.systemsService.getById(workOrder.system_id);
        if (systemResult.data) {
          details.system = systemResult.data as any;
        }
      }

      // Get assigned user details
      if (workOrder.assigned_to_user_id) {
        const userResult = await this.userProfilesService.getByField('user_id', workOrder.assigned_to_user_id);
        if (userResult.data && userResult.data.length > 0) {
          details.assigned_user = userResult.data[0] as any;
        }
      }

      // Get requesting user details
      if (workOrder.requested_by_user_id) {
        const userResult = await this.userProfilesService.getByField('user_id', workOrder.requested_by_user_id);
        if (userResult.data && userResult.data.length > 0) {
          details.requested_user = userResult.data[0] as any;
        }
      }

      return { data: details, error: null };
    } catch (error) {
      console.error('Error getting work order details:', error);
      return { data: null, error };
    }
  }

  /**
   * Update work order
   */
  async updateWorkOrder(id: string, data: UpdateWorkOrderData): Promise<{ data: WorkOrder | null; error: any }> {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const result = await this.workOrdersService.update(id, updateData);
      return result;
    } catch (error) {
      console.error('Error updating work order:', error);
      return { data: null, error };
    }
  }

  /**
   * Update work order status
   */
  async updateWorkOrderStatus(id: string, status: string, comment?: string): Promise<{ data: WorkOrder | null; error: any }> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      // Set completion time if status is completed
      if (status === 'completed' || status === 'เสร็จสิ้น') {
        updateData.completed_at = new Date().toISOString();
      }

      const result = await this.workOrdersService.update(id, updateData);
      
      // TODO: Add status change log/history if needed
      if (comment) {
        // Could add to a work_order_history table
        console.log(`Status changed to ${status}: ${comment}`);
      }

      return result;
    } catch (error) {
      console.error('Error updating work order status:', error);
      return { data: null, error };
    }
  }

  /**
   * Complete work order task
   */
  async completeTask(
    taskId: string, 
    value: string | number | boolean, 
    inputType: string = 'text'
  ): Promise<{ data: WorkOrderTask | null; error: any }> {
    try {
      const updateData: any = {
        is_completed: true,
        completed_at: new Date().toISOString(),
      };

      // Set value based on input type
      if (inputType === 'number' || inputType === 'measurement') {
        updateData.actual_value_numeric = parseFloat(value as string) || 0;
        updateData.actual_value_text = String(value);
      } else if (inputType === 'checkbox') {
        updateData.actual_value_text = value ? 'ใช่' : 'ไม่ใช่';
      } else {
        updateData.actual_value_text = String(value);
      }

      const result = await this.tasksService.update(taskId, updateData);
      return result;
    } catch (error) {
      console.error('Error completing task:', error);
      return { data: null, error };
    }
  }

  /**
   * Uncomplete work order task
   */
  async uncompleteTask(taskId: string): Promise<{ data: WorkOrderTask | null; error: any }> {
    try {
      const updateData = {
        is_completed: false,
        completed_at: null,
        actual_value_text: '',
        actual_value_numeric: 0,
      };

      const result = await this.tasksService.update(taskId, updateData);
      return result;
    } catch (error) {
      console.error('Error uncompleting task:', error);
      return { data: null, error };
    }
  }

  /**
   * Get work orders for company with filtering and sorting
   */
  async getWorkOrders(
    companyId: string,
    filters?: {
      status?: string;
      priority?: number;
      work_type?: string;
      assigned_to_user_id?: string;
      asset_id?: string;
      search?: string;
    },
    sort?: {
      field: string;
      ascending: boolean;
    },
    pagination?: {
      limit: number;
      offset: number;
    }
  ): Promise<{ data: WorkOrder[] | null; error: any; count?: number }> {
    try {
      const queryFilters: any = { company_id: companyId };
      
      // Apply filters
      if (filters) {
        if (filters.status && filters.status !== 'all') {
          queryFilters.status = filters.status;
        }
        if (filters.priority) {
          queryFilters.priority = filters.priority;
        }
        if (filters.work_type && filters.work_type !== 'all') {
          queryFilters.work_type = filters.work_type;
        }
        if (filters.assigned_to_user_id) {
          queryFilters.assigned_to_user_id = filters.assigned_to_user_id;
        }
        if (filters.asset_id) {
          queryFilters.asset_id = filters.asset_id;
        }
      }

      const options: any = {
        filters: queryFilters,
      };

      // Apply sorting
      if (sort) {
        options.orderBy = sort.field;
        options.ascending = sort.ascending;
      } else {
        options.orderBy = 'created_at';
        options.ascending = false;
      }

      // Apply pagination
      if (pagination) {
        options.limit = pagination.limit;
        options.offset = pagination.offset;
      }

      const result = await this.workOrdersService.getAll(options);
      
      // If search is provided, filter in memory (could be improved with full-text search)
      if (result.data && filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        result.data = result.data.filter((wo: WorkOrder) =>
          wo.title.toLowerCase().includes(searchTerm) ||
          wo.description.toLowerCase().includes(searchTerm) ||
          wo.wo_number.toLowerCase().includes(searchTerm) ||
          wo.assigned_to?.toLowerCase().includes(searchTerm)
        );
      }

      return result;
    } catch (error) {
      console.error('Error getting work orders:', error);
      return { data: null, error };
    }
  }

  /**
   * Get work order statistics for company
   */
  async getWorkOrderStatistics(companyId: string): Promise<{ data: WorkOrderStatistics | null; error: any }> {
    try {
      const result = await this.workOrdersService.getAll({
        filters: { company_id: companyId }
      });

      if (result.error || !result.data) {
        return { data: null, error: result.error };
      }

      const workOrders = result.data as WorkOrder[];
      const stats: WorkOrderStatistics = {
        total: workOrders.length,
        pending: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
        overdue: 0,
        by_priority: { 1: 0, 2: 0, 3: 0, 4: 0 },
        by_work_type: {},
        completion_rate: 0,
        avg_completion_time: 0,
        total_cost: 0,
      };

      let totalCompletionTime = 0;
      let completedCount = 0;

      workOrders.forEach(wo => {
        // Count by status
        switch (wo.status.toLowerCase()) {
          case 'pending':
          case 'รอดำเนินการ':
            stats.pending++;
            break;
          case 'in_progress':
          case 'กำลังดำเนินการ':
            stats.in_progress++;
            break;
          case 'completed':
          case 'เสร็จสิ้น':
            stats.completed++;
            completedCount++;
            
            // Calculate completion time
            if (wo.created_at && wo.completed_at) {
              const completionTime = new Date(wo.completed_at).getTime() - new Date(wo.created_at).getTime();
              totalCompletionTime += completionTime;
            }
            break;
          case 'cancelled':
          case 'ยกเลิก':
            stats.cancelled++;
            break;
        }

        // Count overdue
        if (wo.scheduled_date && 
            new Date(wo.scheduled_date) < new Date() && 
            wo.status !== 'completed' && 
            wo.status !== 'เสร็จสิ้น') {
          stats.overdue++;
        }

        // Count by priority
        if (wo.priority >= 1 && wo.priority <= 4) {
          stats.by_priority[wo.priority]++;
        }

        // Count by work type
        if (wo.work_type) {
          stats.by_work_type[wo.work_type] = (stats.by_work_type[wo.work_type] || 0) + 1;
        }

        // Sum total cost
        if (wo.total_cost) {
          stats.total_cost += wo.total_cost;
        }
      });

      // Calculate completion rate
      stats.completion_rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

      // Calculate average completion time (in hours)
      stats.avg_completion_time = completedCount > 0 ? totalCompletionTime / completedCount / (1000 * 60 * 60) : 0;

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error getting work order statistics:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete work order and all related tasks
   */
  async deleteWorkOrder(id: string): Promise<{ error: any }> {
    try {
      // Delete all tasks first
      const tasksResult = await this.tasksService.getByField('work_order_id', id);
      if (tasksResult.data) {
        for (const task of tasksResult.data) {
          await this.tasksService.delete((task as any).id);
        }
      }

      // Delete work order
      const result = await this.workOrdersService.delete(id);
      return { error: result.error };
    } catch (error) {
      console.error('Error deleting work order:', error);
      return { error };
    }
  }

  /**
   * Get recent work orders for dashboard
   */
  async getRecentWorkOrders(companyId: string, limit: number = 5): Promise<{ data: WorkOrder[] | null; error: any }> {
    try {
      const result = await this.workOrdersService.getAll({
        filters: { company_id: companyId },
        orderBy: 'created_at',
        ascending: false,
        limit: limit
      });

      return result;
    } catch (error) {
      console.error('Error getting recent work orders:', error);
      return { data: null, error };
    }
  }

  /**
   * Get overdue work orders
   */
  async getOverdueWorkOrders(companyId: string): Promise<{ data: WorkOrder[] | null; error: any }> {
    try {
      const result = await this.workOrdersService.getAll({
        filters: { company_id: companyId }
      });

      if (result.error || !result.data) {
        return { data: null, error: result.error };
      }

      const overdueWorkOrders = (result.data as WorkOrder[]).filter(wo =>
        wo.scheduled_date &&
        new Date(wo.scheduled_date) < new Date() &&
        wo.status !== 'completed' &&
        wo.status !== 'เสร็จสิ้น' &&
        wo.status !== 'cancelled' &&
        wo.status !== 'ยกเลิก'
      );

      return { data: overdueWorkOrders, error: null };
    } catch (error) {
      console.error('Error getting overdue work orders:', error);
      return { data: null, error };
    }
  }
}

// Export singleton instance
export const workOrderService = new WorkOrderService();
export default workOrderService;

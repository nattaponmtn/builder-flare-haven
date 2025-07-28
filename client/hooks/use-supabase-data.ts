import { useState, useEffect } from 'react';
import { createTableService } from '../../shared/supabase/database-service';
import { useAuth } from './useAuth';

interface Asset {
  id: string;
  equipment_type_id: string;
  system_id: string;
  serial_number: string;
  status: string;
}

interface EquipmentType {
  id: string;
  name: string;
  name_th: string;
  description: string;
  code: string;
  created_at: string;
  is_active: boolean;
}

interface PMTemplate {
  id: string;
  company_id: string;
  system_id: string;
  equipment_type_id: string;
  name: string;
  frequency_type: string;
  frequency_value: number;
  estimated_minutes: number;
  remarks: string;
  template_code: string | null;
  template_name: string;
  description: string | null;
  estimated_duration: number | null;
}

interface WorkOrder {
  id: string;
  work_type: string;
  title: string;
  description: string;
  status: string;
  priority: number;
  asset_id: string;
  location_id: string;
  system_id: string;
  pm_template_id: string;
  assigned_to_user_id: string;
  requested_by_user_id: string;
  created_at: string;
  scheduled_date: string;
  completed_at: string;
  wo_number: string;
  estimated_hours: number;
  assigned_to: string;
  requested_by: string;
  total_cost: number;
  labor_cost: number;
  parts_cost: number;
  actual_hours: number;
  updated_at: string;
  company_id: string;
}

interface Part {
  id: string;
  name: string;
  stock_quantity: number;
  min_stock_level: number;
}

interface Location {
  id: string;
  company_id: string;
  name: string;
  code: string;
  created_at: string;
  address: string;
  is_active: boolean;
}

interface System {
  id: string;
  company_id: string;
  name: string;
  name_th: string;
  description: string;
  code: string;
  location_id: string;
  created_at: string;
  is_active: boolean;
}

interface Company {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  code: string;
  created_at: string;
  email: string;
  phone: string;
  address: string;
  is_active: boolean;
  parent_company_id: string;
}

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  reference_type: string;
  reference_id: string;
  created_at: string;
  updated_at: string;
}

interface DashboardData {
  assets: Asset[];
  workOrders: WorkOrder[];
  parts: Part[];
  locations: Location[];
  systems: System[];
  companies: Company[];
  equipmentTypes: EquipmentType[];
  pmTemplates: PMTemplate[];
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

export function useSupabaseData() {
  const { session, userProfile } = useAuth();
  const [data, setData] = useState<DashboardData>({
    assets: [],
    workOrders: [],
    parts: [],
    locations: [],
    systems: [],
    companies: [],
    equipmentTypes: [],
    pmTemplates: [],
    notifications: [],
    loading: true,
    error: null,
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      // Don't fetch if there's no active session
      if (!session) {
        setData(prev => ({ ...prev, loading: false, error: "Please log in to view data." }));
        return;
      }

      setData(prev => ({ ...prev, loading: true, error: null }));

      try {
        console.log('🔄 Starting data fetch for authenticated user...');
        
        // Create services for each table
        const assetsService = createTableService('assets');
        const workOrdersService = createTableService('work_orders');
        const partsService = createTableService('parts');
        const locationsService = createTableService('locations');
        const systemsService = createTableService('systems');
        const companiesService = createTableService('companies');
        const equipmentTypesService = createTableService('equipment_types');
        const pmTemplatesService = createTableService('pm_templates');
        const notificationsService = createTableService('notifications');

        // Get user's company ID for filtering if available
        const userCompanyId = userProfile?.company_id;

        // Fetch data from all tables with better error handling
        // Apply company filtering where applicable
        const results = await Promise.allSettled([
          userCompanyId ? assetsService.getByField('company_id', userCompanyId) : assetsService.getAll(),
          userCompanyId ? workOrdersService.getByField('company_id', userCompanyId) : workOrdersService.getAll(),
          partsService.getAll(), // Parts might be global or company-specific depending on schema
          userCompanyId ? locationsService.getByField('company_id', userCompanyId) : locationsService.getAll(),
          userCompanyId ? systemsService.getByField('company_id', userCompanyId) : systemsService.getAll(),
          companiesService.getAll(), // Users might need to see all companies or just their own
          userCompanyId ? equipmentTypesService.getByField('company_id', userCompanyId) : equipmentTypesService.getAll(),
          userCompanyId ? pmTemplatesService.getByField('company_id', userCompanyId) : pmTemplatesService.getAll(),
          session?.user ? notificationsService.getByField('user_id', session.user.id) : Promise.resolve({ data: [], error: null }),
        ]);

        // Process results
        const [
          assetsResult,
          workOrdersResult,
          partsResult,
          locationsResult,
          systemsResult,
          companiesResult,
          equipmentTypesResult,
          pmTemplatesResult,
          notificationsResult,
        ] = results.map(result =>
          result.status === 'fulfilled' ? result.value : { data: [], error: result.reason }
        );

        // Log results for debugging
        console.log('📊 Data fetch results:', {
          assets: assetsResult.data?.length || 0,
          workOrders: workOrdersResult.data?.length || 0,
          parts: partsResult.data?.length || 0,
          locations: locationsResult.data?.length || 0,
          systems: systemsResult.data?.length || 0,
          companies: companiesResult.data?.length || 0,
          equipmentTypes: equipmentTypesResult.data?.length || 0,
          pmTemplates: pmTemplatesResult.data?.length || 0,
          notifications: notificationsResult.data?.length || 0,
        });

        // Check for critical errors (but don't fail completely)
        const errors = [
          assetsResult.error,
          workOrdersResult.error,
          partsResult.error,
          locationsResult.error,
          systemsResult.error,
          companiesResult.error,
          equipmentTypesResult.error,
          pmTemplatesResult.error,
          notificationsResult.error,
        ].filter(Boolean);

        if (errors.length > 0) {
          console.warn('⚠️ Some data fetch errors (continuing with partial data):', errors);
        }

        // Update state with fetched data (use empty arrays for failed fetches)
        setData({
          assets: (assetsResult.data || []) as Asset[],
          workOrders: (workOrdersResult.data || []) as WorkOrder[],
          parts: (partsResult.data || []) as Part[],
          locations: (locationsResult.data || []) as Location[],
          systems: (systemsResult.data || []) as System[],
          companies: (companiesResult.data || []) as Company[],
          equipmentTypes: (equipmentTypesResult.data || []) as EquipmentType[],
          pmTemplates: (pmTemplatesResult.data || []) as PMTemplate[],
          notifications: (notificationsResult.data || []) as Notification[],
          loading: false,
          error: errors.length > 0 ? `Partial data load: ${errors.length} tables had issues` : null,
        });

        console.log('✅ Data fetch completed');

      } catch (error) {
        console.error('❌ Critical error fetching Supabase data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        }));
      }
    };

    fetchData();
  }, [refreshTrigger, session]);

  const refresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Computed values for dashboard metrics
  const metrics = {
    totalAssets: data.assets.length,
    workingAssets: data.assets.filter(a => a.status === 'Working').length,
    faultyAssets: data.assets.filter(a => a.status === 'Faulty').length,
    
    totalWorkOrders: data.workOrders.length,
    pendingWorkOrders: data.workOrders.filter(wo => wo.status === 'Pending' || wo.status === 'รอดำเนินการ').length,
    inProgressWorkOrders: data.workOrders.filter(wo => wo.status === 'In Progress' || wo.status === 'กำลังดำเนินการ').length,
    completedWorkOrders: data.workOrders.filter(wo => wo.status === 'Completed' || wo.status === 'เสร็จสิ้น').length,
    overdueWorkOrders: data.workOrders.filter(wo => {
      if (!wo.scheduled_date) return false;
      const scheduledDate = new Date(wo.scheduled_date);
      const now = new Date();
      return scheduledDate < now && wo.status !== 'Completed' && wo.status !== 'เสร็จสิ้น';
    }).length,

    totalParts: data.parts.length,
    lowStockParts: data.parts.filter(p => p.stock_quantity <= p.min_stock_level).length,
    outOfStockParts: data.parts.filter(p => p.stock_quantity === 0).length,

    totalLocations: data.locations.length,
    activeLocations: data.locations.filter(l => l.is_active).length,

    totalSystems: data.systems.length,
    activeSystems: data.systems.filter(s => s.is_active).length,

    totalCompanies: data.companies.length,
    activeCompanies: data.companies.filter(c => c.is_active).length,
  };

  // Recent work orders (sorted by created_at)
  const recentWorkOrders = data.workOrders
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Critical alerts - combine notifications with low stock alerts
  const lowStockAlerts = data.parts
    .filter(p => p.stock_quantity <= p.min_stock_level)
    .map(part => ({
      id: `stock-${part.id}`,
      title: 'สต็อกต่ำ',
      message: `${part.name} (เหลือ ${part.stock_quantity} ชิ้น)`,
      type: 'stock_alert',
      severity: part.stock_quantity === 0 ? 'CRITICAL' : 'WARNING',
      created_at: new Date().toISOString(),
    }));

  // Combine with actual notifications from database
  const criticalAlerts = [
    ...data.notifications
      .filter(n => !n.is_read && (n.type === 'critical' || n.type === 'urgent'))
      .map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        severity: 'CRITICAL',
        created_at: notification.created_at,
      })),
    ...lowStockAlerts
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return {
    ...data,
    metrics,
    recentWorkOrders,
    criticalAlerts,
    unreadNotificationsCount: data.notifications.filter(n => !n.is_read).length,
    refresh,
  };
}

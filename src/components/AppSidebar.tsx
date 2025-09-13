import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Receipt,
  TrendingUp,
  User
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

const adminItems = [
  { title: 'Business Dashboard', url: '/dashboard', icon: BarChart3 },
  { title: 'Stock Inventory', url: '/inventory', icon: Package },
  { title: 'Sales Reports', url: '/reports', icon: TrendingUp },
  { title: 'Orders', url: '/orders', icon: ShoppingCart },
  { title: 'Customers', url: '/customers', icon: Users },
];

const salesmanItems = [
  { title: 'Dashboard', url: '/dashboard', icon: BarChart3 },
  { title: 'Create Order', url: '/create-order', icon: ShoppingCart },
  { title: 'My Orders', url: '/my-orders', icon: Receipt },
  { title: 'Customers', url: '/customers', icon: Users },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { profile, isAdmin, isSalesman } = useAuth();
  const currentPath = location.pathname;

  const items = isAdmin ? adminItems : isSalesman ? salesmanItems : [];
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;
  const getNavClass = (path: string) => 
    isActive(path) 
      ? "bg-primary/10 text-primary border-r-2 border-primary font-medium"
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        {/* User Info */}
        {!isCollapsed && (
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.full_name}
                </p>
                <p className="text-xs text-sidebar-foreground/70 capitalize">
                  {profile?.role}
                </p>
              </div>
            </div>
          </div>
        )}

        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium">
              Navigation
            </SidebarGroupLabel>
          )}
          
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth ${getNavClass(item.url)}`}
                    >
                      <item.icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
                      {!isCollapsed && (
                        <span className="truncate">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Role Badge */}
        {!isCollapsed && (
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <div className="bg-gradient-primary/10 rounded-lg p-3 text-center">
              <div className="text-xs font-medium text-primary capitalize">
                {profile?.role} Panel
              </div>
              <div className="text-xs text-primary/70 mt-1">
                Fitrich Masala
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
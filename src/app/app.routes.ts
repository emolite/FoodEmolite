import { Routes } from '@angular/router';
import { URL_ENDPOINT } from './common/constants/url-endpoint';

import { PageLoginComponent } from './pages/page-login/login/login';
import { PageRegisterComponent } from './pages/page-login/register/register';
import { LayoutAdminComponent } from './layouts/layout-admin/layout-admin';
import { PageAdminStoresComponent } from './pages/page-admin/stores/stores';
import { PageAdminStoreFoodsComponent } from './pages/page-admin/foods/foods';
import { LayoutAgentComponent } from './layouts/layout-agent/layout-agent';
import { PageAgentInfoComponent } from './pages/page-agent/agent-info/agent-info';
import { PageAgentFoodsComponent } from './pages/page-agent/agent-foods/agent-foods';
import { LayoutUserComponent } from './layouts/layout-user/layout-user';
import { PageUserStoresComponent } from './pages/page-user/user-stores/user-stores';
import { PageUserStoreFoodsComponent } from './pages/page-user/user-store-foods/user-store-foods';
import { PageUserOrderHistoryComponent } from './pages/page-user/user-histories/user-histories';
import { PageAgentOrdersComponent } from './pages/page-agent/agent-orders/agent-orders';
import { UsersComponent } from './pages/page-admin/users/users';
import { AgentsComponent } from './pages/page-admin/agents/agents';
import { AgentRevenueComponent } from './pages/page-agent/agent-revenue/agent-revenue';
import { RevenueComponent } from './pages/page-admin/revenue/revenue';
import { PageOrderSuccessComponent } from './pages/page-user/order-success/order-success';
import { PageAgentFoodCategoriesComponent } from './pages/page-agent/agent-food-categories/agent-food-categories';

export const routes: Routes = [
  {
    path: '',
    redirectTo: `${URL_ENDPOINT.USER}/${URL_ENDPOINT.USER_STORES}`,
    pathMatch: 'full'
  },
  {
    path: URL_ENDPOINT.LOGIN,
    component: PageLoginComponent
  },
  {
    path: URL_ENDPOINT.REGISTER,
    component: PageRegisterComponent
  },
  {
    path: URL_ENDPOINT.SUCCESS,
    component: PageOrderSuccessComponent
  },
  {
    path: URL_ENDPOINT.ADMIN,
    component: LayoutAdminComponent,
    children: [
      {
        path: '',
        redirectTo: URL_ENDPOINT.ADMIN_STORES,
        pathMatch: 'full'
      },
      {
        path: URL_ENDPOINT.ADMIN_STORES,
        component: PageAdminStoresComponent,
        data: {
          title: 'Danh sách cửa hàng'
        }
      },
      {
        path: URL_ENDPOINT.ADMIN_FOODS,
        component: PageAdminStoreFoodsComponent,
        data: {
          title: 'Danh sách món ăn'
        }
      },
      {
        path: URL_ENDPOINT.ADMIN_USERS,
        component: UsersComponent,
        data: {
          title: 'Danh sách người dùng'
        }
      },
      {
        path: URL_ENDPOINT.ADMIN_AGENTS,
        component: AgentsComponent,
        data: {
          title: 'Danh sách đại lý'
        }
      },
      {
        path: URL_ENDPOINT.ADMIN_REVENUE,
        component: RevenueComponent,
        data: {
          title: 'Doanh thu'
        }
      },
    ]
  },

  {
    path: URL_ENDPOINT.AGENT,
    component: LayoutAgentComponent,
    children: [
      {
        path: '',
        redirectTo: URL_ENDPOINT.AGENT_PROFILE,
        pathMatch: 'full'
      },
      {
        path: URL_ENDPOINT.AGENT_PROFILE,
        component: PageAgentInfoComponent,
        data: {
          title: 'Thông tin'
        }
      },
      {
        path: URL_ENDPOINT.AGENT_FOOD_CATEGORIES,
        component: PageAgentFoodCategoriesComponent,
        data: {
          title: 'Danh sách danh mục'
        }
      },
      {
        path: URL_ENDPOINT.AGENT_FOODS,
        component: PageAgentFoodsComponent,
        data: {
          title: 'Danh sách món ăn'
        }
      },
      {
        path: URL_ENDPOINT.AGENT_ORDERS,
        component: PageAgentOrdersComponent,
        data: {
          title: 'Danh sách đơn hàng'
        }
      },
      {
        path: URL_ENDPOINT.AGENT_REVENUE,
        component: AgentRevenueComponent,
        data: {
          title: 'Thống kê'
        }
      },
    ]
  },

  {
    path: URL_ENDPOINT.USER,
    component: LayoutUserComponent,
    children: [
      {
        path: '',
        redirectTo: URL_ENDPOINT.USER_STORES,
        pathMatch: 'full'
      },
      {
        path: URL_ENDPOINT.USER_STORES,
        component: PageUserStoresComponent,
        data: {
          title: 'Danh sách cửa hàng'
        }
      },
      {
        path: `${URL_ENDPOINT.USER_STORE_FOODS}/:storeRefCode`,
        component: PageUserStoreFoodsComponent
      },
      {
        path: URL_ENDPOINT.USER_HISTORY,
        component: PageUserOrderHistoryComponent,
        data: {
          title: 'Lịch sử'
        }
      }
    ]
  }
];
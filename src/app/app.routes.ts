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

export const routes: Routes = [
  {
    path: '',
    redirectTo: URL_ENDPOINT.LOGIN,
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
      }
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
        path: URL_ENDPOINT.AGENT_FOODS,
        component: PageAgentFoodsComponent,
        data: {
          title: 'Danh sách món ăn'
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
      // {
      //   path: URL_ENDPOINT.USER_HISTORY,
      //   component: PageUserHistoryComponent,
      //   data: {
      //     title: 'Lịch sử'
      //   }
      // }
    ]
  }
];
import { lazy } from 'react';

const Home = lazy(() => import('./views/home/Home'));
const Terms = lazy(() => import('./views/dashboard/Terms'))
const Privacy = lazy(() => import('./views/dashboard/Privacy'))
const PersionalSetting = lazy(() => import('./views/setting/PersionalSetting'))

const AdminLinkManage = lazy(() => import('./views/admin/AdminLinkManage'));
const AdminUsers = lazy(() => import('./views/admin/AdminUsers'));

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/home', name: 'Home', component: Home },
  { path: '/setting', name: 'Setting', component: PersionalSetting },
  { path: '/users', name: 'Users', component: AdminUsers },
  { path: '/links', name: 'Link Manage', component: AdminLinkManage}
];

export default routes;

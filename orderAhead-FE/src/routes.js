import { lazy } from 'react';

const Home = lazy(() => import('./views/home/Home'));
const Signin = lazy(() => import('./views/auth/Signin'));
const Signup = lazy(() => import('./views/auth/Signup'));
const Terms = lazy(() => import('./views/dashboard/Terms'))
const Privacy = lazy(() => import('./views/dashboard/Privacy'))
const PersionalSetting = lazy(() => import('./views/setting/PersionalSetting'))

const AdminHome = lazy(() => import('./views/admin/AdminHome'));
const AdminUsers = lazy(() => import('./views/admin/AdminUsers'));
const AdminSettings = lazy(() => import('./views/admin/AdminSettings'));

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/home', name: 'Home', component: Home },
  { path: '/signin', name: 'Signin', component: Signin },
  { path: '/signup', name: 'Signup', component: Signup },
  { path: '/setting', name: 'Setting', component: PersionalSetting },
  { path: '/terms', name: 'Terms', component: Terms },
  { path: '/privacy', name: 'Privacy', component: Privacy },
  { path: '/admin', name: 'Admin', component: AdminHome },
  { path: '/users', name: 'Users', component: AdminUsers },
  { path: '/config', name: 'Config', component: AdminSettings },
];

export default routes;

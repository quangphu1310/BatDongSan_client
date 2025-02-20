import React from 'react';
import { Button, Layout, Menu } from 'antd';
import './App.css';

import 'numeral/locales/vi';
import { createBrowserRouter, Outlet, RouterProvider, useLocation, useNavigate } from 'react-router-dom';
import { HomeOutlined} from '@ant-design/icons';

import Products from './pages/products';

// numeral.locale('vi');

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: '/',
        element: <Products />,
      },
    ],
  },
]);

const items = [
  {
    key: '/',
    label: 'Home',
    icon: <HomeOutlined />,
  }
];

function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

function Root() {
  const navigate = useNavigate();
  let location = useLocation();
  console.log(location.pathname);

  return (
    <React.Fragment>
      <Layout>
        <Layout.Header>
          <Menu
            theme='dark'
            mode='horizontal'
            defaultSelectedKeys={[location.pathname]}
            items={items}
            style={{ flex: 1, minWidth: 0 }}
            onClick={(item) => {
              console.log(item);
              navigate(item.key);
            }}
          />
        </Layout.Header>
        <Layout.Content>
          <Outlet />
        </Layout.Content>
        <Layout.Footer>Footer</Layout.Footer>
      </Layout>
    </React.Fragment>
  );
}

export default App;
import { useEffect, useRef, useState } from 'react';
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import NotFound from 'components/share/not.found';
import Loading from 'components/share/loading';
import LoginPage from 'pages/auth/login';
import RegisterPage from 'pages/auth/register';
import LayoutAdmin from 'components/admin/layout.admin';
import ProtectedRoute from 'components/share/protected-route.ts';
import Header from 'components/client/header.client';
import Footer from 'components/client/footer.client';
import HomePage from 'pages/home';
import styles from 'styles/app.module.scss';
import DashboardPage from './pages/admin/dashboard';
import CompanyPage from './pages/admin/company';
import ExamPage from './pages/admin/exam';
import PermissionPage from './pages/admin/permission';
import ResumePage from './pages/admin/resume';
import RolePage from './pages/admin/role';
import UserPage from './pages/admin/user';
import { fetchAccount } from './redux/slice/accountSlide';
import LayoutApp from './components/share/layout.app';
import ViewUpsertJob from './components/admin/job/upsert.job';
import ViewUpsertExam from './components/admin/exam/upsert.exam';
import ClientJobPage from './pages/job';
import ClientJobDetailPage from './pages/job/detail';
import ClientCompanyPage from './pages/company';
import ClientCompanyDetailPage from './pages/company/detail';
import JobTabs from './pages/admin/job/job.tabs';
import AppPage from './pages/admin/app';
import ZmauPage from './pages/admin/zmau';
import QAPage from './pages/admin/qa';
import ViewUpsertQA from './components/admin/qa/upsert.qa';
import NewPage from './pages/admin/new';
import ViewUpsertNew from './components/admin/new/upsert.new';
import InforPage from './pages/admin/infor';
import ViewUpsertInfor from './components/admin/infor/upsert.infor';
import HotlinePage from './pages/admin/hotline';
import ViewUpsertHotline from './components/admin/hotline/upsert.hotline';
import ConfigPage from './pages/admin/config';
import ViewUpsertConfig from './components/admin/config/upsert.config';
import CategoryPage from './pages/admin/category';
import ViewUpsertBanner from './components/admin/banner/upsert.banner';
import BannerPage from './pages/admin/banner';
import ViewUpsertCategory from './components/admin/category/upsert.category';
import ViewUpsertUser from './components/admin/user/upsert.user';
import ClientAppPage from './pages/app';
import ClientAppDetailPage from './pages/app/detail';
import ClientExamPage from './pages/exam';
import ClientExamDetailPage from './pages/exam/detail';

const LayoutClient = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rootRef && rootRef.current) {
      rootRef.current.scrollIntoView({ behavior: 'smooth' });
    }

  }, [location]);

  return (
    <div className='layout-app' ref={rootRef}>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className={styles['content-app']}>
        <Outlet context={[searchTerm, setSearchTerm]} />
      </div>
      <Footer />
    </div>
  )
}

export default function App() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(state => state.account.isLoading);


  useEffect(() => {
    if (
      window.location.pathname === '/login'
      || window.location.pathname === '/register'
    )
      return;
    dispatch(fetchAccount())
  }, [])

  const router = createBrowserRouter([
    {
      path: "/",
      element: (<LayoutApp><LayoutClient /></LayoutApp>),
      errorElement: <NotFound />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "job", element: <ClientJobPage /> },
        { path: "exam", element: <ClientExamPage /> },
        { path: "job/:id", element: <ClientJobDetailPage /> },
        { path: "exam/:id", element: <ClientExamDetailPage /> },
        { path: "company", element: <ClientCompanyPage /> },
        { path: "app", element: <ClientAppPage /> },
        { path: "company/:id", element: <ClientCompanyDetailPage /> },
        { path: "app/:id", element: <ClientAppDetailPage /> }
      ],
    },

    {
      path: "/admin",
      element: (<LayoutApp><LayoutAdmin /> </LayoutApp>),
      errorElement: <NotFound />,
      children: [
        {
          index: true, element:
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
        },
        {
          path: "company",
          element:
            <ProtectedRoute>
              <CompanyPage />
            </ProtectedRoute>
        },
         {
          path: "user",
          children: [
            {
              index: true,
              element: <ProtectedRoute><UserPage /></ProtectedRoute>
            },
            {
              path: "upsert",
               element:
                <ProtectedRoute><ViewUpsertUser /></ProtectedRoute>
            }
          ]
        },
        // {
        //   path: "user",
        //   element:
        //     <ProtectedRoute>
        //       <UserPage />
        //     </ProtectedRoute>
        // },
        {
          path: "app",
          element:
            <ProtectedRoute>
              <AppPage />
            </ProtectedRoute>
        },
        {
          path: "zmau",
          element:
            <ProtectedRoute>
              <ZmauPage />
            </ProtectedRoute>
        },
         {
          path: "qa",
          children: [
            {
              index: true,
              element: <ProtectedRoute><QAPage/></ProtectedRoute>
            },
            {
              path: "upsert",
               element:
                <ProtectedRoute><ViewUpsertQA /></ProtectedRoute>
            }
          ]
        },
         {
          path: "new",
          children: [
            {
              index: true,
              element: <ProtectedRoute><NewPage/></ProtectedRoute>
            },
            {
              path: "upsert",
               element:
                <ProtectedRoute><ViewUpsertNew /></ProtectedRoute>
            }
          ]
        },
         {
          path: "infor",
          children: [
            {
              index: true,
              element: <ProtectedRoute><InforPage /></ProtectedRoute>
            },
            {
              path: "upsert",
               element:
                <ProtectedRoute><ViewUpsertInfor /></ProtectedRoute>
            }
          ]
        },
         {
          path: "hotline",
          children: [
            {
              index: true,
              element: <ProtectedRoute><HotlinePage /></ProtectedRoute>
            },
            {
              path: "upsert",
               element:
                <ProtectedRoute><ViewUpsertHotline /></ProtectedRoute>
            }
          ]
        },
         {
          path: "config",
          children: [
            {
              index: true,
              element: <ProtectedRoute><ConfigPage /></ProtectedRoute>
            },
            {
              path: "upsert",
               element:
                <ProtectedRoute><ViewUpsertConfig /></ProtectedRoute>
            }
          ]
        },
         {
          path: "category",
          children: [
            {
              index: true,
              element: <ProtectedRoute><CategoryPage /></ProtectedRoute>
            },
            {
              path: "upsert",
               element:
                <ProtectedRoute><ViewUpsertCategory /></ProtectedRoute>
            }
          ]
        },
         {
          path: "banner",
          children: [
            {
              index: true,
              element: <ProtectedRoute><BannerPage /></ProtectedRoute>
            },
            {
              path: "upsert",
               element:
                <ProtectedRoute><ViewUpsertBanner /></ProtectedRoute>
            }
          ]
        },
         {
          path: "exam",
          children: [
            {
              index: true,
              element: <ProtectedRoute><ExamPage /></ProtectedRoute>
            },
            {
              path: "upsert",
               element:
                <ProtectedRoute><ViewUpsertExam /></ProtectedRoute>
            }
          ]
        },
        {
          path: "job",
          children: [
            {
              index: true,
              element: <ProtectedRoute><JobTabs /></ProtectedRoute>
            },
            {
              path: "upsert", element:
                <ProtectedRoute><ViewUpsertJob /></ProtectedRoute>
            }
          ]
        },
        {
          path: "resume",
          element:
            <ProtectedRoute>
              <ResumePage />
            </ProtectedRoute>
        },
        {
          path: "permission",
          element:
            <ProtectedRoute>
              <PermissionPage />
            </ProtectedRoute>
        },
        {
          path: "role",
          element:
            <ProtectedRoute>
              <RolePage />
            </ProtectedRoute>
        }
      ],
    },


    {
      path: "/login",
      element: <LoginPage />,
    },

    {
      path: "/register",
      element: <RegisterPage />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}
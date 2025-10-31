import React, { useState, useEffect } from 'react';
import {
    AppstoreOutlined,
    ExceptionOutlined,
    ApiOutlined,
    UserOutlined,
    BankOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    AliwangwangOutlined,
    BugOutlined,
    ScheduleOutlined,
    SolutionOutlined,
    AppleOutlined,
    UserSwitchOutlined,
    QuestionCircleOutlined,
    ContainerOutlined,
    InfoCircleOutlined,
    PhoneOutlined,
    ToolOutlined,
    ReadOutlined,
    FileImageOutlined,
    FileSyncOutlined,
    CloudSyncOutlined
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Space, message, Avatar, Button } from 'antd';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { callLogout } from 'config/api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { isMobile } from 'react-device-detect';
import type { MenuProps } from 'antd';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import { ALL_PERMISSIONS } from '@/config/permissions';

const { Content, Sider } = Layout;

const LayoutAdmin = () => {
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false);
    const [activeMenu, setActiveMenu] = useState('');
    const user = useAppSelector(state => state.account.user);

    const permissions = useAppSelector(state => state.account.user.role.permissions);

    //console.log("permissions=="+permissions);
    const [menuItems, setMenuItems] = useState<MenuProps['items']>([]);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const ACL_ENABLE = import.meta.env.VITE_ACL_ENABLE;
        if (permissions?.length || ACL_ENABLE === 'false') {

            const viewCompany = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.COMPANIES.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.COMPANIES.GET_PAGINATE.method
            )

            const viewApp = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.APPS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.APPS.GET_PAGINATE.method
            )

            const viewZmau = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.ZMAUS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.ZMAUS.GET_PAGINATE.method
            )

            const viewQA = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.QAS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.QAS.GET_PAGINATE.method
            )

            const viewNew = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.NEWS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.NEWS.GET_PAGINATE.method
            )

            const viewArticle = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.ARTICLES.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.ARTICLES.GET_PAGINATE.method
            )

            const viewInfor = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.INFORS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.INFORS.GET_PAGINATE.method
            )

            const viewHotline = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.HOTLINES.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.HOTLINES.GET_PAGINATE.method
            )

            const viewConfig = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.CONFIGS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.CONFIGS.GET_PAGINATE.method
            )

            const viewCategory = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.CATEGORIES.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.CATEGORIES.GET_PAGINATE.method
            )

            const viewBanner = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.BANNERS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.BANNERS.GET_PAGINATE.method
            )

            const viewExam = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.EXAMS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.EXAMS.GET_PAGINATE.method
            )

            const viewUser = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.USERS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.USERS.GET_PAGINATE.method
            )

            const viewJob = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.JOBS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.JOBS.GET_PAGINATE.method
            )

            const viewResume = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.RESUMES.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.RESUMES.GET_PAGINATE.method
            )

            const viewRole = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.ROLES.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.ROLES.GET_PAGINATE.method
            )

            const viewPermission = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.USERS.GET_PAGINATE.method
            )

            const full = [
                {
                    label: <Link to='/admin'>Dashboard</Link>,
                    key: '/admin',
                    icon: <AppstoreOutlined />
                },
                ...(viewQA || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/qa'>Hỏi đáp</Link>,
                    key: '/admin/qa',
                    icon: <QuestionCircleOutlined /> ,
                }] : []),
                 ...(viewHotline || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/hotline'>Đường dây nóng</Link>,
                    key: '/admin/hotline',
                    icon: <PhoneOutlined />,
                }] : []),
                ...(viewBanner || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/banner'>Banner liên kết</Link>,
                    key: '/admin/banner',
                    icon: <FileImageOutlined  />,
                }] : []),
                 ...(viewInfor || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/infor'>Thông tin trợ giúp</Link>,
                    key: '/admin/infor',
                    icon: <InfoCircleOutlined />,
                }] : []),
                ...(viewConfig || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/config'>Cấu hình hệ thống</Link>,
                    key: '/admin/config',
                    icon: <ToolOutlined /> ,
                }] : []),
                  ...(viewNew || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/new'>Tin tức</Link>,
                    key: '/admin/new',
                    icon: <ContainerOutlined />,
                }] : []),
                  ...(viewCategory || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/category'>Chuyên mục</Link>,
                    key: '/admin/category',
                    icon: <ReadOutlined /> ,
                }] : []),
                    ...(viewArticle || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/article'>Tin đồng bộ</Link>,
                    key: '/admin/article',
                    icon: <CloudSyncOutlined />,
                }] : []),
                ...(viewApp || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/app'>App</Link>,
                    key: '/admin/app',
                    icon: <AppleOutlined />,
                }] : []),
                 ...(viewZmau || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/zmau'>Zalo Users</Link>,
                    key: '/admin/zmau',
                    icon: <UserSwitchOutlined />,
                }] : []),
                ...(viewUser || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/user'>Người dùng</Link>,
                    key: '/admin/user',
                    icon: <UserOutlined />
                }] : []),
                 ...(viewCompany || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/company'>Đơn vị</Link>,
                    key: '/admin/company',
                    icon: <BankOutlined />,
                }] : []),
                ...(viewJob || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/job'>Công việc</Link>,
                    key: '/admin/job',
                    icon: <ScheduleOutlined />
                }] : []),

                ...(viewResume || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/resume'>Resume</Link>,
                    key: '/admin/resume',
                    icon: <AliwangwangOutlined />
                }] : []),
                ...(viewExam || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/exam'>Cuộc thi</Link>,
                    key: '/admin/exam',
                    icon: <SolutionOutlined  />
                }] : []),
                ...(viewPermission || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/permission'>Quyền hạn</Link>,
                    key: '/admin/permission',
                    icon: <ApiOutlined />
                }] : []),
                ...(viewRole || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/role'>Vai trò</Link>,
                    key: '/admin/role',
                    icon: <ExceptionOutlined />
                }] : []),
             



            ];

            setMenuItems(full);
        }
    }, [permissions])
    useEffect(() => {
        setActiveMenu(location.pathname)
    }, [location])

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && +res.statusCode === 200) {
            dispatch(setLogoutAction({}));
            message.success('Đăng xuất thành công');
            navigate('/')
        }
    }

    // if (isMobile) {
    //     items.push({
    //         label: <label
    //             style={{ cursor: 'pointer' }}
    //             onClick={() => handleLogout()}
    //         >Đăng xuất</label>,
    //         key: 'logout',
    //         icon: <LogoutOutlined />
    //     })
    // }

    const itemsDropdown = [
        {
            label: <Link to={'/'}>Trang chủ</Link>,
            key: 'home',
        },
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => handleLogout()}
            >Đăng xuất</label>,
            key: 'logout',
        },
    ];

    return (
        <>
            <Layout
                style={{ minHeight: '100vh' }}
                className="layout-admin"
            >
                {!isMobile ?
                    <Sider
                        theme='light'
                        collapsible
                        collapsed={collapsed}
                        onCollapse={(value) => setCollapsed(value)}>
                        <div style={{ height: 32, margin: 16, textAlign: 'center' }}>
                            <BugOutlined />  ADMIN
                        </div>
                        <Menu
                            selectedKeys={[activeMenu]}
                            mode="inline"
                            items={menuItems}
                            onClick={(e) => setActiveMenu(e.key)}
                        />
                    </Sider>
                    :
                    <Menu
                        selectedKeys={[activeMenu]}
                        items={menuItems}
                        onClick={(e) => setActiveMenu(e.key)}
                        mode="horizontal"
                    />
                }

                <Layout>
                    {!isMobile &&
                        <div className='admin-header' style={{ display: "flex", justifyContent: "space-between", marginRight: 20 }}>
                            <Button
                                type="text"
                                icon={collapsed ? React.createElement(MenuUnfoldOutlined) : React.createElement(MenuFoldOutlined)}
                                onClick={() => setCollapsed(!collapsed)}
                                style={{
                                    fontSize: '16px',
                                    width: 64,
                                    height: 64,
                                }}
                            />

                            <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                                <Space style={{ cursor: "pointer" }}>
                                    Welcome {user?.name}
                                    <Avatar> {user?.name?.substring(0, 2)?.toUpperCase()} </Avatar>

                                </Space>
                            </Dropdown>
                        </div>
                    }
                    <Content style={{ padding: '15px' }}>
                        <Outlet />
                    </Content>
                    {/* <Footer style={{ padding: 10, textAlign: 'center' }}>
                        By sotaxu
                    </Footer> */}
                </Layout>
            </Layout>

        </>
    );
};

export default LayoutAdmin;
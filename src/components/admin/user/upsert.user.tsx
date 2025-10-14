import { Breadcrumb, Col, ConfigProvider, Divider, Form, Modal, Row, Upload, message, notification } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DebounceSelect } from "./debouce.select";
import { FooterToolbar, ProForm,  ProFormDigit, ProFormSelect, ProFormSwitch, ProFormText } from "@ant-design/pro-components";
import styles from 'styles/admin.module.scss';
import { IAppSelect, ICompanySelect } from "@/types/backend";
import { useState, useEffect } from 'react';
import { callCreateUser, callFetchAllSkill, callFetchApp, callFetchCompany, callFetchRole, callFetchUserById, callUpdateUser, callUploadSingleFile } from "@/config/api";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CheckSquareOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import enUS from 'antd/lib/locale/en_US';
import { IUser } from "@/types/backend";
import { v4 as uuidv4 } from 'uuid';
import { useAppSelector } from "@/redux/hooks";

export interface ISelect {
    label: string;
    key?: string;
}

const ViewUpsertUser = (props: any) => {
    const [companies, setCompanies] = useState<ISelect[]>([]);
    const [apps, setApps] = useState<ISelect[]>([]);
    const [roles, setRoles] = useState<ICompanySelect[]>([]);
    
    const navigate = useNavigate();
    const [value, setValue] = useState<string>("");

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // user id
    const [dataUpdate, setDataUpdate] = useState<IUser | null>(null);
    const [form] = Form.useForm();
    

    const is_admin = useAppSelector(state => state.account.user._admin);
    const company = useAppSelector(state => state.account.user.company);
    const app = useAppSelector(state => state.account.user.app);
    const role = useAppSelector(state => state.account.user.role);

    const [fileList, setFileList] = useState<any[]>([]);

    useEffect(() => {
        const init = async () => {
           

            if (id) {
                const res = await callFetchUserById(id);

                console.log("res.data == " + JSON.stringify(res.data));
                if (res && res.data) {              

                    setDataUpdate(res.data);
                    
                    setCompanies([
                        {
                            label: res.data.company?.name as string,
                            key: res.data.company?.id
                        }
                    ])

                    form.setFieldsValue({
                        ...res.data,
                        company: {
                            label: res.data.company?.name as string,
                            key: res.data.company?.id
                        },
                    })

                     setApps([
                        {
                            label: res.data.app?.name as string,
                            key: res.data.app?.id
                        }
                    ])

                    form.setFieldsValue({
                        ...res.data,
                        app: {
                            label: res.data.app?.name as string,
                            key: res.data.app?.id
                        },
                    })

                    setRoles([
                        {
                            label: res.data.role?.name as string,
                            value: res.data.role?.id as string,
                            key: res.data.role?.id
                        }
                    ])

                     form.setFieldsValue({
                        ...res.data,
                        role: {
                            label: res.data.role?.name as string,
                             value: res.data.role?.id as string,
                            key: res.data.role?.id
                        },
                    })

                }
            }
        }
        init();
        return () => form.resetFields()
    }, [id])

    // Usage of DebounceSelect
    async function fetchCompanyList(name: string): Promise<ICompanySelect[]> {
        const res = await callFetchCompany(`page=1&size=100&name ~ '${name}'`);
        if (res && res.data) {
            const list = res.data.result;
            const temp = list.map(item => {
                return {
                    label: item.name as string,
                    value: `${item.id}@#$${item.logo}` as string
                }
            })
            return temp;
        } else return [];
    }

      // Usage of DebounceSelect
        async function fetchAppList(name: string): Promise<IAppSelect[]> {
            const res = await callFetchApp(`page=1&size=100&name ~ '${name}'`);
            if (res && res.data) {
                const list = res.data.result;
                const temp = list.map(item => {
                    return {
                        label: item.name as string,
                        value: `${item.id}@#$${item.logo}` as string
                    }
                })
                return temp;
            } else return [];
        }

    async function fetchRoleList(name: string): Promise<ICompanySelect[]> {
        const res = await callFetchRole(`page=1&size=100&name=/${name}/i`);
        if (res && res.data) {
            const list = res.data.result;
            const temp = list.map(item => {
                return {
                    label: item.name as string,
                    value: item.id as string
                }
            })
            return temp;
        } else return [];
    }

    const onFinish = async (values: any) => {
      

        // ✅ Tách thông tin company theo phân quyền
        let finalCompanyParsed = {
          id: company?.id || "",
          name: company?.name || "",
        };
      
        if (is_admin && !company && values?.company?.value) {
          const cp = values.company.value.split('@#$');
          finalCompanyParsed = {
            id: cp[0],
            name: values.company.label,
          };
        }

         // ✅ Tách thông tin app theo phân quyền
        let finalAppParsed = {
          id: app?.id || "",
          name: app?.name || "",
        };
      
        if (is_admin && !app && values?.app?.value) {
          const cp = values.app.value.split('@#$');
          finalAppParsed = {
            id: cp[0],
            name: values.app.label,
          };
        }

       // ✅ Tách thông tin role theo phân quyền
        let finalRoleParsed = {
        id: role?.id || "",
        name: role?.name || "",
        };

        // ✅ Chỉ cho phép admin tổng (is_admin && app_id=null) chọn role
        if (is_admin && !app && values?.role?.value) {
        finalRoleParsed = {
            id: values.role.value,
            name: values.role.label,
        };
        }
      
        const user = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          _admin: values._admin,
          password: values.password,
          role: finalRoleParsed,
          age: values.age,
          gender: values.gender,
          address: values.address,
          description: value,
          company: finalCompanyParsed,
          app: finalAppParsed,
          active: values.active,
        };
      
        let res;
        if (dataUpdate?.id) {
          const userUpdate = { ...user, id: dataUpdate.id };
          res = await callUpdateUser(userUpdate);
          if (res?.data) {
            message.success("Cập nhật user thành công");
            navigate('/admin/user');
          } else {
            notification.error({
              message: 'Có lỗi xảy ra',
              description: res.message,
            });
          }
        } else {
          // ✅ Create mode
          res = await callCreateUser(user);
          if (res?.data) {
            message.success("Tạo mới user thành công");
            navigate('/admin/user');
          } else {
            notification.error({
              message: 'Có lỗi xảy ra',
              description: res.message,
            });
          }
        }
      };


    return (
        <div className={styles["upsert-container"]}>
            <div className={styles["title"]}>
                <Breadcrumb
                    separator=">"
                    items={[
                        {
                            title: <Link to="/admin/user">Quản lý User</Link>,
                        },
                        {
                            title: 'Cập nhật User',
                        },
                    ]}
                />
            </div>
            <div >

                <ConfigProvider locale={enUS}>
                    <ProForm
                        form={form}
                        onFinish={onFinish}
                        submitter={
                            {
                                searchConfig: {
                                    resetText: "Hủy",
                                    submitText: <>{dataUpdate?.id ? "Cập nhật User" : "Tạo mới User"}</>
                                },
                                onReset: () => navigate('/admin/user'),
                                render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                                submitButtonProps: {
                                    icon: <CheckSquareOutlined />
                                },
                            }
                        }
                    >
                        <Row gutter={[20, 20]}>
                            <Col span={24} md={6}>
                                <ProFormText
                                    label="Email"
                                    name="email"
                                    rules={[
                                        { required: true, message: 'Vui lòng không bỏ trống' },
                                        { type: 'email', message: 'Vui lòng nhập email hợp lệ' }
                                    ]}
                                    placeholder="Nhập email"
                                />
                            </Col>

                            <Col span={24} md={6}>
                                <ProFormText.Password
                                    disabled={dataUpdate?.id ? true : false}
                                    label="Password"
                                    name="password"
                                    rules={[{ required: dataUpdate?.id ? false : true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập password"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormText
                                    label="Tên hiển thị"
                                    name="name"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập tên hiển thị"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                 <ProFormDigit
                                    label="Tuổi"
                                    name="age"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập tuổi"
                                />
                            </Col>
                           

                        </Row>
                        <Row gutter={[20, 20]}>
                            
                            <Col span={24} md={6}>
                                <ProFormSelect
                                    name="gender"
                                    label="Giới Tính"
                                    valueEnum={{
                                        MALE: 'Nam',
                                        FEMALE: 'Nữ',
                                        OTHER: 'Khác',
                                    }}
                                    placeholder="Chọn giới tính"
                                    rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                                />
                            </Col>

                        {(dataUpdate?.id || !id) && (
                            <Col span={24} md={6}>
                                <ProForm.Item
                                name="role"
                                label="Vai trò"
                                rules={
                                    is_admin && !app // ✅ admin tổng (app_id = null)
                                    ? [{ required: true, message: 'Vui lòng chọn vai trò!' }]
                                    : []
                                }
                                initialValue={
                                    dataUpdate?.id && dataUpdate?.role
                                    ? {
                                        label: dataUpdate.role.name,
                                        value: dataUpdate.role.id,
                                        }
                                    : undefined
                                }
                                >
                                {/* ✅ Nếu là admin tổng (is_admin && app_id = null) → Cho chọn */}
                                {is_admin && !app ? (
                                    <DebounceSelect
                                    allowClear
                                    showSearch
                                    defaultValue={roles}
                                    value={roles}
                                    placeholder="Chọn vai trò"
                                    fetchOptions={fetchRoleList}
                                    onChange={(newValue: any) => {
                                        if (newValue?.length === 0 || newValue?.length === 1) {
                                        setRoles(newValue as ICompanySelect[]);
                                        }
                                    }}
                                    style={{ width: '100%' }}
                                    />
                                ) : dataUpdate?.id ? (
                                    // ✅ Nếu đang sửa (và không phải admin tổng) → chỉ hiển thị role hiện có
                                    <span>{dataUpdate?.role?.name || 'Không có vai trò'}</span>
                                ) : (
                                    // ✅ Nếu thêm mới và không phải admin tổng → không hiển thị vai trò
                                    <span></span>
                                )}
                                </ProForm.Item>
                            </Col>
                            )}

                            {(dataUpdate?.id || !id) &&
                                <Col span={24} md={6}>
                                    <ProForm.Item
                                        name="company"
                                        label="Thuộc Đơn vị"
                                        rules={
                                            is_admin && !company
                                              ? [{ required: true, message: 'Vui lòng chọn company!' }]
                                              : []
                                          }
                                          initialValue={
                                            !is_admin || company
                                              ? {
                                                  label: company?.name,
                                                  value: `${company?.id}@#$${company?.logo}`,
                                                }
                                              : undefined
                                          }
                                    >
                                            {is_admin && !company ? (
                                                <DebounceSelect
                                                    allowClear
                                                    showSearch
                                                    defaultValue={companies}
                                                    value={companies}
                                                    placeholder="Chọn Đơn vị"
                                                    fetchOptions={fetchCompanyList}
                                                    onChange={(newValue: any) => {
                                                        if (newValue?.length === 0 || newValue?.length === 1) {
                                                            setCompanies(newValue as ICompanySelect[]);
                                                        }
                                                    }}
                                                    style={{ width: '100%' }}
                                                />
                                            ) : (
                                                // Nếu không phải admin hoặc admin nhưng đã có company → gán luôn company cố định
                                                <span>{company?.name}</span>
                                            )}
                                    </ProForm.Item>

                                </Col>
                            }

                             {(dataUpdate?.id || !id) &&
                                <Col span={24} md={6}>
                                    <ProForm.Item
                                        name="app"
                                        label="Thuộc App"
                                        rules={
                                            is_admin && !app
                                              ? [{ required: true, message: 'Vui lòng chọn app!' }]
                                              : []
                                          }
                                          initialValue={
                                            !is_admin || app
                                              ? {
                                                  label: app?.name,
                                                  value: `${app?.id}@#$${app?.logo}`,
                                                }
                                              : undefined
                                          }
                                    >
                                            {is_admin && !app ? (
                                                <DebounceSelect
                                                    allowClear
                                                    showSearch
                                                    defaultValue={apps}
                                                    value={apps}
                                                    placeholder="Chọn App"
                                                    fetchOptions={fetchAppList}
                                                    onChange={(newValue: any) => {
                                                        if (newValue?.length === 0 || newValue?.length === 1) {
                                                            setApps(newValue as IAppSelect[]);
                                                        }
                                                    }}
                                                    style={{ width: '100%' }}
                                                />
                                            ) : (
                                                // Nếu không phải admin hoặc admin nhưng đã có app → gán luôn app cố định
                                                <span>{app?.name}</span>
                                            )}
                                    </ProForm.Item>

                                </Col>
                            }

                          
                            <Col span={24} md={6}>
                                <ProFormText
                                    label="Số điện thoại"
                                    name="phone"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập số điện thoại"
                                />
                            </Col>
                            <Col span={24} md={6}>
                               <ProFormText
                                    label="Địa chỉ"
                                    name="address"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập địa chỉ"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSwitch
                                    label="Trạng thái"
                                    name="active"
                                    checkedChildren="ACTIVE"
                                    unCheckedChildren="INACTIVE"
                                    initialValue={true}
                                    fieldProps={{
                                        defaultChecked: true,
                                    }}
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSwitch
                                    label="Là ADMIN"
                                    name="_admin"
                                    checkedChildren="IS_ADMIN"
                                    unCheckedChildren="NO_ADMIN"
                                    initialValue={true}
                                    fieldProps={{
                                        defaultChecked: true,
                                    }}
                                />
                            </Col>
                        </Row>
                        <Divider />
                    </ProForm>
                </ConfigProvider>

            </div>
        </div>
    )
}

export default ViewUpsertUser;
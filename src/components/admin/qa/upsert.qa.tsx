import { Breadcrumb, Col, ConfigProvider, Divider, Form, Modal, Row, Upload, message, notification } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DebounceSelect } from "../user/debouce.select";
import { FooterToolbar, ProForm,  ProFormDatePicker,  ProFormDateTimePicker,  ProFormDigit, ProFormSwitch, ProFormText } from "@ant-design/pro-components";
import styles from 'styles/admin.module.scss';
import { IAppSelect } from "@/types/backend";
import { useState, useEffect } from 'react';
import { callCreateQA, callFetchAllSkill, callFetchApp, callFetchQAById, callUpdateQA, callUploadSingleFile } from "@/config/api";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CheckSquareOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import enUS from 'antd/lib/locale/en_US';
import { IQA } from "@/types/backend";
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs'
import { useAppSelector } from "@/redux/hooks";

interface IQALogo {
    name: string;
    uid: string;
}

const ViewUpsertQA = (props: any) => {
    const [apps, setApps] = useState<IAppSelect[]>([]);
    
    const navigate = useNavigate();
    const [value_q, setValueQ] = useState<string>("");
    const [value_a, setValueA] = useState<string>("");

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // qa id
    const [dataUpdate, setDataUpdate] = useState<IQA | null>(null);
    const [form] = Form.useForm();

    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);

    const [dataLogo, setDataLogo] = useState<IQALogo[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const is_admin = useAppSelector(state => state.account.user._admin);
    const app = useAppSelector(state => state.account.user.app);

    const [fileList, setFileList] = useState<any[]>([]);

    useEffect(() => {
        const init = async () => {
           

            if (id) {
                const res = await callFetchQAById(id);

                console.log("res.data == " + JSON.stringify(res.data));
                if (res && res.data) {
                   

                    setDataUpdate(res.data);
                    

                    setValueA(res.data.content_a); 
                    setValueQ(res.data.content_q); 
                    
                    setApps([
                        {
                            label: res.data.app?.name as string,
                            value: `${res.data.app?.id}@#$${res.data.app?.logo}` as string,
                            key: res.data.app?.id
                        }
                    ])

                    form.setFieldsValue({
                        ...res.data,
                        app: {
                            label: res.data.app?.name as string,
                            value: `${res.data.app?.id}@#$${res.data.app?.logo}` as string,
                            key: res.data.app?.id
                        },
                    })
                }
            }
        }
        init();
        return () => form.resetFields()
    }, [id])

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

    const onFinish = async (values: any) => {
      
      
        // ✅ Tách thông tin app theo phân quyền
        let finalAppParsed = {
          id: app?.id || "",
          name: app?.name || "",
          logo: app?.logo || "",
        };
      
        if (is_admin && !app && values?.app?.value) {
          const cp = values.app.value.split('@#$');
          finalAppParsed = {
            id: cp[0],
            name: values.app.label,
            logo: cp[1] || "",
          };
        }
      
        const qa = {
          name_q: values.name_q,
          email_q: values.email_q,
          phone_q: values.phone_q,
          time_q: values.time_q,
          name_a: values.name_a,
          time_a: values.time_a,
          content_q: value_q,
          content_a: value_a,
          app: finalAppParsed,
          active: values.active,
        };
      
        let res;
        if (dataUpdate?.id) {
          // ✅ Update mode
          res = await callUpdateQA(qa, dataUpdate.id);
          if (res?.data) {
            message.success("Cập nhật qa thành công");
            navigate('/admin/qa');
          } else {
            notification.error({
              message: 'Có lỗi xảy ra',
              description: res.message,
            });
          }
        } else {
          // ✅ Create mode
          res = await callCreateQA(qa);
          if (res?.data) {
            message.success("Tạo mới qa thành công");
            navigate('/admin/qa');
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
                            title: <Link to="/admin/qa">Quản lý hỏi đáp</Link>,
                        },
                        {
                            title: 'Cập nhật hỏi đáp',
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
                                    submitText: <>{dataUpdate?.id ? "Cập nhật QA" : "Tạo mới QA"}</>
                                },
                                onReset: () => navigate('/admin/qa'),
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
                                    label="Người hỏi"
                                    name="name_q"
                                    rules={[
                                        { required: true, message: 'Vui lòng không bỏ trống' },
                                    ]}
                                    placeholder="Nhập người hỏi"
                                />
                            </Col>

                            <Col span={24} md={6}>
                                <ProFormText
                                    label="Email Người hỏi"
                                    name="email_q"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Cấp độ"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormText
                                    label="Phone Người hỏi"
                                    name="phone_q"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Phone Người hỏi"
                                />
                            </Col>
                             <Col span={24} md={6}>
                               <ProFormDatePicker
                                label="Thời gian hỏi"
                                name="time_q"
                                fieldProps={{
                                    format: 'DD/MM/YYYY HH:mm',
                                    showTime: true,
                                }}
                                rules={[{ required: true, message: 'Vui lòng chọn thời gian hỏi' }]}
                                placeholder="dd/mm/yyyy hh:mm"
                                />
                            </Col>
                           

                        </Row>
                        <Row gutter={[20, 20]}>

                            <Col span={24} md={6}>
                                <ProFormText
                                    label="Người trả lời"
                                    name="name_a"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập Người trả lời"
                                />
                            </Col>

                            <Col span={24} md={6}>
                                 <ProFormDatePicker
                                     label="Thời gian trả lời"
                                    name="time_a"
                                    fieldProps={{
                                        format: 'DD/MM/YYYY HH:mm',
                                        showTime: true,
                                    }}
                                    rules={[{ required: true, message: 'Vui lòng chọn thời gian hỏi' }]}
                                    placeholder="dd/mm/yyyy hh:mm"
                                />
                                
                            </Col>

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
                            <Col span={24}>
                                <ProForm.Item
                                    name="content_q"
                                    label="Nội dung câu hỏi"
                                    rules={[{ required: true, message: 'Vui lòng nhập Nội dung câu hỏi!' }]}
                                >
                                    <ReactQuill
                                        theme="snow"
                                        value={value_q}
                                        onChange={setValueQ}
                                    />
                                </ProForm.Item>
                            </Col>
                             <Col span={24}>
                                <ProForm.Item
                                    name="content_a"
                                    label="Nội dung trả lời"
                                    rules={[{ required: true, message: 'Vui lòng nhập Nội dung trả lời!' }]}
                                >
                                    <ReactQuill
                                        theme="snow"
                                        value={value_a}
                                        onChange={setValueA}
                                    />
                                </ProForm.Item>
                            </Col>
                        </Row>
                        <Divider />
                    </ProForm>
                </ConfigProvider>

            </div>
        </div>
    )
}

export default ViewUpsertQA;
import { Breadcrumb, Col, ConfigProvider, Divider, Form, Modal, Row, Upload, message, notification } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DebounceSelect } from "../user/debouce.select";
import { FooterToolbar, ProForm,  ProFormDigit, ProFormSwitch, ProFormText } from "@ant-design/pro-components";
import styles from 'styles/admin.module.scss';
import { IAppSelect } from "@/types/backend";
import { useState, useEffect } from 'react';
import { callCreateConfig, callFetchAllSkill, callFetchApp, callFetchConfigById, callUpdateConfig, callUploadSingleFile } from "@/config/api";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CheckSquareOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import enUS from 'antd/lib/locale/en_US';
import { IConfig } from "@/types/backend";
import { v4 as uuidv4 } from 'uuid';
import { useAppSelector } from "@/redux/hooks";

interface IConfigLogo {
    name: string;
    uid: string;
}

const ViewUpsertConfig = (props: any) => {
    const [apps, setApps] = useState<IAppSelect[]>([]);
    
    const navigate = useNavigate();
    const [value, setValue] = useState<string>("");

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // config id
    const [dataUpdate, setDataUpdate] = useState<IConfig | null>(null);
    const [form] = Form.useForm();

    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);

    const [dataLogo, setDataLogo] = useState<IConfigLogo[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const is_admin = useAppSelector(state => state.account.user._admin);
    const app = useAppSelector(state => state.account.user.app);

    const [fileList, setFileList] = useState<any[]>([]);

    useEffect(() => {
        const init = async () => {
           

            if (id) {
                const res = await callFetchConfigById(id);

                console.log("res.data == " + JSON.stringify(res.data));
                if (res && res.data) {
                   

                    setDataUpdate(res.data);
                    
                    setDataLogo([{
                        name: res.data.icon,
                        uid: uuidv4()
                      }])

                    setFileList([{
                        uid: uuidv4(),
                        name: res.data.icon,
                        status: 'done',
                        url: `${import.meta.env.VITE_BACKEND_URL}/storage/config/${res.data.icon}`,
                        thumbUrl: `${import.meta.env.VITE_BACKEND_URL}/storage/config/${res.data.icon}`
                    }]);

                    setValue(res.data.description); 
                    
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
        if (dataLogo.length === 0) {
          message.error('Vui lòng upload ảnh Logo');
          return;
        }
      
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
      
        const config = {
          name: values.name,
          url: values.url,
          type: values.type,
          sort: values.sort,
          icon: dataLogo[0].name,
          app: finalAppParsed,
          active: values.active,
          description: value,
        };
      
        let res;
        if (dataUpdate?.id) {
          // ✅ Update mode
          res = await callUpdateConfig(config, dataUpdate.id);
          if (res?.data) {
            message.success("Cập nhật config thành công");
            navigate('/admin/config');
          } else {
            notification.error({
              message: 'Có lỗi xảy ra',
              description: res.message,
            });
          }
        } else {
          // ✅ Create mode
          res = await callCreateConfig(config);
          if (res?.data) {
            message.success("Tạo mới config thành công");
            navigate('/admin/config');
          } else {
            notification.error({
              message: 'Có lỗi xảy ra',
              description: res.message,
            });
          }
        }
      };
      

    const handleRemoveFile = (file: any) => {
        setFileList([]);        // cập nhật UI
        setDataLogo([]);        // clear dữ liệu logo backend
        return true;            // return true để AntD thực sự xóa ảnh
    }

    const handlePreview = async (file: any) => {
        if (!file.originFileObj) {
            setPreviewImage(file.url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
            return;
        }
        getBase64(file.originFileObj, (url: string) => {
            setPreviewImage(url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
        });
    };

    const getBase64 = (img: any, callback: any) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => callback(reader.result));
            reader.readAsDataURL(img);
        };
    
        const beforeUpload = (file: any) => {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJpgOrPng) {
                message.error('You can only upload JPG/PNG file!');
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('Image must smaller than 2MB!');
            }
            return isJpgOrPng && isLt2M;
        };
    
        const handleChange = (info: any) => {
            setFileList(info.fileList); // cập nhật UI
            if (info.file.status === 'uploading') setLoadingUpload(true);
            if (info.file.status === 'done') setLoadingUpload(false);
            if (info.file.status === 'error') {
              setLoadingUpload(false);
              message.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi upload file.")
            }
          };
    
        const handleUploadFileLogo = async ({ file, onSuccess, onError }: any) => {
            try {
              const res = await callUploadSingleFile(file, "config");
              if (res && res.data) {
                const newFile = {
                  uid: uuidv4(),
                  name: res.data.fileName,
                  status: 'done',
                  url: `${import.meta.env.VITE_BACKEND_URL}/storage/config/${res.data.fileName}`,
                  thumbUrl: `${import.meta.env.VITE_BACKEND_URL}/storage/config/${res.data.fileName}`
                };
          
                setFileList([newFile]); // cập nhật fileList UI
                setDataLogo([{ name: res.data.fileName, uid: newFile.uid }]); // lưu vào state
                onSuccess && onSuccess('ok');
              } else {
                throw new Error(res.message);
              }
            } catch (error: any) {
              setFileList([]); // reset UI
              setDataLogo([]);
              onError && onError({ event: error });
            }
          };
          


    return (
        <div className={styles["upsert-container"]}>
            <div className={styles["title"]}>
                <Breadcrumb
                    separator=">"
                    items={[
                        {
                            title: <Link to="/admin/config">Quản lý Cấu hình</Link>,
                        },
                        {
                            title: 'Cập nhật Cấu hình',
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
                                    submitText: <>{dataUpdate?.id ? "Cập nhật Config" : "Tạo mới Config"}</>
                                },
                                onReset: () => navigate('/admin/config'),
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
                                    label="Tên"
                                    name="name"
                                    rules={[
                                        { required: true, message: 'Vui lòng không bỏ trống' },
                                    ]}
                                    placeholder="Nhập tên"
                                />
                            </Col>

                            <Col span={24} md={6}>
                                <ProFormText
                                    label="Url"
                                    name="url"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Url"
                                />
                            </Col>
                          
                            <Col span={24} md={6}>
                                <ProFormDigit
                                    label="Loại"
                                    name="type"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập loại"
                                />
                            </Col>
                           

                        </Row>
                        <Row gutter={[20, 20]}>
                            
                            <Modal
                                open={previewOpen}
                                title={previewTitle}
                                footer={null}
                                onCancel={() => setPreviewOpen(false)}
                                style={{ zIndex: 1500 }}
                            >
                                <img alt="configple" style={{ width: '100%' }} src={previewImage} />
                            </Modal>
                           
                            <Col span={24} md={6}>
                                <Form.Item
                                    labelCol={{ span: 24 }}
                                    label="Ảnh Logo"
                                    name="logo"
                                >
                                    <ConfigProvider locale={enUS}>
                                        <Upload
                                            name="logo"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            maxCount={1}
                                            multiple={false}
                                            customRequest={handleUploadFileLogo}
                                            beforeUpload={beforeUpload}
                                            onChange={handleChange}
                                            onRemove={(file) => handleRemoveFile(file)}
                                            onPreview={handlePreview}
                                            fileList={fileList}

                                        >
                                            <div>
                                                {loadingUpload ? <LoadingOutlined /> : <PlusOutlined />}
                                                <div style={{ marginTop: 8 }}>Upload</div>
                                            </div>
                                        </Upload>
                                    </ConfigProvider>
                                </Form.Item>

                            </Col>

                            <Col span={24} md={6}>
                                <ProFormDigit
                                    label="Sắp xếp"
                                    name="sort"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập sắp xếp"
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
                                    name="description"
                                    label="Mô tả"
                                    rules={[{ required: true, message: 'Vui lòng nhập Mô tả!' }]}
                                >
                                    <ReactQuill
                                        theme="snow"
                                        value={value}
                                        onChange={setValue}
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

export default ViewUpsertConfig;
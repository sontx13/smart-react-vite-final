import { Breadcrumb, Col, ConfigProvider, Divider, Form, Modal, Row, Upload, message, notification } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DebounceSelect } from "../user/debouce.select";
import { FooterToolbar, ProForm,  ProFormDigit, ProFormSwitch, ProFormText } from "@ant-design/pro-components";
import styles from 'styles/admin.module.scss';
import { useState, useEffect } from 'react';
import { callCreateExam, callFetchAllSkill, callFetchCompany, callFetchExamById, callUpdateExam, callUploadSingleFile } from "@/config/api";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CheckSquareOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import enUS from 'antd/lib/locale/en_US';
import { IExam } from "@/types/backend";
import { v4 as uuidv4 } from 'uuid';
import { useAppSelector } from "@/redux/hooks";

interface IExamLogo {
    name: string;
    uid: string;
}

export interface ICompanySelect {
    label: string;
    value: string;
    key?: string;
}

const ViewUpsertExam = (props: any) => {
    const [companies, setCompanies] = useState<ICompanySelect[]>([]);
    
    const navigate = useNavigate();
    const [value, setValue] = useState<string>("");

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // exam id
    const [dataUpdate, setDataUpdate] = useState<IExam | null>(null);
    const [form] = Form.useForm();

    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);

    const [dataLogo, setDataLogo] = useState<IExamLogo[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const is_admin = useAppSelector(state => state.account.user._admin);
    const company = useAppSelector(state => state.account.user.company);

    const [fileList, setFileList] = useState<any[]>([]);

    useEffect(() => {
        const init = async () => {
           

            if (id) {
                const res = await callFetchExamById(id);

                console.log("res.data == " + JSON.stringify(res.data));
                if (res && res.data) {
                   

                    setDataUpdate(res.data);
                    
                    setDataLogo([{
                        name: res.data.logo,
                        uid: uuidv4()
                      }])

                    setFileList([{
                        uid: uuidv4(),
                        name: res.data.logo,
                        status: 'done',
                        url: `${import.meta.env.VITE_BACKEND_URL}/storage/exam/${res.data.logo}`,
                        thumbUrl: `${import.meta.env.VITE_BACKEND_URL}/storage/exam/${res.data.logo}`
                    }]);

                    setValue(res.data.description); 
                    
                    setCompanies([
                        {
                            label: res.data.company?.name as string,
                            value: `${res.data.company?.id}@#$${res.data.company?.logo}` as string,
                            key: res.data.company?.id
                        }
                    ])

                    form.setFieldsValue({
                        ...res.data,
                        company: {
                            label: res.data.company?.name as string,
                            value: `${res.data.company?.id}@#$${res.data.company?.logo}` as string,
                            key: res.data.company?.id
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

    const onFinish = async (values: any) => {
        if (dataLogo.length === 0) {
          message.error('Vui lòng upload ảnh Logo');
          return;
        }
      
        // ✅ Tách thông tin company theo phân quyền
        let finalCompanyParsed = {
          id: company?.id || "",
          name: company?.name || "",
          logo: company?.logo || "",
        };
      
        if (is_admin && !company && values?.company?.value) {
          const cp = values.company.value.split('@#$');
          finalCompanyParsed = {
            id: cp[0],
            name: values.company.label,
            logo: cp[1] || "",
          };
        }
      
        const exam = {
          name: values.name,
          level: values.level,
          time_minutes: values.time_minutes,
          total_score: values.total_score,
          total_question: values.total_question,
          logo: dataLogo[0].name,
          description: value,
          company: finalCompanyParsed,
          active: values.active,
        };
      
        let res;
        if (dataUpdate?.id) {
          // ✅ Update mode
          res = await callUpdateExam(exam, dataUpdate.id);
          if (res?.data) {
            message.success("Cập nhật exam thành công");
            navigate('/admin/exam');
          } else {
            notification.error({
              message: 'Có lỗi xảy ra',
              description: res.message,
            });
          }
        } else {
          // ✅ Create mode
          res = await callCreateExam(exam);
          if (res?.data) {
            message.success("Tạo mới exam thành công");
            navigate('/admin/exam');
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
              const res = await callUploadSingleFile(file, "exam");
              if (res && res.data) {
                const newFile = {
                  uid: uuidv4(),
                  name: res.data.fileName,
                  status: 'done',
                  url: `${import.meta.env.VITE_BACKEND_URL}/storage/exam/${res.data.fileName}`,
                  thumbUrl: `${import.meta.env.VITE_BACKEND_URL}/storage/exam/${res.data.fileName}`
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
                            title: <Link to="/admin/exam">Quản lý Cuộc thi</Link>,
                        },
                        {
                            title: 'Cập nhật cuộc thi',
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
                                    submitText: <>{dataUpdate?.id ? "Cập nhật Exam" : "Tạo mới Exam"}</>
                                },
                                onReset: () => navigate('/admin/exam'),
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
                                <ProFormDigit
                                    label="Cấp độ"
                                    name="level"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Cấp độ"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormDigit
                                    label="Thời gian"
                                    name="time_minutes"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập thời gian"
                                    fieldProps={{
                                        addonAfter: "phút",
                                        formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                                        parser: (value) => +(value || '').replace(/\$\s?|(,*)/g, '')
                                    }}
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormDigit
                                    label="Số câu hỏi"
                                    name="total_question"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập số câu hỏi"
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
                                <img alt="example" style={{ width: '100%' }} src={previewImage} />
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
                                    label="Tổng điểm"
                                    name="total_score"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập tổng điểm"
                                />
                            </Col>

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

export default ViewUpsertExam;
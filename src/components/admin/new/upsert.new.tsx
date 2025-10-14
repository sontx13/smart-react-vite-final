import { Breadcrumb, Col, ConfigProvider, Divider, Form, Modal, Row, Upload, message, notification } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DebounceSelect } from "../user/debouce.select";
import { FooterToolbar, ProForm, ProFormDatePicker, ProFormSwitch, ProFormText } from "@ant-design/pro-components";
import styles from 'styles/admin.module.scss';
import { IAppSelect } from "@/types/backend";
import { useState, useEffect } from 'react';
import { callCreateNew, callFetchApp, callFetchCategory, callFetchNewById, callUpdateNew, callUploadSingleFile } from "@/config/api";
import ReactQuill, { contextType } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CheckSquareOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import enUS from 'antd/lib/locale/en_US';
import { INew } from "@/types/backend";
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs'
import { useAppSelector } from "@/redux/hooks";

interface INewLogo {
  name: string;
  uid: string;
}

const ViewUpsertNew = (props: any) => {
  const [apps, setApps] = useState<IAppSelect[]>([]);
  const [categories, setCategories] = useState<IAppSelect[]>([]);
  const navigate = useNavigate();
  const [value, setValue] = useState<string>("");

  let location = useLocation();
  let params = new URLSearchParams(location.search);
  const id = params?.get("id");
  const [dataUpdate, setDataUpdate] = useState<INew | null>(null);
  const [form] = Form.useForm();

  const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
  const [dataLogo, setDataLogo] = useState<INewLogo[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const is_admin = useAppSelector(state => state.account.user._admin);
  const app = useAppSelector(state => state.account.user.app);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(app?.id ? Number(app.id) : null);
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    if (app?.id) setSelectedAppId(Number(app.id));
  }, [app]);

 useEffect(() => {
  const init = async () => {
    if (!id) return;

    const res = await callFetchNewById(id);
    if (!res || !res.data) return;

    const newData = res.data;
    setDataUpdate(newData);
    setValue(newData.content);

    // --- Xác định app hiện tại ---
    const currentAppId = Number(newData.app?.id ?? app?.id ?? null);
    setSelectedAppId(currentAppId || null);

    // --- Lấy danh sách chuyên mục theo app ---
    let categoryOptions: IAppSelect[] = [];
    if (currentAppId) {
      const cateRes = await fetchCategoryList('', currentAppId);
      if (cateRes && cateRes.length > 0) categoryOptions = cateRes;
    }
    setCategories(categoryOptions);

    // --- Logo hiển thị ---
    if (newData.logo) {
      const logoUrl = `${import.meta.env.VITE_BACKEND_URL}/storage/appnew/${newData.logo}`;
      setDataLogo([{ name: newData.logo, uid: uuidv4() }]);
      setFileList([
        {
          uid: uuidv4(),
          name: newData.logo,
          status: 'done',
          url: logoUrl,
          thumbUrl: logoUrl,
        },
      ]);
    }

    // --- Gán giá trị App select ---
    const appSelect: IAppSelect = {
      label: newData.app?.name ?? '',
      value: `${newData.app?.id ?? ''}@#$${newData.app?.logo ?? ''}`,
      key: String(newData.app?.id ?? ''),
    };
    setApps([appSelect]);

    // --- Gán giá trị Category select ---
    const categorySelect =
      newData.category && newData.category.id
        ? {
            label: newData.category?.name ?? '',
            value: `${newData.category?.id}@#$${newData.category?.icon ?? ''}`,
            key: String(newData.category?.id),
          }
        : undefined;

    // --- Set giá trị cho form ---
    form.setFieldsValue({
      ...newData,
      app: appSelect,
      category: categorySelect,
    });
  };

  init();

  return () => {
    form.resetFields();
  };
}, [id]);



  // 🔹 Gọi API lấy danh sách App
  async function fetchAppList(name: string): Promise<IAppSelect[]> {
    const res = await callFetchApp(`page=1&size=100&name~'${name}'`);
    if (res && res.data) {
      return res.data.result.map((item: any) => ({
        label: item.name,
        value: `${item.id}@#$${item.logo}`,
        key: item.id,
      }));
    }
    return [];
  }

  // 🔹 Gọi API lấy danh sách Chuyên mục theo app.id
  async function fetchCategoryList(name: string, appId?: number) {
    if (!appId) return [];

    const query = `page=1&size=100&filter=app.id=${appId}${
      name ? `;name~'${name}'` : ''
    }`;

    const res = await callFetchCategory(query);
    if (res && res.data && res.data.result) {
      return res.data.result.map((item: any) => ({
        label: item.name,
        value: `${item.id}@#$${item.icon ?? ''}`,
        key: item.id,
      }));
    }
    return [];
  }

  // 🔹 Submit
  const onFinish = async (values: any) => {
    if (dataLogo.length === 0) {
      message.error('Vui lòng upload ảnh Logo');
      return;
    }

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

    const categoryValue = (() => {
        if (values.category) {
            const category = Array.isArray(values.category)
            ? values.category[0]
            : values.category;
            if (category?.value) {
            return Number(category.value.split('@#$')[0]);
            }
        }
        return null;
        })();
        
     
     const categoryData = categoryValue ? { id: categoryValue } : null;

    const appnew = {
      title: values.title,
      category: categoryData ? { id: categoryData.id } as any : undefined,
      public_at: values.public_at,
      url: values.url,
      type: values.type,
      sort: values.sort,
      description: values.description,
      logo: dataLogo[0].name,
      content: value,
      app: finalAppParsed,
      active: values.active,
    };

    let res;
    if (dataUpdate?.id) {
      res = await callUpdateNew(appnew, dataUpdate.id);
      if (res?.data) {
        message.success("Cập nhật New thành công");
        navigate('/admin/new');
      } else {
        notification.error({
          message: 'Có lỗi xảy ra',
          description: res.message,
        });
      }
    } else {
      res = await callCreateNew(appnew);
      if (res?.data) {
        message.success("Tạo mới New thành công");
        navigate('/admin/new');
      } else {
        notification.error({
          message: 'Có lỗi xảy ra',
          description: res.message,
        });
      }
    }
  };

  // 🔹 Upload ảnh
  const handleUploadFileLogo = async ({ file, onSuccess, onError }: any) => {
    try {
      const res = await callUploadSingleFile(file, "appnew");
      if (res && res.data) {
        const appnewFile = {
          uid: uuidv4(),
          name: res.data.fileName,
          status: 'done',
          url: `${import.meta.env.VITE_BACKEND_URL}/storage/appnew/${res.data.fileName}`,
          thumbUrl: `${import.meta.env.VITE_BACKEND_URL}/storage/appnew/${res.data.fileName}`
        };
        setFileList([appnewFile]);
        setDataLogo([{ name: res.data.fileName, uid: appnewFile.uid }]);
        onSuccess && onSuccess('ok');
      } else {
        throw new Error(res.message);
      }
    } catch (error: any) {
      setFileList([]);
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
            { title: <Link to="/admin/appnew">Quản lý Tin tức</Link> },
            { title: dataUpdate?.id ? 'Cập nhật Tin tức' : 'Tạo mới Tin tức' },
          ]}
        />
      </div>

      <ConfigProvider locale={enUS}>
        <ProForm
          form={form}
          onFinish={onFinish}
          submitter={{
            searchConfig: {
              resetText: "Hủy",
              submitText: <>{dataUpdate?.id ? "Cập nhật New" : "Tạo mới New"}</>
            },
            onReset: () => navigate('/admin/appnew'),
            render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
            submitButtonProps: { icon: <CheckSquareOutlined /> },
          }}
        >
          <Row gutter={[20, 20]}>
            <Col span={24} md={6}>
              <ProFormText
                label="Tiêu đề"
                name="title"
                rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                placeholder="Nhập title"
              />
            </Col>

            <Col span={24} md={12}>
              <ProFormText
                label="Tóm tắt"
                name="description"
                rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                placeholder="Nhập tóm tắt"
              />
            </Col>

            <Col span={24} md={6}>
                <ProFormDatePicker
                        label="Ngày đăng"
                    name="public_at"
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
              <Form.Item labelCol={{ span: 24 }} label="Ảnh Logo" name="logo">
                <Upload
                  name="logo"
                  listType="picture-card"
                  maxCount={1}
                  multiple={false}
                  customRequest={handleUploadFileLogo}
                  onRemove={() => { setFileList([]); setDataLogo([]); return true; }}
                  fileList={fileList}
                >
                  <div>
                    {loadingUpload ? <LoadingOutlined /> : <PlusOutlined />}
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>

            <Col span={24} md={6}>
              <ProForm.Item
                name="app"
                label="Thuộc App"
                rules={is_admin && !app ? [{ required: true, message: 'Vui lòng chọn app!' }] : []}
                initialValue={!is_admin || app ? { label: app?.name, value: `${app?.id}@#$${app?.logo}` } : undefined}
              >
                {is_admin && !app ? (
                  <DebounceSelect
                    allowClear
                    showSearch
                    defaultValue={apps}
                    value={apps}
                    placeholder="Chọn app"
                    fetchOptions={fetchAppList}
                   onChange={async (appnewValue: any) => {
                        if (!appnewValue) {
                            setApps([]);
                            setSelectedAppId(null);
                            setCategories([]);
                            form.setFieldValue("category", undefined); // reset form value
                            return;
                        }

                        const appId = Number((appnewValue.value as string).split('@#$')[0]);
                        setApps([appnewValue as IAppSelect]);
                        setSelectedAppId(appId);

                        // reset chuyên mục cũ khi đổi app
                        form.setFieldValue("category", undefined);
                        setCategories([]);

                        // gọi API chuyên mục mới
                        const data = await fetchCategoryList('', appId);
                        console.log("✅ categories fetched:", data);
                        setCategories(data);

                        if (data.length === 1) {
                            form.setFieldValue('category', data[0]);
                        }
                    }}

                    style={{ width: '100%' }}
                  />
                ) : (
                  <span>{app?.name}</span>
                )}
              </ProForm.Item>
            </Col>

           {selectedAppId !== null && (
            <Col span={24} md={6}>
                <ProForm.Item
                    name="category"
                    label="Thuộc Chuyên mục"
                    rules={[{ required: true, message: 'Vui lòng chọn chuyên mục!' }]}
                    >
                    <DebounceSelect
                        allowClear
                        showSearch
                        placeholder="Chọn chuyên mục"
                        fetchOptions={(name) => fetchCategoryList(name, selectedAppId ?? undefined)}
                        onChange={(newCateValue: any) => {
                        if (newCateValue) {
                            form.setFieldValue("category", newCateValue);
                            setCategories([newCateValue]);
                        } else {
                            form.setFieldValue("category", undefined);
                            setCategories([]);
                        }
                        }}
                        style={{ width: '100%' }}
                        disabled={!selectedAppId}
                    />
                    </ProForm.Item>
            </Col>
            )}


            <Col span={24} md={6}>
              <ProFormSwitch
                label="Trạng thái"
                name="active"
                checkedChildren="ACTIVE"
                unCheckedChildren="INACTIVE"
                initialValue={true}
              />
            </Col>

            <Col span={24}>
              <ProForm.Item
                name="content"
                label="Nội dung"
                rules={[{ required: true, message: 'Vui lòng nhập Nội dung!' }]}
              >
                <ReactQuill theme="snow" value={value} onChange={setValue} />
              </ProForm.Item>
            </Col>
          </Row>

          <Divider />
        </ProForm>
      </ConfigProvider>
    </div>
  );
};

export default ViewUpsertNew;

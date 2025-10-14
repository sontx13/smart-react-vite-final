import { Button, Col, Form, Input, Row, Select, notification } from 'antd';
import { EnvironmentOutlined, MonitorOutlined } from '@ant-design/icons';
import { ProForm } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { callFetchCompany } from '@/config/api'; // Đảm bảo bạn có hàm này

const SearchClient = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [form] = Form.useForm();
    const [optionsCompany, setOptionsCompany] = useState<{ label: string, value: string }[]>([]);
    const [searchParams] = useSearchParams();

    // Gọi danh sách đơn vị ngay khi component mount
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await callFetchCompany(`page=1&size=100`);
                if (res?.data?.result) {
                    const arr = res.data.result.map((item: any) => ({
                        label: item.name,
                        value: item.id.toString()
                    }));
                    setOptionsCompany(arr);
                }
            } catch (err) {
                console.error("Lỗi load đơn vị:", err);
                setOptionsCompany([]);
            }
        };
        fetchCompanies();
    }, []);

    // Khi URL thay đổi (VD: reload trang), set lại form từ query string
    useEffect(() => {
        const queryName = searchParams.get("name") || '';
        const queryCompany = searchParams.get("company") || '';
        form.setFieldsValue({
            name: queryName,
            company: queryCompany
        });
    }, [location.search]);

    const onFinish = async (values: any) => {
        const { name, company } = values;

        if (!name && !company) {
            notification.error({
                message: 'Thiếu thông tin tìm kiếm',
                description: "Vui lòng nhập tên hoặc chọn đơn vị tổ chức để tìm kiếm."
            });
            return;
        }

        const filters: string[] = [];
        if (name) filters.push(`name ~ '${name}'`);
        if (company) filters.push(`company.id=${company}`);
        const query = `filter=${encodeURIComponent(filters.join(' and '))}`;

        // Có thể đính kèm name & company vào query nếu cần giữ lại khi reload
        const queryParams = new URLSearchParams();
        if (name) queryParams.append("name", name);
        if (company) queryParams.append("company", company);
        queryParams.append("filter", filters.join(' and '));

        navigate(`/exam?${queryParams.toString()}`);
    };

    return (
        <ProForm
            form={form}
            onFinish={onFinish}
            submitter={{ render: () => <></> }}
        >
            <Row gutter={[20, 20]}>
                <Col span={24}><h2>Tìm kiếm phần mềm</h2></Col>
                <Col span={24} md={16}>
                    <ProForm.Item
                        name="skills"
                    >
                        <Select
                            mode="multiple"
                            allowClear
                        />
                    </ProForm.Item>
                </Col>

                <Col span={24} md={10}>
                    <ProForm.Item name="company">
                        <Select
                            showSearch
                            allowClear
                            placeholder={<><EnvironmentOutlined /> Đơn vị tổ chức</>}
                            options={optionsCompany}
                            filterOption={(input, option) =>
                                (option?.label as string).toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    </ProForm.Item>
                </Col>

                <Col span={12} md={4}>
                    <Button type="primary" onClick={() => form.submit()} block>
                        Tìm kiếm
                    </Button>
                </Col>
            </Row>
        </ProForm>
    );
};

export default SearchClient;

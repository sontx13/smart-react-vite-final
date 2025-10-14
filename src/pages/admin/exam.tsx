import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchExam } from "@/redux/slice/examSlide";
import { ICompanySelect, IExam } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns, ProForm, ProFormSelect } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callDeleteExam, callFetchCompany } from "@/config/api";
import queryString from 'query-string';
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfIn, sfLike } from "spring-filter-query-builder";
import { useNavigate } from "react-router-dom";
import { DebounceSelect } from "@/components/admin/user/debouce.select";



const ExamPage = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IExam | null>(null);
    

    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.exam.isFetching);
    const meta = useAppSelector(state => state.exam.meta);
    const companies = useAppSelector(state => state.exam.result);

    const is_admin = useAppSelector(state => state.account.user._admin);
    const company = useAppSelector(state => state.account.user.company);

    console.log("is_admin=="+is_admin);
    console.log("company=="+ JSON.stringify(company));

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const handleDeleteExam = async (id: string | undefined) => {
        if (id) {
            const res = await callDeleteExam(id);
            if (res && +res.statusCode === 200) {
                message.success('Xóa Exam thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

     // Usage of DebounceSelect
    async function fetchCompanyList(name: string): Promise<ICompanySelect[]> {
        const res = await callFetchCompany(`page=1&size=100&name ~ '${name}'`);
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

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<IExam>[] = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (
                    <>
                        {(index + 1) + (meta.page - 1) * (meta.pageSize)}
                    </>)
            },
            hideInSearch: true,
        },
        {
            title: 'Tên',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Đơn vị',
            dataIndex: ["company", "name"],
            renderFormItem: (item, props, form) => {
                if (!is_admin || company) {
                    // Nếu không phải admin thì không cho chọn, mà gán cố định Đơn vị hiện tại
                    form.setFieldValue('company', {
                        label: company?.name,
                        value: company?.id,
                    });
                    return null; // không hiển thị ô chọn
                }
            
                // Admin thì được chọn tất cả Đơn vị
                return (
                    <ProForm.Item name="company">
                        <DebounceSelect
                            allowClear
                            showSearch
                            placeholder="Chọn Đơn vị"
                            fetchOptions={fetchCompanyList}
                            style={{ width: '100%' }}
                        />
                    </ProForm.Item>
                );
            },
            sorter: true,
        },
        {
            title: 'Cấp độ',
            dataIndex: 'level',
            sorter: true,
            hideInSearch: true,
        },
        {
            title: 'Thời gian (phút)',
            dataIndex: 'time_minutes',
            sorter: true,
            hideInSearch: true,
        },
        {
            title: 'Số câu hỏi',
            dataIndex: 'total_question',
            sorter: true,
            hideInSearch: true,
        },
        {
            title: 'Tổng điểm',
            dataIndex: 'total_score',
            sorter: true,
            hideInSearch: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            render(dom, entity, index, action, schema) {
                return <>
                    <Tag color={entity.active ? "lime" : "red"} >
                        {entity.active ? "ACTIVE" : "INACTIVE"}
                    </Tag>
                </>
            },
            hideInSearch: true,
        },
        {
            title: 'CreatedAt',
            dataIndex: 'createdAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.createdAt ? dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'UpdatedAt',
            dataIndex: 'updatedAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.updatedAt ? dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {

            title: 'Actions',
            hideInSearch: true,
            width: 50,
            render: (_value, entity, _index, _action) => (
                <Space>
                    < Access
                        permission={ALL_PERMISSIONS.EXAMS.UPDATE}
                        hideChildren
                    >
                        <EditOutlined
                             style={{
                                fontSize: 20,
                                color: '#ffa500',
                            }}
                            type=""
                            onClick={() => {
                                navigate(`/admin/exam/upsert?id=${entity.id}`)
                            }}
                        />
                    </Access >
                    <Access
                        permission={ALL_PERMISSIONS.EXAMS.DELETE}
                        hideChildren
                    >
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa exam"}
                            description={"Bạn có chắc chắn muốn xóa exam này ?"}
                            onConfirm={() => handleDeleteExam(entity.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <span style={{ cursor: "pointer", margin: "0 10px" }}>
                                <DeleteOutlined
                                    style={{
                                        fontSize: 20,
                                        color: '#ff4d4f',
                                    }}
                                />
                            </span>
                        </Popconfirm>
                    </Access>
                </Space >
            ),

        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        let filterParts: string[] = [];
      
        if (clone.name) filterParts.push(`name ~ '${clone.name}'`);

        // Lọc theo company check is_admin và company
        if (is_admin && clone?.company) {
            const companyId = typeof clone.company === 'string'
                ? clone.company
                : clone.company.value;
            filterParts.push(`company.id=${companyId}`);
        } else if (!is_admin && company) {
            filterParts.push(`company.id=${company.id}`);
        }
      
        const queryObj: any = {
          page: clone.current,
          size: clone.pageSize,
        };
      
        if (filterParts.length > 0) {
            queryObj.filter = filterParts.join(" and ");
        }
      
        // Xử lý sort
        let sortBy = "";
        const fields = ["name", "createdAt", "updatedAt"];
        for (const field of fields) {
          if (sort && sort[field]) {
            sortBy = `${field},${sort[field] === 'ascend' ? 'asc' : 'desc'}`;
            break;
          }
        }
      
        queryObj.sort = sortBy || "updatedAt,desc";
      
        // Xóa các field không cần
        delete clone.current;
        delete clone.pageSize;
        delete clone.name;
        delete clone.company;
      
        return queryString.stringify(queryObj);
    };
      

    return (
        <div>
            <Access
                permission={ALL_PERMISSIONS.EXAMS.GET_PAGINATE}
            >
                <DataTable<IExam>
                    actionRef={tableRef}
                    headerTitle="Danh sách Cuộc thi"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={companies}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchExam({ query }))
                    }}
                    scroll={{ x: true }}
                    pagination={
                        {
                            current: meta.page,
                            pageSize: meta.pageSize,
                            showSizeChanger: true,
                            total: meta.total,
                            showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) }
                        }
                    }
                    rowSelection={false}
                    toolBarRender={(_action, _rows): any => {
                        return (
                            <Button
                                icon={<PlusOutlined />}
                                type="primary"
                                onClick={() => navigate('upsert')}
                            >
                                Thêm mới
                            </Button>
                        );
                    }}
                />
            </Access>
        </div >
    )
}

export default ExamPage;
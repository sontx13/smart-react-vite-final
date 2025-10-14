import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchInfor } from "@/redux/slice/inforSlide";
import { IInfor } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns, ProForm, ProFormSelect } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callDeleteInfor, callFetchApp } from "@/config/api";
import queryString from 'query-string';
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfIn, sfLike } from "spring-filter-query-builder";
import { useNavigate } from "react-router-dom";
import { DebounceSelect } from "@/components/admin/user/debouce.select";
import { IAppSelect } from "@/types/backend";

const InforPage = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IInfor | null>(null);
    

    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.infor.isFetching);
    const meta = useAppSelector(state => state.infor.meta);
    const apps = useAppSelector(state => state.infor.result);

    const is_admin = useAppSelector(state => state.account.user._admin);
    const app = useAppSelector(state => state.account.user.app);

    //console.log("is_admin=="+is_admin);
    //console.log("app=="+ JSON.stringify(app));

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const handleDeleteInfor = async (id: string | undefined) => {
        if (id) {
            const res = await callDeleteInfor(id);
            if (res && +res.statusCode === 200) {
                message.success('Xóa Infor thành công');
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
    async function fetchAppList(name: string): Promise<IAppSelect[]> {
        const res = await callFetchApp(`page=1&size=100&name ~ '${name}'`);
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

    const columns: ProColumns<IInfor>[] = [
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
            title: 'App',
            dataIndex: ["app", "name"],
            renderFormItem: (item, props, form) => {
                if (!is_admin || app) {
                    // Nếu không phải admin thì không cho chọn, mà gán cố định Đơn vị hiện tại
                    form.setFieldValue('app', {
                        label: app?.name,
                        value: app?.id,
                    });
                    return null; // không hiển thị ô chọn
                }
            
                // Admin thì được chọn tất cả Đơn vị
                return (
                    <ProForm.Item name="app">
                        <DebounceSelect
                            allowClear
                            showSearch
                            placeholder="Chọn App"
                            fetchOptions={fetchAppList}
                            style={{ width: '100%' }}
                        />
                    </ProForm.Item>
                );
            },
            sorter: true,
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            sorter: true,
            hideInSearch: true,
        },
        {
            title: 'Sắp xếp',
            dataIndex: 'sort',
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
                        permission={ALL_PERMISSIONS.INFORS.UPDATE}
                        hideChildren
                    >
                        <EditOutlined
                             style={{
                                fontSize: 20,
                                color: '#ffa500',
                            }}
                            type=""
                            onClick={() => {
                                navigate(`/admin/infor/upsert?id=${entity.id}`)
                            }}
                        />
                    </Access >
                    <Access
                        permission={ALL_PERMISSIONS.INFORS.DELETE}
                        hideChildren
                    >
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa infor"}
                            description={"Bạn có chắc chắn muốn xóa infor này ?"}
                            onConfirm={() => handleDeleteInfor(entity.id)}
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
       
               // Lọc theo app check is_admin và app
               if (is_admin && clone?.app) {
                   const appId = typeof clone.app === 'string'
                       ? clone.app
                       : clone.app.value;
                   filterParts.push(`app.id=${appId}`);
               } else if (!is_admin && app) {
                   filterParts.push(`app.id=${app.id}`);
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
               delete clone.app;
             
               return queryString.stringify(queryObj);
       };
      

    return (
        <div>
            <Access
                permission={ALL_PERMISSIONS.INFORS.GET_PAGINATE}
            >
                <DataTable<IInfor>
                    actionRef={tableRef}
                    headerTitle="Danh sách thông tin trợ giúp"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={apps}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        if (query.includes("app.id=") && query.endsWith("app.id=")) {
                            // Không fetch nếu filter rỗng
                            return;
                        }
                        dispatch(fetchInfor({ query }))
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

export default InforPage;
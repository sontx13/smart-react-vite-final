import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchZmau } from "@/redux/slice/zmauSlide";
import { IZmau } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns, ProForm, ProFormSelect } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callDeleteZmau, callFetchApp } from "@/config/api";
import queryString from 'query-string';
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfIn, sfLike } from "spring-filter-query-builder";
import { useNavigate } from "react-router-dom";
import { DebounceSelect } from "@/components/admin/user/debouce.select";
import { IAppSelect } from "@/types/backend";

const ZmauPage = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IZmau | null>(null);
    
    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.zmau.isFetching);
    const meta = useAppSelector(state => state.zmau.meta);
    const apps = useAppSelector(state => state.zmau.result);

    const is_admin = useAppSelector(state => state.account.user._admin);
    const app = useAppSelector(state => state.account.user.app);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const handleDeleteZmau = async (id: string | undefined) => {
        if (id) {
            const res = await callDeleteZmau(id);
            if (res && +res.statusCode === 200) {
                message.success('Xóa Zmau thành công');
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

    const columns: ProColumns<IZmau>[] = [
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
            title: 'Avatar',
            dataIndex: 'avatar',
            sorter: true,
            hideInSearch: true,
        },
        {
            title: 'Phone_number',
            dataIndex: 'phone_number',
            sorter: true,
            hideInSearch: true,
        },
        {
            title: 'zid',
            dataIndex: 'zid',
            sorter: true,
            hideInSearch: true,
        },
         {
            title: 'App',
            dataIndex: ["app", "name"],
            renderFormItem: (item, props, form) => {
                 if (!is_admin && app) {
                    form.setFieldValue('app', {
                        label: app.name,
                        value: app.id,
                    });
                    return null;
                }

                // Nếu là admin => hiển thị select, có name để ProTable đọc được giá trị
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
                permission={ALL_PERMISSIONS.ZMAUS.GET_PAGINATE}
            >
                <DataTable<IZmau>
                    actionRef={tableRef}
                    headerTitle="Danh sách Người dùng Zalo"
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
                        dispatch(fetchZmau({ query }))
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
                   
                />
            </Access>
        </div >
    )
}

export default ZmauPage;
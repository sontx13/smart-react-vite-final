import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import { IArticle } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined, SyncOutlined } from "@ant-design/icons";
import { ActionType, ProColumns, ProForm, ProFormSelect } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callCreateArticle, callDeleteArticle, callFetchApp, callFetchCategory } from "@/config/api";
import queryString from 'query-string';
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { useNavigate } from "react-router-dom";
import { DebounceSelect } from "@/components/admin/user/debouce.select";
import { IAppSelect } from "@/types/backend";
import { fetchArticle } from "@/redux/slice/articleSlide";

const ArticlePage = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IArticle | null>(null);
    

    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.article.isFetching);
    const meta = useAppSelector(state => state.article.meta);
    const apps = useAppSelector(state => state.article.result);

    const is_admin = useAppSelector(state => state.account.user._admin);
    const app = useAppSelector(state => state.account.user.app);

    //console.log("is_admin=="+is_admin);
    //console.log("app=="+ JSON.stringify(app));

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const handleDeleteAriticle = async (id: string | undefined) => {
           if (id) {
               const res = await callDeleteArticle(id);
               if (res && +res.statusCode === 200) {
                   message.success('Xóa Ariticle thành công');
                   reloadTable();
               } else {
                   notification.error({
                       message: 'Có lỗi xảy ra',
                       description: res.message
                   });
               }
           }
       }

const convertToInstant = (dateStr?: string): Date | null => {
  if (!dateStr) return null;

  const parts = dateStr.trim().split(" ");
  if (parts.length !== 2) return null;

  const [datePart, timePart] = parts;
  const [day, month, year] = datePart.split("/").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  // Tạo Date theo UTC để không bị lệch múi giờ
  return new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
};


    const handleSyncArticle = async () => {
    try {
        const res = await callFetchCategory(`page=1&size=100`);
        if (!res || !res.data) {
        notification.error({
            message: "Không có chuyên mục đồng bộ",
            description: res?.message || "Dữ liệu rỗng",
        });
        return;
        }

        const list = res.data.result;
        let totalSaved = 0;

        // Duyệt từng chuyên mục
        for (const cate of list) {
        if (!cate.url) continue;

        try {
            //const response = await fetch(cate.url);
            const response = await fetch(`https://vnptbacninh.com/api/v1/proxy/fetch?url=${cate.url.trim()}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'application/json, text/plain, */*',
                },
                });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const json = await response.json();

            // Duyệt từng bài viết
            if (json.items && Array.isArray(json.items)) {
            for (const art of json.items) {
                const article: IArticle = {
                idArticle: art.id,
                title: art.title,
                titleCut: art.title_cut || art.title,
                imageUrl: art.imageURL || "",
                summary: art.summary || "",
                createdDate: convertToInstant(art.createdDate) || new Date(),
                // createdDate: art.createdDate || "",
                urlDetail: art.urlDetail || "",
                content: art.content || "",
                isNew: art.isNew || "",
                source: art.source || "",
                author: art.author || "",
                strucId: art.strucId || "",
                viewCount: art.viewCount || 0,
                cateName: cate.name || "",
                cateId: Number(cate.id) || 0,
                otherProps: JSON.stringify(art.otherProps || {}),
                timeSync: new Date().toISOString(),
                app: {
                    id: "11"
                },
                category: {
                    id: String(cate.id)
                },
                };

                try {
                const resCreate = await callCreateArticle(article);
                if (resCreate?.data) {
                    totalSaved++;
                    console.log(`✅ Đã lưu: ${article.title}`);
                } else {
                    console.warn(`⚠️ Lưu thất bại: ${article.title}`);
                }
                } catch (err) {
                console.error(`❌ Lỗi khi lưu: ${article.title}`, err);
                }
            }
            }
        } catch (err) {
            console.error(`❌ Lỗi fetch URL: ${cate.url}`, err);
        }
        }

        notification.success({
        message: "Đồng bộ thành công",
        description: `Đã lưu ${totalSaved} bài viết vào cơ sở dữ liệu.`,
        });
    } catch (error) {
        console.error("❌ Lỗi tổng:", error);
        notification.error({
        message: "Lỗi khi đồng bộ",
        });
    }
    };


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

    async function fetchCategoryList(name: string, appId?: string): Promise<IAppSelect[]> {
        let filterParts: string[] = [];

        if (name) {
            filterParts.push(`name~'${name}'`);
        }

        if (appId) {
            filterParts.push(`app.id=${appId}`);
        }

        const filterQuery = filterParts.length > 0 ? `&filter=${filterParts.join(' and ')}` : '';

        const res = await callFetchCategory(`page=1&size=100${filterQuery}`);
        if (res && res.data) {
            const list = res.data.result;
            return list.map(item => ({
                label: item.name as string,
                value: item.id as string
            }));
        } else {
            return [];
        }
    }


    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<IArticle>[] = [
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
            title: 'Tiêu đề',
            dataIndex: 'titleCut',
            sorter: true,
        },
         {
            title: 'Tác giả',
            dataIndex: 'author',
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
                            onChange={() => {
                                form.setFieldValue('category', null); // ✅ reset category
                            }}
                        />
                    </ProForm.Item>
                );
            },
            sorter: true,
        },
         {
            title: 'Chuyên mục',
            dataIndex: ["category", "name"],
            renderFormItem: (item, props, form) => {
                return (
                <ProForm.Item
                    noStyle
                    shouldUpdate={(prev, curr) => prev.app !== curr.app} // ✅ Khi app thay đổi thì render lại
                >
                    {({ getFieldValue }) => {
                    const appValue = getFieldValue('app');
                    const appId = appValue?.value || app?.id; // nếu user không được chọn app thì dùng app hiện tại

                    return (
                        <ProForm.Item name="category">
                        <DebounceSelect
                            allowClear
                            showSearch
                            placeholder="Chọn chuyên mục"
                            fetchOptions={(name) => fetchCategoryList(name, appId)} // ✅ truyền appId
                            style={{ width: '100%' }}
                            disabled={!appId} // ✅ tránh load khi chưa có appId
                        />
                        </ProForm.Item>
                    );
                    }}
                </ProForm.Item>
                );
            },
            sorter: true,
            },
        {
            title: 'Ngày đăng',
            dataIndex: 'createdDate',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.createdDate ? dayjs(record.createdDate).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Thời gian đồng bộ',
            dataIndex: 'timeSync',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.timeSync ? dayjs(record.timeSync).format('DD-MM-YYYY HH:mm:ss') : ""}</>
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
                    <Access
                        permission={ALL_PERMISSIONS.ARTICLES.DELETE}
                        hideChildren
                    >
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa new"}
                            description={"Bạn có chắc chắn muốn xóa new này ?"}
                            onConfirm={() => handleDeleteAriticle(entity.id)}
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

        // ==============================
        // 🔹 1. Lọc theo tiêu đề (search title)
        // ==============================
        if (clone.title) {
            filterParts.push(`title~'${clone.title}'`);
        }

        // ==============================
        // 🔹 2. Xác định app hiện tại
        // ==============================
        let currentAppId: string | undefined;

        if (is_admin && clone?.app) {
            // Admin tổng: lấy app chọn từ form
            currentAppId = typeof clone.app === 'string'
                ? clone.app
                : clone.app.value;
            filterParts.push(`app.id=${currentAppId}`);
        } else if (!is_admin && app) {
            // Admin app / user thường: dùng app mặc định của user
            currentAppId = app.id;
            filterParts.push(`app.id=${currentAppId}`);
        }

        // ==============================
        // 🔹 3. Lọc theo chuyên mục (category)
        // ==============================
        if (clone?.category) {
            const categoryId = typeof clone.category === 'string'
                ? clone.category
                : clone.category.value;

            // ⚠️ Ép thêm app.id để ràng buộc chặt chẽ
            if (currentAppId) {
                filterParts.push(`app.id=${currentAppId}`);
            }
            filterParts.push(`category.id=${categoryId}`);
        }

        // ==============================
        // 🔹 4. Chuẩn bị query object
        // ==============================
        const queryObj: any = {
            page: clone.current,
            size: clone.pageSize,
        };

        if (filterParts.length > 0) {
            queryObj.filter = filterParts.join(" and ");
        }

        // ==============================
        // 🔹 5. Sắp xếp
        // ==============================
        let sortBy = "";
        const fields = ["title", "timeSync", "createdDate"];
        for (const field of fields) {
            if (sort && sort[field]) {
                sortBy = `${field},${sort[field] === 'ascend' ? 'asc' : 'desc'}`;
                break;
            }
        }
        queryObj.sort = sortBy || "createdDate,desc";

        // ==============================
        // 🔹 6. Dọn dẹp param rác
        // ==============================
        delete clone.current;
        delete clone.pageSize;
        delete clone.title;
        delete clone.app;
        delete clone.category;

        // ==============================
        // 🔹 7. Trả về query string hoàn chỉnh
        // ==============================
        return queryString.stringify(queryObj);
    };

    return (
        <div>
            <Access
                permission={ALL_PERMISSIONS.ARTICLES.GET_PAGINATE}
            >
                <DataTable<IArticle>
                    actionRef={tableRef}
                    headerTitle="Danh sách tin tức"
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
                        dispatch(fetchArticle({ query }))
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
                                icon={<SyncOutlined  />}
                                type="primary"
                                onClick={() => handleSyncArticle()}
                            >
                                Đồng bộ tin tức tất cả chuyên mục
                            </Button>
                        );
                    }}
                />
            </Access>
        </div >
    )
}

export default ArticlePage;